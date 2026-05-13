// app/(main)/quizzes/[quizId]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { PlusCircle, ListFilter, ToggleRight } from "lucide-react";
import QuizHeader from "@/components/quiz/QuizHeader";
import axios from "axios";
import AddTrueFalseModal from "@/components/quiz/AddTrueFalseModal";
import AddMultipleChoiceModal from "@/components/quiz/AddMultipleChoiceModal"; // IMPORT MODAL MỚI
import QuestionCard from "@/components/quiz/QuestionCard";
import { useParams, useRouter } from "next/navigation";

interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}
interface Question {
  id: number;
  question_text: string;
  question_type: string;
  time_limit_seconds: number;
  options: QuestionOption[];
}
interface Quiz {
  id: number;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params.quizId as string; // Ép kiểu string để truyền vào component
  const router = useRouter();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State quản lý 2 Modal riêng biệt
  const [isTFModalOpen, setIsTFModalOpen] = useState(false);
  const [isMCModalOpen, setIsMCModalOpen] = useState(false);

  const fetchQuizDetail = useCallback(async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/v1/quizzes/${quizId}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (response.data.success) {
        setQuiz(response.data.data);
      }
    } catch (err: any) {
      // THÊM DÒNG NÀY ĐỂ DEBUG
      console.error("LỖI CHI TIẾT TỪ FRONTEND:", err);

      const errorMessage =
        err.response?.data?.detail || err.message || "Lỗi khi tạo phòng chơi!";
      alert("Lý do lỗi: " + errorMessage);
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

  const handleHostGame = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await axios.post(
        `${apiUrl}/api/v1/rooms`,
        { quiz_id: parseInt(quizId) }, // Truyền ID của Quiz lên
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        // CẬP NHẬT CHUẨN XÁC THEO API MỚI NHẤT
        const roomCode = response.data.data.room_code;
        router.push(`/rooms/${roomCode}/lobby`);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Lỗi khi tạo phòng chơi!");
    }
  };

  if (loading)
    return (
      <div className="text-center mt-20 text-xl font-semibold animate-pulse">
        Đang tải dữ liệu...
      </div>
    );
  if (error)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">{error}</div>
    );
  if (!quiz)
    return (
      <div className="text-center mt-20 text-gray-500">Quiz không tồn tại!</div>
    );

  return (
    <ProtectedRoute>
      <div className="lg:pl-64 pt-24 pb-12">
        <div className="max-w-4xl mx-auto px-6">
          <QuizHeader
            quizId={quiz.id}
            title={quiz.title}
            description={quiz.description}
            questionsCount={quiz.questions.length}
            playsCount="1.2k"
            category="General Knowledge"
            image="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop"
            onEditSuccess={fetchQuizDetail}
          />

          <section>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Question List ({quiz.questions.length})
              </h2>

              {/* 2 NÚT THÊM CÂU HỎI */}
              <div className="flex gap-3">
                <button
                  onClick={handleHostGame}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md transition-all text-sm"
                >
                  🎮 HOST GAME
                </button>
                <button
                  onClick={() => setIsMCModalOpen(true)}
                  className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-bold hover:bg-blue-200 transition-all text-sm"
                >
                  <ListFilter size={16} /> + Multiple Choice
                </button>
                <button
                  onClick={() => setIsTFModalOpen(true)}
                  className="flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-bold hover:bg-purple-200 transition-all text-sm"
                >
                  <ToggleRight size={16} /> + True/False
                </button>
              </div>
            </div>

            {quiz.questions.length === 0 ? (
              <p className="text-gray-400 italic text-center py-8">
                Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {quiz.questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    index={idx}
                    onDeleteSuccess={fetchQuizDetail}
                  />
                ))}
              </div>
            )}
          </section>

          {/* NHÚNG 2 MODAL */}
          {/* Nút Tạo phòng chơi (Mới) */}
          <button
            onClick={handleHostGame}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 shadow-md transition-all text-sm"
          >
            🎮 HOST GAME
          </button>

          <AddTrueFalseModal
            quizId={quizId}
            isOpen={isTFModalOpen}
            onClose={() => setIsTFModalOpen(false)}
            onSuccess={fetchQuizDetail}
          />
          <AddMultipleChoiceModal
            quizId={quizId}
            isOpen={isMCModalOpen}
            onClose={() => setIsMCModalOpen(false)}
            onSuccess={fetchQuizDetail}
          />
        </div>
      </div>
    </ProtectedRoute>
  );
}
