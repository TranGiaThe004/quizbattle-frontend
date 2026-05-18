"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchWithAuth } from "@/lib/fetchApi";

interface Props {
  quizId: string | number;
  initialTitle: string;
  initialDesc: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditQuizModal({
  quizId,
  initialTitle,
  initialDesc,
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const [title, setTitle] = useState(initialTitle);
  const [desc, setDesc] = useState(initialDesc);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(initialTitle);
    setDesc(initialDesc);
  }, [initialTitle, initialDesc, isOpen]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/v1/quizzes/${quizId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ title, description: desc }),
        },
      );
      if (res.ok) {
        onSuccess();
        onClose();
      } else alert("Lỗi cập nhật Quiz!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <motion.section
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[32px] p-8 shadow-xl w-full max-w-xl"
      >
        <h2 className="text-2xl font-bold mb-6">Edit Quiz Details</h2>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-50 p-4 rounded-xl border-2 focus:border-blue-500 outline-none mb-4 font-bold"
        />
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          className="w-full bg-gray-50 p-4 rounded-xl border-2 focus:border-blue-500 outline-none mb-6"
          rows={3}
        />
        <div className="flex justify-end gap-3 border-t-2 pt-6">
          <button
            onClick={onClose}
            className="px-6 py-3 font-bold text-gray-600 bg-gray-100 rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-black text-white font-bold rounded-xl"
          >
            Save
          </button>
        </div>
      </motion.section>
    </div>
  );
}
