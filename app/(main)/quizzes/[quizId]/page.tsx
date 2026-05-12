"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { PlusCircle } from "lucide-react";
import QuizHeader from "@/components/quiz/QuizHeader";
import axios from "axios";
import AddTrueFalseModal from "@/components/quiz/AddTrueFalseModal";
import QuestionCard from "@/components/quiz/QuestionCard";

// Định nghĩa kiểu dữ liệu (Interfaces)
interface QuestionOption {
  id: int;
  option_text: string;
  is_correct: boolean;
}

interface Question {
  id: int;
  question_text: string;
  question_type: string;
  time_limit_seconds: int;
  options: QuestionOption[];
}

interface Quiz {
  id: int;
  title: string;
  description: string;
  questions: Question[];
}

export default function QuizDetailPage() {
  const params = useParams();
  const quizId = params.quizId;

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (err) {
      setError("Không thể tải dữ liệu Quiz.");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

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
    <div className="lg:pl-64 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Quiz */}
        <QuizHeader
          title={quiz.title}
          description={quiz.description}
          questionsCount={quiz.questions.length}
          playsCount="1.2k" // Tạm thời hardcode
          category="General Knowledge" // Tạm thời hardcode
          image="https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?q=80&w=2070&auto=format&fit=crop" // Ảnh placeholder đẹp
        />

        {/* Section Danh sách câu hỏi mới của bạn */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-headline text-2xl font-bold text-on-surface">
              Question List ({quiz.questions.length})
            </h2>

            {/* Nút này sẽ gọi hàm mở Modal */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 text-primary font-bold hover:underline transition-all"
            >
              <PlusCircle size={20} />
              Add Question
            </button>
          </div>

          {quiz.questions.length === 0 ? (
            <p className="text-gray-400 italic text-center py-8">
              Chưa có câu hỏi nào. Hãy thêm câu hỏi đầu tiên!
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Lặp qua danh sách câu hỏi thật từ API */}
              {quiz.questions.map((q, idx) => (
                <QuestionCard key={q.id} question={q} index={idx} onDeleteSuccess={fetchQuizDetail} />
              ))}
            </div>
          )}
        </section>

        {/* Nhúng Modal tạo câu hỏi */}
        <AddTrueFalseModal
          quizId={quizId}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchQuizDetail}
        />
      </div>
    </div>
  );
}
