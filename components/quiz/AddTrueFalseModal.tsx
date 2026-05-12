"use client";

import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  ToggleRight,
  CheckCircle2,
  XCircle,
  Timer,
  ChevronDown,
  Star,
} from "lucide-react";

interface Props {
  quizId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddTrueFalseModal({
  quizId,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  // States để lưu trữ dữ liệu
  const [questionText, setQuestionText] = useState("");
  const [isTrueCorrect, setIsTrueCorrect] = useState<boolean>(true);
  const [timeLimit, setTimeLimit] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hàm xử lý gửi data xuống API
  const handleSubmit = async () => {
    if (!questionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://127.0.0.1:8000/api/v1/quizzes/${quizId}/questions/true-false`,
        {
          question_text: questionText,
          time_limit_seconds: timeLimit,
          is_true_correct: isTrueCorrect,
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );

      // Thành công -> Reset form, tắt modal và báo cho trang ngoài cập nhật
      setQuestionText("");
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi thêm câu hỏi. Vui lòng kiểm tra lại API!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Nếu không mở Modal thì render null (Kết hợp AnimatePresence bên ngoài nếu cần, nhưng ở đây xử lý đơn giản)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] p-8 shadow-tactile border-2 border-surface-container-highest w-full max-w-2xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
            <ToggleRight className="w-5 h-5 text-primary" />
            <span className="text-primary font-bold text-xs uppercase tracking-wider">
              True/False Question
            </span>
          </div>
          <div className="text-on-surface-variant font-bold text-[10px] uppercase tracking-widest opacity-60">
            Create Mode
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-2xl font-black font-display mb-4">
            Enter your question content
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full bg-surface p-6 rounded-3xl border-4 border-surface-container-highest focus:border-primary-container focus:outline-none text-lg font-medium shadow-inner transition-all placeholder:opacity-30"
            placeholder="Type your challenging trivia question here..."
            rows={4}
          />
        </div>

        <div className="mb-10">
          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-4">
            Select the correct answer
          </p>
          <div className="grid grid-cols-2 gap-6">
            {/* True Button */}
            <button
              onClick={() => setIsTrueCorrect(true)}
              className={`answer-card group relative flex flex-col items-center justify-center p-8 rounded-3xl border-4 transition-all ${
                isTrueCorrect === true
                  ? "border-primary bg-primary/5 shadow-[0_8px_0_0_#630ed420]"
                  : "border-surface-container-highest bg-white hover:border-primary/30"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  isTrueCorrect === true
                    ? "bg-primary text-white"
                    : "bg-surface-container-highest text-primary"
                }`}
              >
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <span
                className={`text-xl font-black font-display ${isTrueCorrect === true ? "text-primary" : "text-on-surface-variant"}`}
              >
                True
              </span>
              {isTrueCorrect === true && (
                <CheckCircle2 className="absolute top-4 right-4 w-5 h-5 text-primary" />
              )}
            </button>

            {/* False Button */}
            <button
              onClick={() => setIsTrueCorrect(false)}
              className={`answer-card group relative flex flex-col items-center justify-center p-8 rounded-3xl border-4 transition-all ${
                isTrueCorrect === false
                  ? "border-red-500 bg-red-50 shadow-[0_8px_0_0_#ef444420]"
                  : "border-surface-container-highest bg-white hover:border-red-300"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${
                  isTrueCorrect === false
                    ? "bg-red-500 text-white"
                    : "bg-surface-container-highest text-red-500"
                }`}
              >
                <XCircle className="w-10 h-10" />
              </div>
              <span
                className={`text-xl font-black font-display ${isTrueCorrect === false ? "text-red-500" : "text-on-surface-variant"}`}
              >
                False
              </span>
              {isTrueCorrect === false && (
                <XCircle className="absolute top-4 right-4 w-5 h-5 text-red-500" />
              )}
            </button>
          </div>
        </div>

        <div className="pt-8 border-t-2 border-surface-container-high flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            {/* Timer Select */}
            <div className="relative group">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-container" />
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="pl-10 pr-10 py-3 bg-surface-container-high border-2 border-surface-container-highest rounded-xl font-bold text-sm appearance-none focus:outline-none focus:border-primary-container cursor-pointer"
              >
                <option value={15}>15 Seconds</option>
                <option value={20}>20 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>

            {/* Points Select (UI Dummy - API chưa hỗ trợ điểm riêng từng câu) */}
            <div className="relative group">
              <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-container" />
              <select className="pl-10 pr-10 py-3 bg-surface-container-high border-2 border-surface-container-highest rounded-xl font-bold text-sm appearance-none focus:outline-none focus:border-primary-container cursor-pointer">
                <option>Standard Points</option>
                <option>Double Points</option>
                <option>No Points</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border-2 border-surface-container-highest rounded-xl font-bold text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg hover:shadow-primary/30 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving..." : "Save Question"}
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
