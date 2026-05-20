"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import {
  Trophy,
  RefreshCw,
  Home,
  Star,
  List,
  Medal,
  Loader2,
} from "lucide-react";

interface PlayerResult {
  user_id: number;
  display_name: string;
  score: number;
}

// Bảng màu ngẫu nhiên cho thẻ Avatar người chơi (Giống trang Lobby)
const AVATAR_COLORS = [
  { bg: "bg-indigo-600", text: "text-indigo-100" },
  { bg: "bg-pink-600", text: "text-pink-100" },
  { bg: "bg-green-600", text: "text-green-100" },
  { bg: "bg-blue-600", text: "text-blue-100" },
  { bg: "bg-purple-600", text: "text-purple-100" },
];

export default function ResultPage() {
  const router = useRouter();
  const [leaderboard, setLeaderboard] = useState<PlayerResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");

  // 1. LẤY DỮ LIỆU TỪ API
  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const sessionId = localStorage.getItem("game_session_id");
        const savedName = localStorage.getItem("display_name") || "Tôi";
        setCurrentUserDisplayName(savedName);

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

        if (data.success || data.data) {
          setLeaderboard(
            data.data?.leaderboard || data.leaderboard || data.data,
          );
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

  // Sắp xếp và xếp hạng
  const sortedPlayers = [...leaderboard].sort((a, b) => b.score - a.score);
  const finalScoreboard = sortedPlayers.map((player, index) => ({
    ...player,
    rank: index + 1,
  }));

  const firstPlace = finalScoreboard[0];
  const secondPlace = finalScoreboard[1];
  const thirdPlace = finalScoreboard[2];
  const remainingStandings = finalScoreboard.slice(3, 10); // Lấy tối đa top 10

  const userFinalState = finalScoreboard.find(
    (p) => p.display_name === currentUserDisplayName,
  );
  const userRank = userFinalState ? userFinalState.rank : 999;
  const isUserWinner = userRank === 1;

  // 2. HIỆU ỨNG PHÁO GIẤY & ÂM THANH
  useEffect(() => {
    if (!loading && !error && leaderboard.length > 0) {
      // Âm thanh vỗ tay
      try {
        const audio = new Audio("/sounds/clap.mp3");
        audio.volume = 0.6;
        audio
          .play()
          .catch(() => console.log("Trình duyệt chặn autoplay âm thanh"));
      } catch (err) {}

      // Bắn pháo giấy 5 giây liên tục
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = {
        startVelocity: 30,
        spread: 360,
        ticks: 60,
        zIndex: 100,
      };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 55 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);

      // Pháo giấy nổ ở giữa màn hình nếu người chơi là Top 1
      if (isUserWinner) {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        }, 500);
      }

      return () => clearInterval(interval);
    }
  }, [loading, error, leaderboard.length, isUserWinner]);

  // --- TRẠNG THÁI LOADING & ERROR ---
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-indigo-400">
        <Loader2 className="w-16 h-16 animate-spin mb-4" />
        <h2 className="text-2xl font-black font-display tracking-widest uppercase animate-pulse">
          Đang tổng kết...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-4xl font-bold mb-4 text-red-400">Có lỗi xảy ra!</h1>
        <p className="text-xl mb-8">{error}</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-white text-slate-900 px-6 py-3 rounded-full font-bold"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  // Helper tạo Avatar ngẫu nhiên
  const renderAvatar = (player: any) => {
    const theme = AVATAR_COLORS[player.user_id % AVATAR_COLORS.length];
    return (
      <div
        className={`relative z-10 w-20 h-20 md:w-24 md:h-24 rounded-full border-4 shadow-lg flex items-center justify-center ${theme.bg} ${theme.text}`}
      >
        <span className="font-display font-black text-4xl uppercase">
          {player.display_name.charAt(0)}
        </span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 mx-auto px-4 md:px-8 pb-20 pt-10 flex flex-col items-center overflow-x-hidden select-none">
      {/* Tiêu đề */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10 space-y-2 z-10"
      >
        <h1 className="font-display text-5xl md:text-6xl text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          {isUserWinner ? "CHIẾN THẮNG!" : "HOÀN THÀNH!"}
        </h1>
        <p className="font-sans text-xl md:text-2xl text-yellow-400 font-bold tracking-wide">
          Kết quả chung cuộc
        </p>
      </motion.div>

      {/* BỤC VINH QUANG 3D */}
      <div className="w-full grid grid-cols-3 items-end gap-3 md:gap-10 mb-16 min-h-[400px] max-w-[900px]">
        {/* HẠNG 2 */}
        {secondPlace && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.3 }}
            className="flex flex-col items-center transform translate-y-10"
          >
            <div className="relative mb-5 group flex flex-col items-center">
              <div className="absolute inset-0 bg-slate-300 blur-xl opacity-25 rounded-full"></div>
              {renderAvatar(secondPlace)}
              <div className="absolute -bottom-2 -right-2 z-20 bg-slate-200 text-slate-900 font-extrabold w-8 h-8 rounded-full flex items-center justify-center text-md shadow-md border-2 border-slate-800">
                2
              </div>
            </div>

            <div className="text-center mb-4 z-10">
              <p className="font-display font-bold text-white text-sm md:text-lg truncate max-w-[100px] md:max-w-none">
                {secondPlace.display_name === currentUserDisplayName
                  ? "Bạn"
                  : secondPlace.display_name}
              </p>
              <p className="text-slate-300 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-0.5">
                {secondPlace.score.toLocaleString()} PTS
              </p>
            </div>

            <div className="w-full h-36 md:h-44 bg-slate-500/40 rounded-t-3xl border-t-4 border-slate-400 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <Medal className="text-slate-300 w-10 h-10 md:w-12 md:h-12 relative z-10 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-b from-slate-200/10 to-transparent"></div>
            </div>
          </motion.div>
        )}

        {/* HẠNG 1 */}
        {firstPlace && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.7 }}
            className="flex flex-col items-center z-20"
          >
            <div className="relative mb-6 transform scale-110 flex flex-col items-center">
              <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-40 animate-pulse rounded-full"></div>

              <div className="absolute -top-10 text-yellow-400 w-12 h-12 flex items-center justify-center animate-bounce z-30">
                <Trophy className="w-10 h-10 filter drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
              </div>

              {renderAvatar(firstPlace)}

              <div className="absolute -bottom-2 -right-2 z-20 bg-yellow-400 text-slate-900 font-extrabold w-9 h-9 rounded-full flex items-center justify-center text-lg shadow-xl border-2 border-slate-900">
                1
              </div>
            </div>

            <div className="text-center mb-5 z-10">
              <p className="font-display font-extrabold text-white text-base md:text-xl truncate max-w-[120px] md:max-w-none">
                {firstPlace.display_name === currentUserDisplayName
                  ? "Bạn"
                  : firstPlace.display_name}
              </p>
              <p className="text-yellow-400 font-bold text-xs md:text-base uppercase tracking-widest mt-0.5 animate-pulse">
                {firstPlace.score.toLocaleString()} PTS
              </p>
            </div>

            <div className="w-full h-52 md:h-64 bg-yellow-500/50 rounded-t-3xl border-t-4 border-yellow-300 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <Trophy className="text-yellow-200 w-12 h-12 md:w-16 md:h-16 relative z-10 drop-shadow-md" />
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/20 to-transparent"></div>
            </div>
          </motion.div>
        )}

        {/* HẠNG 3 */}
        {thirdPlace && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.5 }}
            className="flex flex-col items-center transform translate-y-16"
          >
            <div className="relative mb-5 group flex flex-col items-center">
              <div className="absolute inset-0 bg-orange-600 blur-xl opacity-25 rounded-full"></div>
              {renderAvatar(thirdPlace)}
              <div className="absolute -bottom-2 -right-2 z-20 bg-orange-500 text-white font-extrabold w-8 h-8 rounded-full flex items-center justify-center text-md shadow-md border-2 border-slate-800">
                3
              </div>
            </div>

            <div className="text-center mb-4 z-10">
              <p className="font-display font-bold text-white text-sm md:text-lg truncate max-w-[100px] md:max-w-none">
                {thirdPlace.display_name === currentUserDisplayName
                  ? "Bạn"
                  : thirdPlace.display_name}
              </p>
              <p className="text-orange-300 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-0.5">
                {thirdPlace.score.toLocaleString()} PTS
              </p>
            </div>

            <div className="w-full h-28 md:h-36 bg-orange-800/40 rounded-t-3xl border-t-4 border-orange-500 flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <Star className="text-orange-300 w-10 h-10 md:w-12 md:h-12 relative z-10" />
              <div className="absolute inset-0 bg-gradient-to-b from-orange-400/10 to-transparent"></div>
            </div>
          </motion.div>
        )}
      </div>

      {/* DANH SÁCH CÁC HẠNG TIẾP THEO (4+) */}
      {remainingStandings.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="w-full max-w-[800px] bg-white/5 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 mb-12"
        >
          <h3 className="font-display font-bold text-xl text-white mb-6 flex items-center gap-2">
            <List className="text-indigo-400 w-6 h-6" />
            Bảng xếp hạng tiếp theo
          </h3>

          <div className="space-y-4">
            {remainingStandings.map((player) => {
              const isMe = player.display_name === currentUserDisplayName;
              const theme =
                AVATAR_COLORS[player.user_id % AVATAR_COLORS.length];

              return (
                <div
                  key={player.user_id}
                  className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    isMe
                      ? "bg-indigo-600/20 border-indigo-400 shadow-md"
                      : "bg-white/5 border-transparent hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-6">
                    <span className="font-black text-lg md:text-2xl text-indigo-300 w-6">
                      {player.rank}
                    </span>
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-black ${theme.bg} ${theme.text}`}
                    >
                      {player.display_name.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`font-bold text-sm md:text-lg ${isMe ? "text-yellow-400" : "text-white"}`}
                    >
                      {isMe
                        ? `${player.display_name} (Bạn)`
                        : player.display_name}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-slate-200 block text-sm uppercase tracking-tight">
                      {player.score.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* CÁC NÚT ĐIỀU HƯỚNG */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex flex-col sm:flex-row gap-4 w-full max-w-[800px] z-10"
      >
        <button
          onClick={() => router.push("/quizzes")}
          className="flex-1 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border-2 border-indigo-500 text-indigo-200 font-bold text-lg shadow-lg hover:border-indigo-400 active:translate-y-1 transition-all flex items-center justify-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          CHƠI TIẾP TRẬN MỚI
        </button>

        <button
          onClick={() => router.push("/dashboard")}
          className="flex-1 py-4 rounded-2xl bg-yellow-500 text-slate-900 font-black text-lg shadow-[0_6px_0_0_#a16207] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_#a16207] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3"
        >
          <Home className="w-5 h-5" />
          VỀ TRANG CHỦ
        </button>
      </motion.div>
    </div>
  );
}
