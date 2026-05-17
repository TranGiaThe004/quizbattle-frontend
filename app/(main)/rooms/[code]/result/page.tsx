"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Trophy, Medal, Home } from "lucide-react";
import confetti from "canvas-confetti"; // IMPORT THƯ VIỆN PHÁO GIẤY

interface PlayerResult {
  user_id: number;
  display_name: string;
  score: number;
}

export default function ResultPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // 1. EFFECT LẤY DỮ LIỆU
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const sessionId = localStorage.getItem("game_session_id");

        if (!token || !sessionId) {
          router.push("/dashboard");
          return;
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

        const response = await fetch(
          `${apiUrl}/api/v1/game-sessions/${sessionId}/result`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (data.success) {
          setLeaderboard(data.data.leaderboard);
        } else {
          setError(data.message || "Không thể tải kết quả");
        }
      } catch (err) {
        setError("Lỗi kết nối đến máy chủ");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [router]);

  // 2. EFFECT BẮN PHÁO GIẤY & ÂM THANH (Chỉ chạy khi đã load xong và có dữ liệu)
  useEffect(() => {
    if (!loading && !error && leaderboard.length > 0) {
      // Bắn pháo giấy liên tục trong 3 giây
      const duration = 3 * 1000;
      const end = Date.now() + duration;

      const frame = () => {
        // Pháo giấy góc trái
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#fde047", "#3b82f6", "#ef4444", "#22c55e"], // Vàng, Xanh dương, Đỏ, Xanh lá
        });
        // Pháo giấy góc phải
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#fde047", "#3b82f6", "#ef4444", "#22c55e"],
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();

      // Bật âm thanh vỗ tay
      try {
        const audio = new Audio("/sounds/clap.mp3");
        audio.volume = 0.6; // Đặt âm lượng 60%
        audio
          .play()
          .catch((e) => console.log("Trình duyệt chặn autoplay âm thanh:", e));
      } catch (err) {
        console.log("Không tải được âm thanh");
      }
    }
  }, [loading, error, leaderboard.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-bold mb-4 text-red-400">Có lỗi xảy ra!</h1>
        <p className="text-xl mb-8">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white text-blue-900 px-6 py-3 rounded-full font-bold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Tách riêng Top 3 và danh sách còn lại
  const top3 = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900 text-white p-4 md:p-8 flex flex-col items-center overflow-x-hidden">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center mb-12 mt-8"
      >
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 drop-shadow-lg mb-2">
          TRÒ CHƠI KẾT THÚC
        </h1>
        <p className="text-xl font-bold text-blue-200">
          Bảng Xếp Hạng Chung Cuộc
        </p>
      </motion.div>

      {/* BỤC VINH QUANG TOP 3 */}
      <div className="flex items-end justify-center gap-2 md:gap-6 w-full max-w-3xl mb-12 h-64">
        {/* Hạng 2 */}
        {top3[1] && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
            className="flex flex-col items-center w-1/3"
          >
            <span className="font-bold text-lg mb-2 truncate w-full text-center px-2">
              {top3[1].display_name}
            </span>
            <span className="font-black bg-white/20 px-3 py-1 rounded-lg mb-3">
              {top3[1].score}
            </span>
            <div className="w-full bg-gray-300 h-32 rounded-t-2xl flex justify-center pt-4 shadow-[0_0_30px_rgba(209,213,219,0.3)] border-t-4 border-gray-100 relative">
              <Medal size={40} className="text-gray-500" />
            </div>
          </motion.div>
        )}

        {/* Hạng 1 */}
        {top3[0] && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            className="flex flex-col items-center w-1/3 z-10"
          >
            <Trophy
              size={56}
              className="text-yellow-400 mb-2 drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] animate-bounce"
            />
            <span className="font-black text-2xl mb-1 text-yellow-300 truncate w-full text-center px-2">
              {top3[0].display_name}
            </span>
            <span className="font-black bg-yellow-500/30 text-yellow-200 px-4 py-1 rounded-lg mb-3 border border-yellow-500/50">
              {top3[0].score}
            </span>
            <div className="w-full bg-yellow-400 h-44 rounded-t-2xl flex justify-center pt-4 shadow-[0_0_40px_rgba(250,204,21,0.4)] border-t-4 border-yellow-200 relative">
              <span className="text-6xl font-black text-yellow-600 opacity-50">
                1
              </span>
            </div>
          </motion.div>
        )}

        {/* Hạng 3 */}
        {top3[2] && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
            className="flex flex-col items-center w-1/3"
          >
            <span className="font-bold text-lg mb-2 truncate w-full text-center px-2">
              {top3[2].display_name}
            </span>
            <span className="font-black bg-white/20 px-3 py-1 rounded-lg mb-3">
              {top3[2].score}
            </span>
            <div className="w-full bg-amber-700 h-24 rounded-t-2xl flex justify-center pt-4 shadow-[0_0_30px_rgba(180,83,9,0.3)] border-t-4 border-amber-500 relative">
              <Medal size={32} className="text-amber-900" />
            </div>
          </motion.div>
        )}
      </div>

      {/* DANH SÁCH NHỮNG NGƯỜI CÒN LẠI */}
      {others.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-white/20 mb-8"
        >
          {others.map((player, idx) => (
            <div
              key={player.user_id}
              className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition px-6 py-4 rounded-xl mb-2"
            >
              <span className="font-bold text-lg flex items-center gap-4">
                <span className="text-blue-300 w-6 text-right font-black">
                  {idx + 4}.
                </span>{" "}
                {player.display_name}
              </span>
              <span className="font-black text-lg bg-blue-900/50 px-3 py-1 rounded-lg">
                {player.score}
              </span>
            </div>
          ))}
        </motion.div>
      )}

      {/* NÚT VỀ TRANG CHỦ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="flex gap-4"
      >
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-8 py-4 rounded-2xl font-bold transition shadow-lg backdrop-blur-sm border border-white/10"
        >
          <Home size={20} /> Về trang chủ
        </button>
      </motion.div>
    </div>
  );
}
