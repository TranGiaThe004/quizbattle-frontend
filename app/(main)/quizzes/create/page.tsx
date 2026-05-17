'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  UploadCloud,
  Trash2,
  Timer as TimerIcon,
  CheckCircle2,
  Circle,
  LayoutGrid,
  AlignLeft,
  ChevronDown,
  Globe,
  ListFilter,
  ToggleRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWithAuth } from "@/lib/fetchApi";

// --- TYPES ---
interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
  label: string;
}

interface Question {
  id: string;
  number: number;
  text: string;
  timeLimit: number;
  question_type: "multiple_choice" | "true_false"; // Thêm loại câu hỏi
  answers: Answer[];
}

interface QuizState {
  title: string;
  category: string;
  description: string;
  isPublic: boolean;
  questions: Question[];
}

// Khởi tạo mặc định với 1 câu Multiple Choice
const INITIAL_QUIZ: QuizState = {
  title: "",
  category: "it",
  description: "",
  isPublic: true,
  questions: [
    {
      id: "1",
      number: 1,
      text: "",
      timeLimit: 20,
      question_type: "multiple_choice",
      answers: [
        { id: "a", text: "", isCorrect: true, label: "A" },
        { id: "b", text: "", isCorrect: false, label: "B" },
        { id: "c", text: "", isCorrect: false, label: "C" },
        { id: "d", text: "", isCorrect: false, label: "D" },
      ],
    },
  ],
};

export default function CreateQuizPage() {
  const router = useRouter();
  const [quiz, setQuiz] = useState<QuizState>(INITIAL_QUIZ);
  const [activeQuestionId, setActiveQuestionId] = useState<string>(
    quiz.questions[0].id,
  );
  const [isPublishing, setIsPublishing] = useState(false);

  const activeQuestion =
    quiz.questions.find((q) => q.id === activeQuestionId) || quiz.questions[0];

  // --- LOGIC CẬP NHẬT GIAO DIỆN ---
  const updateQuestion = (updates: Partial<Question>) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === activeQuestionId ? { ...q, ...updates } : q,
      ),
    }));
  };

  const updateAnswer = (answerId: string, text: string) => {
    updateQuestion({
      answers: activeQuestion.answers.map((a) =>
        a.id === answerId ? { ...a, text } : a,
      ),
    });
  };

  const setCorrectAnswer = (answerId: string) => {
    updateQuestion({
      answers: activeQuestion.answers.map((a) => ({
        ...a,
        isCorrect: a.id === answerId,
      })),
    });
  };

  // --- LOGIC THÊM CÂU HỎI MỚI THEO LOẠI ---
  const addQuestion = (type: "multiple_choice" | "true_false") => {
    const newId = Date.now().toString();

    let defaultAnswers: Answer[];
    if (type === "true_false") {
      defaultAnswers = [
        { id: "a", text: "True", isCorrect: true, label: "T" },
        { id: "b", text: "False", isCorrect: false, label: "F" },
      ];
    } else {
      defaultAnswers = [
        { id: "a", text: "", isCorrect: true, label: "A" },
        { id: "b", text: "", isCorrect: false, label: "B" },
        { id: "c", text: "", isCorrect: false, label: "C" },
        { id: "d", text: "", isCorrect: false, label: "D" },
      ];
    }

    const newQuestion: Question = {
      id: newId,
      number: quiz.questions.length + 1,
      text: "",
      timeLimit: 20,
      question_type: type,
      answers: defaultAnswers,
    };

    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
    setActiveQuestionId(newId);
  };

  const deleteQuestion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (quiz.questions.length === 1) return;
    const newQuestions = quiz.questions.filter((q) => q.id !== id);
    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));
    setQuiz((prev) => ({ ...prev, questions: updatedQuestions }));
    if (activeQuestionId === id) setActiveQuestionId(updatedQuestions[0].id);
  };

  // --- LOGIC LƯU VÀO DATABASE BẰNG 2 BƯỚC ---
  const handlePublish = async () => {
    if (!quiz.title.trim()) {
      alert("Vui lòng nhập tên Quiz!");
      return;
    }

    setIsPublishing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      // Bước 1: Tạo cái VỎ QUIZ
      const quizPayload = {
        title: quiz.title,
        description: quiz.description,
        is_public: quiz.isPublic,
      };

      const quizResponse = await fetchWithAuth(`${apiUrl}/api/v1/quizzes`, {
        method: "POST",
        body: JSON.stringify(quizPayload),
      });

      if (!quizResponse.ok) {
        const errorData = await quizResponse.json();
        alert(`Lỗi tạo Quiz: ${errorData.detail || "Không rõ nguyên nhân"}`);
        setIsPublishing(false);
        return;
      }

      const createdQuiz = await quizResponse.json();
      const newQuizId = createdQuiz.data?.id || createdQuiz.id;

      // Bước 2: NHỒI TỪNG CÂU HỎI VÀO QUIZ
      const questionPromises = quiz.questions.map((q) => {
        const questionPayload = {
          quiz_id: newQuizId,
          question_text: q.text || "Câu hỏi trống",
          question_type: q.question_type,
          time_limit_seconds: q.timeLimit,
          options: q.answers.map((a) => ({
            option_text: a.text || `Lựa chọn ${a.label}`,
            is_correct: a.isCorrect,
          })),
        };

        // LƯU Ý: Đổi đường dẫn này nếu API tạo câu hỏi của Backend team khác nhé!
        return fetchWithAuth(
          `http://127.0.0.1:8000/api/v1/quizzes/${newQuizId}/questions`,
          {
            method: "POST",
            body: JSON.stringify(questionPayload),
          },
        );
      });

      await Promise.all(questionPromises);

      // Hoàn tất
      alert("🎉 Xuất bản Quiz và câu hỏi thành công!");
      router.push("/quizzes");
    } catch (error) {
      console.error("Publish Error:", error);
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsPublishing(false);
    }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-50 flex justify-between items-center px-6">
        <button
          onClick={() => router.push("/quizzes")}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          Library
        </button>

        <div className="flex-1 max-w-lg mx-auto">
          <input
            className="w-full bg-transparent border-none text-center font-display text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-0 rounded-lg p-2 outline-none"
            value={quiz.title}
            onChange={(e) =>
              setQuiz((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Enter Quiz Title..."
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="bg-yellow-400 text-yellow-950 px-6 py-2 rounded-xl font-bold text-sm shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="w-4 h-4 border-2 border-yellow-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            {isPublishing ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </header>

      <main className="flex-1 flex pt-16 overflow-hidden">
        {/* LETS SIDEBAR: CÂU HỎI */}
        <aside className="w-72 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="font-display text-xl font-black text-slate-800">
              Questions
            </h2>
            <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs">
              {quiz.questions.length}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 hide-scrollbar">
            <AnimatePresence mode="popLayout">
              {quiz.questions.map((q) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={q.id}
                  onClick={() => setActiveQuestionId(q.id)}
                  className={`relative p-3 rounded-xl cursor-pointer shadow-sm transition-all border-2 ${
                    activeQuestionId === q.id
                      ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`font-black text-xs px-2 py-1 rounded-md ${activeQuestionId === q.id ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      Q{q.number} •{" "}
                      {q.question_type === "true_false" ? "T/F" : "Quiz"}
                    </span>
                    <button
                      onClick={(e) => deleteQuestion(e, q.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p
                    className={`text-sm line-clamp-2 font-medium mt-2 ${activeQuestionId === q.id ? "text-slate-800" : "text-slate-500"}`}
                  >
                    {q.text || "Câu hỏi chưa có nội dung..."}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* 2 NÚT THÊM CÂU HỎI Ở CỘT TRÁI */}
          <div className="p-4 border-t border-slate-200 bg-white flex flex-col gap-2">
            <button
              onClick={() => addQuestion("multiple_choice")}
              className="w-full bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-dashed border-blue-200 hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
            >
              <ListFilter className="w-4 h-4" />+ Multiple Choice
            </button>
            <button
              onClick={() => addQuestion("true_false")}
              className="w-full bg-purple-50 text-purple-700 px-4 py-2.5 rounded-xl font-bold text-sm border-2 border-dashed border-purple-200 hover:bg-purple-100 transition-all flex items-center justify-center gap-2"
            >
              <ToggleRight className="w-4 h-4" />+ True/False
            </button>
          </div>
        </aside>

        {/* CENTER: EDITOR */}
        <section className="flex-1 overflow-y-auto bg-slate-50 p-8 flex flex-col items-center">
          <motion.div
            key={activeQuestionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-8"
          >
            {/* Question Text */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-2xl font-black text-indigo-900">
                  Question {activeQuestion.number}
                </span>
                <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  <TimerIcon className="w-4 h-4 text-slate-500" />
                  <select
                    value={activeQuestion.timeLimit}
                    onChange={(e) =>
                      updateQuestion({ timeLimit: Number(e.target.value) })
                    }
                    className="bg-transparent border-none text-sm font-bold text-slate-800 focus:ring-0 p-0 cursor-pointer outline-none"
                  >
                    <option value="10">10s</option>
                    <option value="20">20s</option>
                    <option value="30">30s</option>
                    <option value="60">60s</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-slate-500" />
                </div>
              </div>
              <textarea
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl p-4 text-xl font-bold text-slate-800 resize-none min-h-[140px] placeholder:text-slate-300 outline-none transition-all"
                placeholder="Nhập nội dung câu hỏi..."
                value={activeQuestion.text}
                onChange={(e) => updateQuestion({ text: e.target.value })}
              />
            </div>

            {/* HIỂN THỊ ĐÁP ÁN DỰA VÀO LOẠI CÂU HỎI */}
            <div
              className={`grid gap-4 ${activeQuestion.question_type === "true_false" ? "grid-cols-2 max-w-lg mx-auto" : "grid-cols-1 md:grid-cols-2"}`}
            >
              {activeQuestion.answers.map((answer) => (
                <div
                  key={answer.id}
                  className={`rounded-2xl p-4 flex flex-col gap-3 relative transition-all border-4 ${
                    answer.isCorrect
                      ? "bg-green-50 border-green-500 shadow-md"
                      : "bg-white border-slate-200 hover:border-indigo-300 shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                        answer.isCorrect
                          ? "bg-green-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {answer.label}
                    </span>
                    <button
                      onClick={() => setCorrectAnswer(answer.id)}
                      className={`flex items-center gap-1 font-bold text-sm px-3 py-1.5 rounded-lg transition-colors ${
                        answer.isCorrect
                          ? "text-green-700 bg-green-200/50"
                          : "text-slate-400 hover:text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {answer.isCorrect ? (
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                      {answer.isCorrect ? "Correct" : "Mark Correct"}
                    </button>
                  </div>

                  {/* Khóa ô input nếu là câu hỏi True/False */}
                  <input
                    className={`w-full rounded-xl p-3 text-lg font-bold outline-none border-2 transition-all ${
                      answer.isCorrect
                        ? "bg-white border-green-200 text-green-900 focus:border-green-500"
                        : "bg-slate-50 border-transparent text-slate-800 focus:border-indigo-300 focus:bg-white"
                    } ${activeQuestion.question_type === "true_false" ? "cursor-not-allowed opacity-80" : ""}`}
                    type="text"
                    value={answer.text}
                    onChange={(e) => updateAnswer(answer.id, e.target.value)}
                    placeholder={`Nhập đáp án ${answer.label}...`}
                    disabled={activeQuestion.question_type === "true_false"}
                  />
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* RIGHT SIDEBAR: Settings */}
        <aside className="w-72 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0">
          <h3 className="font-display text-xl font-black text-slate-800 border-b-2 border-slate-100 pb-4">
            Quiz Settings
          </h3>

          <div className="space-y-2">
            <label className="font-bold text-sm text-slate-500 flex items-center gap-2">
              <Globe className="w-4 h-4 text-indigo-600" /> Visibility
            </label>
            <div className="flex items-center justify-between bg-slate-50 border-2 border-slate-200 rounded-xl p-3">
              <span
                className={`font-bold text-sm ${quiz.isPublic ? "text-indigo-600" : "text-slate-500"}`}
              >
                {quiz.isPublic ? "Public" : "Private"}
              </span>
              <button
                onClick={() =>
                  setQuiz((prev) => ({ ...prev, isPublic: !prev.isPublic }))
                }
                className={`w-12 h-6 rounded-full transition-colors relative shadow-inner ${quiz.isPublic ? "bg-indigo-600" : "bg-slate-300"}`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform ${quiz.isPublic ? "translate-x-7" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-slate-500 flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-indigo-600" /> Category
            </label>
            <select
              value={quiz.category}
              onChange={(e) =>
                setQuiz((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 font-bold text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none cursor-pointer"
            >
              <option value="it">IT & Tech</option>
              <option value="history">History</option>
              <option value="science">Science</option>
              <option value="pop">Programming</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="font-bold text-sm text-slate-500 flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-indigo-600" /> Description
            </label>
            <textarea
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none resize-none h-32"
              placeholder="Mô tả ngắn gọn về bài Quiz..."
              value={quiz.description}
              onChange={(e) =>
                setQuiz((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
