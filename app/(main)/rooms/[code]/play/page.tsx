// app/(main)/rooms/[code]/play/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// --- CÁC INTERFACES KIỂU DỮ LIỆU ---
interface Option {
  id: number;
  text: string;
}

interface Question {
  question_id: number;
  question_text: string;
  options: Option[];
  time_limit_seconds: number;
  server_started_at: string;
}

interface Result {
  correct_option_ids: number[];
}

// [THÊM Ở SPRINT 5]: Interface cho Bảng xếp hạng Live
interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  score: number;
}

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  // --- CÁC STATE QUẢN LÝ TRÒ CHƠI ---
  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string>("");
  const [gameFinished, setGameFinished] = useState<boolean>(false);
  
  // [THÊM Ở SPRINT 5]: State lưu bảng xếp hạng live
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const optionColors = [
    "bg-red-500 hover:bg-red-600 border-red-700",
    "bg-blue-500 hover:bg-blue-600 border-blue-700",
    "bg-yellow-500 hover:bg-yellow-600 border-yellow-700 text-black",
    "bg-green-500 hover:bg-green-600 border-green-700",
  ];

  // --- 1. LẮNG NGHE WEBSOCKET ---
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsBaseUrl = apiUrl.replace(/^http/, "ws");
    const wsUrl = `${wsBaseUrl}/ws/rooms/${roomCode}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("📥 Nhận từ Server:", message);

      if (message.event === "question_started") {
        setQuestion(message.payload);
        setHasSubmitted(false);
        setSelectedOptionId(null);
        setResult(null); 
      } 
      else if (message.event === "question_result") {
        setResult(message.payload);
      } 
      // [THÊM Ở SPRINT 5]: Hứng sự kiện bảng xếp hạng cập nhật
      else if (message.event === "leaderboard_updated") {
        setLeaderboard(message.payload);
      }
      else if (message.event === "game_finished") {
        setGameFinished(true);
        setTimeout(() => {
           router.push(`/rooms/${roomCode}/result`);
        }, 3000);
      }
    };

    ws.onerror = () => setError("Mất kết nối WebSocket!");

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomCode, router]);

  // --- 2. LOGIC ĐỒNG HỒ ĐẾM NGƯỢC ---
  useEffect(() => {
    if (!question || result) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const startAt = new Date(question.server_started_at).getTime();
    const limitMs = question.time_limit_seconds * 1000;

    timerRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startAt;
      const remainingMs = Math.max(0, limitMs - elapsed);
      setTimeLeft(Math.ceil(remainingMs / 1000));

      if (remainingMs <= 0 && timerRef.current) {
        clearInterval(timerRef.current);
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [question, result]);

  // --- 3. LOGIC GỬI ĐÁP ÁN ---
  const handleSelectOption = (optionId: number) => {
    if (hasSubmitted || result || !question) return;

    const gameSessionId = localStorage.getItem("game_session_id");
    const startAt = new Date(question.server_started_at).getTime();
    const responseTimeMs = Date.now() - startAt;

    setHasSubmitted(true);
    setSelectedOptionId(optionId);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "submit_answer",
          payload: {
            question_id: question.question_id,
            selected_option_id: optionId,
            game_session_id: parseInt(gameSessionId || "0"),
            response_time_ms: responseTimeMs,
          },
        })
      );
    }
  };

  if (!question) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold font-headline animate-pulse">Sẵn sàng! Trò chơi sắp bắt đầu...</h2>
        </div>
      </div>
    );
  }

  const timerPercentage = (timeLeft / question.time_limit_seconds) * 100;
  const isCorrect = result ? result.correct_option_ids.includes(selectedOptionId || -1) : false;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative overflow-hidden">
      <div className="w-full h-4 bg-gray-200">
        <motion.div
          className={`h-full ${timeLeft <= 5 ? "bg-red-500" : "bg-blue-600"}`}
          initial={{ width: "100%" }}
          animate={{ width: `${timerPercentage}%` }}
          transition={{ duration: 0.1, ease: "linear" }}
        />
      </div>

      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
           <span className="font-bold text-gray-500">Câu hỏi: {question.question_id}</span>
           <div className={`text-3xl font-black rounded-full w-16 h-16 flex items-center justify-center border-4 ${timeLeft <= 5 ? "text-red-500 border-red-500 animate-bounce" : "text-gray-700 border-gray-300"}`}>
              {timeLeft}
           </div>
        </div>

        <div className="bg-white flex-1 min-h-[200px] flex items-center justify-center p-8 rounded-3xl shadow-md border-b-8 border-gray-200">
          <h1 className="text-3xl md:text-5xl font-bold text-center leading-tight">
            {question.question_text}
          </h1>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-2 rounded-lg text-center font-bold">{error}</div>}

        {hasSubmitted && !result && (
           <div className="text-center bg-blue-100 text-blue-700 p-4 rounded-xl font-bold animate-pulse">
              Đã gửi đáp án! Đang chờ những người chơi khác...
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-[300px]">
          {question.options.map((opt, index) => {
            const bgColor = optionColors[index % optionColors.length];
            const isSelected = selectedOptionId === opt.id;
            const opacityClass = hasSubmitted && !isSelected ? "opacity-50 scale-95" : "opacity-100";

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={hasSubmitted || result !== null}
                className={`${bgColor} ${opacityClass} text-white text-2xl md:text-4xl font-bold rounded-2xl border-b-8 active:border-b-0 active:translate-y-2 transition-all p-6 flex items-center justify-center shadow-md`}
              >
                {opt.text}
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-4 ${
              !selectedOptionId
                ? "bg-gray-800"
                : isCorrect
                ? "bg-green-500"
                : "bg-red-600"
            }`}
          >
            <h1 className="text-5xl md:text-7xl font-black text-white mb-2 drop-shadow-lg text-center">
              {!selectedOptionId ? "HẾT GIỜ!" : isCorrect ? "CHÍNH XÁC!" : "SAI RỒI!"}
            </h1>
            <p className="text-xl text-white font-bold mb-6 text-center">
              {!selectedOptionId ? "Bạn chưa chọn đáp án nào" : (isCorrect ? "+ Điểm cho bạn!" : "Cố gắng ở câu sau nhé!")}
            </p>
            
            {/* [THÊM Ở SPRINT 5]: HIỂN THỊ TOP 5 LEADERBOARD LIVE */}
            {leaderboard.length > 0 && (
              <div className="bg-black/30 backdrop-blur-md p-6 rounded-3xl w-full max-w-md shadow-2xl border border-white/20 mt-4">
                <h3 className="text-white font-black text-2xl mb-4 text-center tracking-widest uppercase">
                  Top 5 Hiện Tại
                </h3>
                <div className="flex flex-col gap-2">
                  {leaderboard.slice(0, 5).map((player, idx) => (
                    <div key={player.user_id} className="flex justify-between items-center bg-white/10 px-4 py-3 rounded-xl text-white">
                      <span className="font-bold text-lg">
                        <span className="inline-block w-6 text-yellow-300">{idx + 1}.</span> {player.display_name}
                      </span>
                      <span className="font-black text-lg bg-white/20 px-3 py-1 rounded-lg">{player.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {gameFinished && (
               <div className="mt-8 text-white text-xl animate-pulse font-bold bg-black/50 px-6 py-3 rounded-full">
                 Đang tải Bảng xếp hạng chung cuộc...
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}