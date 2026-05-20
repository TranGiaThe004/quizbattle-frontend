"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
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
  Menu,
  X,
  Settings,
  Play,
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
  question_type: "multiple_choice" | "true_false";
  answers: Answer[];
}

interface QuizState {
  title: string;
  category: string;
  description: string;
  isPublic: boolean;
  questions: Question[];
}

export default function EditQuizPage() {
  const params = useParams();
  const quizId = params.quizId as string;
  const router = useRouter();

  // --- STATES ---
  const [quiz, setQuiz] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState<string>("");

  // Theo dõi các câu hỏi bị xóa để gọi API DELETE khi bấm Save
  const [deletedQuestionIds, setDeletedQuestionIds] = useState<string[]>([]);

  // Responsive Sidebar States
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  // --- FETCH DỮ LIỆU QUIZ CŨ ---
  const fetchQuizDetail = useCallback(async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetchWithAuth(
        `${apiUrl}/api/v1/quizzes/${quizId}`,
      );

      if (!response.ok) throw new Error("Không thể tải dữ liệu Quiz");

      const data = await response.json();
      const quizData = data.data || data;

      // Map dữ liệu từ Backend sang chuẩn của UI 3 cột
      const mappedQuestions: Question[] = quizData.questions.map(
        (q: any, qIndex: number) => {
          const labels = ["A", "B", "C", "D"];
          return {
            id: q.id.toString(), // ID từ DB
            number: qIndex + 1,
            text: q.question_text,
            timeLimit: q.time_limit_seconds,
            question_type: q.question_type || "multiple_choice",
            answers: q.options.map((opt: any, oIndex: number) => ({
              id: opt.id.toString(),
              text: opt.option_text,
              isCorrect: opt.is_correct,
              label:
                q.question_type === "true_false"
                  ? oIndex === 0
                    ? "T"
                    : "F"
                  : labels[oIndex] || "?",
            })),
          };
        },
      );

      setQuiz({
        title: quizData.title,
        category: quizData.category || "it",
        description: quizData.description || "",
        isPublic: quizData.is_public ?? true,
        questions: mappedQuestions,
      });

      if (mappedQuestions.length > 0) {
        setActiveQuestionId(mappedQuestions[0].id);
      }
    } catch (err: any) {
      console.error("LỖI FETCH QUIZ:", err);
      setError("Không tìm thấy Quiz hoặc bạn không có quyền truy cập!");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    fetchQuizDetail();
  }, [fetchQuizDetail]);

  const activeQuestion =
    quiz?.questions.find((q) => q.id === activeQuestionId) ||
    quiz?.questions[0];

  // --- LOGIC CẬP NHẬT GIAO DIỆN ---
  const updateQuestion = (updates: Partial<Question>) => {
    if (!quiz) return;
    setQuiz((prev) => ({
      ...prev!,
      questions: prev!.questions.map((q) =>
        q.id === activeQuestionId ? { ...q, ...updates } : q,
      ),
    }));
  };

  const updateAnswer = (answerId: string, text: string) => {
    if (!activeQuestion) return;
    updateQuestion({
      answers: activeQuestion.answers.map((a) =>
        a.id === answerId ? { ...a, text } : a,
      ),
    });
  };

  const setCorrectAnswer = (answerId: string) => {
    if (!activeQuestion) return;
    updateQuestion({
      answers: activeQuestion.answers.map((a) => ({
        ...a,
        isCorrect: a.id === answerId,
      })),
    });
  };

  // --- LOGIC THÊM/XÓA CÂU HỎI TRÊN UI ---
  const addQuestion = (type: "multiple_choice" | "true_false") => {
    if (!quiz) return;
    const newId = `new_${Date.now()}`; // Đánh dấu ID là tạo mới

    let defaultAnswers: Answer[];
    if (type === "true_false") {
      defaultAnswers = [
        {
          id: `opt_${Date.now()}_1`,
          text: "True",
          isCorrect: true,
          label: "T",
        },
        {
          id: `opt_${Date.now()}_2`,
          text: "False",
          isCorrect: false,
          label: "F",
        },
      ];
    } else {
      defaultAnswers = [
        { id: `opt_${Date.now()}_1`, text: "", isCorrect: true, label: "A" },
        { id: `opt_${Date.now()}_2`, text: "", isCorrect: false, label: "B" },
        { id: `opt_${Date.now()}_3`, text: "", isCorrect: false, label: "C" },
        { id: `opt_${Date.now()}_4`, text: "", isCorrect: false, label: "D" },
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
      ...prev!,
      questions: [...prev!.questions, newQuestion],
    }));
    setActiveQuestionId(newId);

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsLeftSidebarOpen(false);
    }
  };

  const deleteQuestion = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!quiz || quiz.questions.length === 1) {
      alert("Một bài Quiz phải có ít nhất 1 câu hỏi!");
      return;
    }

    // Nếu ID không chứa chữ 'new_', tức là câu hỏi này đã có trong DB -> Ghi nhận để xóa
    if (!id.startsWith("new_")) {
      setDeletedQuestionIds((prev) => [...prev, id]);
    }

    const newQuestions = quiz.questions.filter((q) => q.id !== id);
    const updatedQuestions = newQuestions.map((q, idx) => ({
      ...q,
      number: idx + 1,
    }));
    setQuiz((prev) => ({ ...prev!, questions: updatedQuestions }));

    if (activeQuestionId === id) {
      setActiveQuestionId(updatedQuestions[0].id);
    }
  };

  // --- LƯU THAY ĐỔI XUỐNG DATABASE ---
  const handleSaveChanges = async () => {
    if (!quiz || !quiz.title.trim()) {
      alert("Vui lòng nhập tên Quiz!");
      return;
    }

    setIsPublishing(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      // 1. Cập nhật thông tin chung của Quiz (PATCH)
      const quizPayload = {
        title: quiz.title,
        description: quiz.description,
        is_public: quiz.isPublic,
      };

      await fetchWithAuth(`${apiUrl}/api/v1/quizzes/${quizId}`, {
        method: "PATCH",
        body: JSON.stringify(quizPayload),
      });

      // 2. Gọi API XÓA những câu hỏi đã bị xóa trên giao diện
      if (deletedQuestionIds.length > 0) {
        const deletePromises = deletedQuestionIds.map((delId) =>
          fetchWithAuth(`${apiUrl}/api/v1/questions/${delId}`, {
            method: "DELETE",
          }),
        );
        await Promise.all(deletePromises);
      }

      // 3. Phân loại và CẬP NHẬT/TẠO MỚI từng câu hỏi
      const questionPromises = quiz.questions.map((q) => {
        const payload = {
          question_text: q.text || "Câu hỏi trống",
          question_type: q.question_type,
          time_limit_seconds: q.timeLimit,
          order_index: q.number,
          options: q.answers.map((a) => ({
            option_text: a.text || `Lựa chọn ${a.label}`,
            is_correct: a.isCorrect,
          })),
        };

        if (q.id.startsWith("new_")) {
          // Câu hỏi mới -> Dùng method POST
          payload["quiz_id"] = parseInt(quizId);
          return fetchWithAuth(`${apiUrl}/api/v1/quizzes/${quizId}/questions`, {
            method: "POST",
            body: JSON.stringify(payload),
          });
        } else {
          // Câu hỏi đã có -> Dùng method PATCH cập nhật
          return fetchWithAuth(`${apiUrl}/api/v1/questions/${q.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        }
      });

      await Promise.all(questionPromises);

      alert("✅ Đã lưu thay đổi thành công!");
      router.push("/quizzes");
    } catch (error) {
      console.error("Save Error:", error);
      alert("Lỗi kết nối đến máy chủ khi lưu thay đổi!");
    } finally {
      setIsPublishing(false);
    }
  };

  // --- HOST GAME TRỰC TIẾP TỪ TRANG EDIT ---
  const handleHostGame = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetchWithAuth(`${apiUrl}/api/v1/rooms`, {
        method: "POST",
        body: JSON.stringify({ quiz_id: parseInt(quizId) }),
      });

      if (response.ok) {
        const data = await response.json();
        const roomCode = data.data?.room_code || data.room_code;
        router.push(`/rooms/${roomCode}/lobby`);
      } else {
        alert("Lỗi khi tạo phòng chơi!");
      }
    } catch (err) {
      alert("Lỗi kết nối đến máy chủ!");
    }
  };

  // --- GIAO DIỆN LOADING & ERROR ---
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-bold text-slate-500 animate-pulse">
            Đang tải dữ liệu Quiz...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quiz || !activeQuestion) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <p className="text-xl font-bold text-red-500">
          {error || "Lỗi dữ liệu"}
        </p>
        <button
          onClick={() => router.push("/quizzes")}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold"
        >
          Về Thư viện
        </button>
      </div>
    );
  }

  // --- MAIN UI (GIỐNG CREATE PAGE 100%) ---
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-50 font-sans">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full h-16 bg-white border-b border-slate-200 z-50 flex justify-between items-center px-4 md:px-6">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700"
          >
            <Menu className="w-6 h-6" />
          </button>

          <button
            onClick={() => router.push("/quizzes")}
            className="hidden sm:flex items-center gap-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 px-3 py-2 rounded-lg transition-colors font-bold text-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden md:inline">Library</span>
          </button>
        </div>

        <div className="flex-1 max-w-xs md:max-w-lg mx-auto">
          <input
            className="w-full bg-transparent border-none text-center font-display text-lg md:text-2xl font-black text-slate-900 placeholder:text-slate-300 focus:ring-0 rounded-lg p-2 outline-none"
            value={quiz.title}
            onChange={(e) =>
              setQuiz((prev) => ({ ...prev!, title: e.target.value }))
            }
            placeholder="Enter Quiz Title..."
          />
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          {/* NÚT HOST GAME GIỮ TỪ CODE CŨ */}
          <button
            onClick={handleHostGame}
            className="hidden md:flex bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold text-sm items-center gap-2 shadow-sm transition-colors"
          >
            <Play className="w-4 h-4 fill-current" /> Host Game
          </button>

          <button
            onClick={handleSaveChanges}
            disabled={isPublishing}
            className="bg-yellow-400 text-yellow-950 px-4 md:px-6 py-2 rounded-xl font-bold text-sm shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isPublishing ? (
              <div className="w-4 h-4 border-2 border-yellow-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span className="hidden md:inline">
              {isPublishing ? "Saving..." : "Save Changes"}
            </span>
          </button>

          <button
            onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)}
            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg text-slate-700"
          >
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex pt-16 overflow-hidden relative">
        {/* LETS SIDEBAR: CÂU HỎI */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 bg-slate-100 border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${
            isLeftSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } pt-16 lg:pt-0`}
        >
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <h2 className="font-display text-xl font-black text-slate-800">
              Questions
            </h2>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-bold text-xs">
                {quiz.questions.length}
              </span>
              <button
                onClick={() => setIsLeftSidebarOpen(false)}
                className="lg:hidden p-1 hover:bg-slate-100 rounded-full text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
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
                  onClick={() => {
                    setActiveQuestionId(q.id);
                    if (
                      typeof window !== "undefined" &&
                      window.innerWidth < 1024
                    ) {
                      setIsLeftSidebarOpen(false);
                    }
                  }}
                  className={`relative p-3 rounded-xl cursor-pointer shadow-sm transition-all border-2 ${
                    activeQuestionId === q.id
                      ? "bg-white border-indigo-500 shadow-md ring-2 ring-indigo-200"
                      : "bg-white border-slate-200 hover:border-indigo-300"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`font-black text-xs px-2 py-1 rounded-md ${
                        activeQuestionId === q.id
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
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
                    className={`text-sm line-clamp-2 font-medium mt-2 ${
                      activeQuestionId === q.id
                        ? "text-slate-800"
                        : "text-slate-500"
                    }`}
                  >
                    {q.text || "Câu hỏi chưa có nội dung..."}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

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

        {(isLeftSidebarOpen || isRightSidebarOpen) && (
          <div
            onClick={() => {
              setIsLeftSidebarOpen(false);
              setIsRightSidebarOpen(false);
            }}
            className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden backdrop-blur-sm"
          />
        )}

        {/* CENTER: EDITOR */}
        <section className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8 flex flex-col items-center">
          <motion.div
            key={activeQuestionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-3xl space-y-6 md:space-y-8"
          >
            <div className="bg-white rounded-3xl p-4 md:p-6 shadow-sm border-2 border-slate-200">
              <div className="flex justify-between items-center mb-4">
                <span className="font-display text-xl md:text-2xl font-black text-indigo-900">
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
                className="w-full bg-slate-50 border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 rounded-2xl p-4 text-base md:text-xl font-bold text-slate-800 resize-none min-h-[100px] md:min-h-[140px] placeholder:text-slate-300 outline-none transition-all"
                placeholder="Nhập nội dung câu hỏi..."
                value={activeQuestion.text}
                onChange={(e) => updateQuestion({ text: e.target.value })}
              />
            </div>

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
                      className={`flex items-center gap-1 font-bold text-xs md:text-sm px-3 py-1.5 rounded-lg transition-colors ${
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

                  <input
                    className={`w-full rounded-xl p-3 text-base md:text-lg font-bold outline-none border-2 transition-all ${
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
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-72 bg-white border-l border-slate-200 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${
            isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
          } pt-16 lg:pt-0`}
        >
          <div className="flex justify-between items-center border-b-2 border-slate-100 pb-4">
            <h3 className="font-display text-xl font-black text-slate-800">
              Quiz Settings
            </h3>
            <button
              onClick={() => setIsRightSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded-full text-slate-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
                  setQuiz((prev) => ({ ...prev!, isPublic: !prev!.isPublic }))
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
                setQuiz((prev) => ({ ...prev!, category: e.target.value }))
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
                setQuiz((prev) => ({ ...prev!, description: e.target.value }))
              }
            />
          </div>
        </aside>
      </main>
    </div>
  );
}
