"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, Timer, ChevronDown } from "lucide-react";

interface Props {
  questionId: number;
  initialText: string;
  initialTime: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuestionModal({ questionId, initialText, initialTime, isOpen, onClose, onSuccess }: Props) {
  const [text, setText] = useState(initialText);
  const [timeLimit, setTimeLimit] = useState(initialTime);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { setText(initialText); setTimeLimit(initialTime); }, [initialText, initialTime, isOpen]);

  const handleSubmit = async () => {
    if (!text.trim()) return alert("Vui lòng nhập nội dung!");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`http://127.0.0.1:8000/api/v1/questions/${questionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question_text: text, time_limit_seconds: timeLimit }),
      });
      if (res.ok) { onSuccess(); onClose(); }
      else alert("Lỗi khi cập nhật câu hỏi!");
    } finally { setIsSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.section initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[32px] p-8 shadow-xl w-full max-w-xl">
        <div className="flex items-center gap-2 mb-6 text-blue-600">
          <Edit2 className="w-5 h-5" />
          <span className="font-bold uppercase tracking-wider">Edit Question</span>
        </div>
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          className="w-full bg-gray-50 p-5 rounded-2xl border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg mb-6" rows={3}
        />
        <div className="flex justify-between items-center border-t-2 border-gray-100 pt-6">
          <div className="relative group flex items-center">
            <Timer className="absolute left-3 w-5 h-5 text-gray-500" />
            <select value={timeLimit} onChange={(e) => setTimeLimit(parseInt(e.target.value))} className="pl-10 pr-10 py-3 bg-gray-50 border-2 rounded-xl font-bold appearance-none outline-none">
              <option value={15}>15 Seconds</option><option value={20}>20 Seconds</option>
              <option value={30}>30 Seconds</option><option value={60}>60 Seconds</option>
            </select>
            <ChevronDown className="absolute right-3 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-3 font-bold text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
            <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl">{isSubmitting ? "Saving..." : "Save"}</button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}