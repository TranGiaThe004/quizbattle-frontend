// components/quiz/QuizHeader.tsx
"use client";

import { useState } from "react";
import { Play, Edit, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import EditQuizModal from "./EditQuizModal";
import { fetchWithAuth } from "@/lib/fetchApi";

interface QuizHeaderProps {
  quizId: number | string;
  title: string;
  description: string;
  questionsCount: number;
  playsCount: string;
  image: string;
  category: string;
  onEditSuccess: () => void;
}

export default function QuizHeader({
  quizId,
  title,
  description,
  questionsCount,
  playsCount,
  image,
  category,
  onEditSuccess,
}: QuizHeaderProps) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false); // State để hiển thị loading

  // HÀM TẠO PHÒNG MỚI CHO SPRINT 3
  const handleStartGame = async () => {
    setIsStarting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetchWithAuth(`http://127.0.0.1:8000/api/v1/rooms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quiz_id: Number(quizId) }),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        // TẠO PHÒNG THÀNH CÔNG -> CHUYỂN HƯỚNG VÀO LOBBY
        router.push(`/rooms/${result.data.room_code}/lobby`);
      } else {
        alert(result.message || "Không thể tạo phòng lúc này!");
      }
    } catch (error) {
      alert("Lỗi kết nối đến Server!");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <section className="bg-white rounded-xl overflow-hidden shadow-md border border-outline-variant mb-8">
      <div className="relative h-64 w-full">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute bottom-4 right-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full font-bold text-xs shadow-md uppercase tracking-wider">
            {category}
          </span>
        </div>
      </div>

      <div className="p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex-1">
            <h1 className="font-headline text-3xl font-extrabold text-primary mb-2">
              {title}
            </h1>
            <p className="text-on-surface-variant mb-6 text-lg">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-surface-container px-4 py-2 rounded-lg border border-outline-variant">
                <Zap size={18} className="text-primary fill-primary" />
                <span className="font-bold text-sm">
                  {questionsCount} Questions
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">
            {/* NÚT TẠO PHÒNG */}
            <motion.button
              whileTap={!isStarting ? { scale: 0.95 } : {}}
              onClick={handleStartGame}
              disabled={isStarting}
              className={`font-headline text-xl px-8 py-4 rounded-xl btn-3d flex items-center justify-center gap-2 w-full transition-all ${isStarting ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-secondary-container text-on-secondary-container"}`}
            >
              {isStarting ? (
                <div className="w-6 h-6 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play size={24} fill="currentColor" /> Start Game
                </>
              )}
            </motion.button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="bg-surface-container-high text-on-surface font-bold px-8 py-3 rounded-xl border-2 border-outline hover:bg-surface-variant transition-all flex items-center justify-center gap-2"
            >
              <Edit size={18} /> Edit Quiz
            </button>
          </div>
        </div>
      </div>

      <EditQuizModal
        quizId={quizId}
        initialTitle={title}
        initialDesc={description}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={onEditSuccess}
      />
    </section>
  );
}
