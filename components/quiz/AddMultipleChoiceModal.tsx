// components/quiz/AddMultipleChoiceModal.tsx
"use client";

import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ListFilter, CheckCircle2, Timer, ChevronDown, Star } from "lucide-react";

interface Props {
  quizId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMultipleChoiceModal({ quizId, isOpen, onClose, onSuccess }: Props) {
  const [questionText, setQuestionText] = useState("");
  const [timeLimit, setTimeLimit] = useState(20);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [options, setOptions] = useState([
    { option_text: "", is_correct: true }, // Mặc định đáp án 1 đúng
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
    { option_text: "", is_correct: false },
  ]);

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index].option_text = value;
    setOptions(updated);
  };

  const handleCorrectAnswer = (index: number) => {
    const updated = options.map((option, i) => ({
      ...option,
      is_correct: i === index,
    }));
    setOptions(updated);
  };

  const handleSubmit = async () => {
    if (!questionText.trim()) {
      alert("Vui lòng nhập nội dung câu hỏi!");
      return;
    }
    // Kiểm tra các option không được rỗng
    if (options.some(opt => !opt.option_text.trim())) {
      alert("Vui lòng nhập đầy đủ 4 đáp án!");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://127.0.0.1:8000/api/v1/quizzes/${quizId}/questions`,
        {
          question_text: questionText,
          time_limit_seconds: timeLimit,
          options: options,
        },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      // Thành công -> Reset form, tắt modal, báo load lại data
      setQuestionText("");
      setOptions([
        { option_text: "", is_correct: true },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
        { option_text: "", is_correct: false },
      ]);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Lỗi khi thêm câu hỏi. Vui lòng kiểm tra lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[32px] p-8 shadow-xl border-2 border-gray-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
            <ListFilter className="w-5 h-5 text-blue-600" />
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider">Multiple Choice</span>
          </div>
          <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Create Mode</div>
        </div>

        <div className="mb-6">
          <label className="block text-xl font-black mb-3">Enter your question content</label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg transition-all"
            placeholder="Type your question here..."
            rows={3}
          />
        </div>

        <div className="mb-8">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-3">Fill 4 options & Select the correct one</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {options.map((option, index) => (
              <div 
                key={index} 
                className={`relative flex items-center p-3 rounded-2xl border-2 transition-all ${option.is_correct ? "border-green-500 bg-green-50" : "border-gray-200 bg-white"}`}
              >
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.option_text}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="flex-1 bg-transparent border-none focus:outline-none font-medium text-gray-700 placeholder:text-gray-400"
                />
                <button
                  onClick={() => handleCorrectAnswer(index)}
                  className={`ml-2 flex items-center justify-center w-8 h-8 rounded-full transition-all ${option.is_correct ? "bg-green-500 text-white shadow-md" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t-2 border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-4">
            <div className="relative group">
              <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <select
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                className="pl-10 pr-10 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl font-bold text-sm appearance-none focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value={15}>15 Seconds</option>
                <option value={20}>20 Seconds</option>
                <option value={30}>30 Seconds</option>
                <option value={60}>60 Seconds</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Question"}
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}