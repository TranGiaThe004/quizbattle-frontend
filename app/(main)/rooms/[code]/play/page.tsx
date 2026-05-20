"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Triangle,
  Hexagon,
  Circle,
  Square,
  Check,
  Timer as TimerIcon,
  Trophy,
  Loader2,
} from "lucide-react";
import ChatBox from "@/components/game/ChatBox";

// --- INTERFACES ---
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

interface LeaderboardEntry {
  user_id: number;
  display_name: string;
  score: number;
}

interface ChatMessage {
  user_id: string;
  display_name: string;
  message: string;
}

// Cấu hình UI cho 4 lựa chọn đáp án
const OPTION_STYLES = [
  {
    icon: Triangle,
    color: "bg-red-500",
    border: "border-red-700",
    shadow: "shadow-red-500/50",
  },
  {
    icon: Hexagon,
    color: "bg-blue-500",
    border: "border-blue-700",
    shadow: "shadow-blue-500/50",
  },
  {
    icon: Circle,
    color: "bg-yellow-400",
    border: "border-yellow-600",
    shadow: "shadow-yellow-400/50",
  },
  {
    icon: Square,
    color: "bg-green-500",
    border: "border-green-700",
    shadow: "shadow-green-500/50",
  },
];

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  // --- GAME STATES ---
  type GameState = "LOADING" | "ANSWERING" | "FEEDBACK" | "LEADERBOARD";
  const [gameState, setGameState] = useState<GameState>("LOADING");

  const [question, setQuestion] = useState<Question | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [gameFinished, setGameFinished] = useState<boolean>(false);

  // --- CHAT STATES ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");

  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Lấy điểm hiện tại của người chơi
  const currentScore =
    leaderboard.find((p) => p.display_name === currentUserDisplayName)?.score ||
    0;

  // ==========================================
  // 1. WEBSOCKET LOGIC
  // ==========================================
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    const savedName = localStorage.getItem("display_name") || "Tôi";
    setCurrentUserDisplayName(savedName);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsBaseUrl = apiUrl.replace(/^http/, "ws");
    const wsUrl = `${wsBaseUrl}/ws/rooms/${roomCode}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const eventType = message.event || message.type;

      if (eventType === "question_started") {
        setQuestion(message.payload || message.data);
        setHasSubmitted(false);
        setSelectedOptionId(null);
        setResult(null);
        setGameState("ANSWERING");
      } else if (eventType === "question_result") {
        setResult(message.payload || message.data);
        setGameState("FEEDBACK");
      } else if (eventType === "leaderboard_updated") {
        setLeaderboard(
          message.payload?.leaderboard ||
            message.data?.leaderboard ||
            message.payload ||
            message.data,
        );
        setTimeout(() => {
          setGameState((prevState) => {
            // Chỉ đổi sang Leaderboard nếu màn hình hiện tại vẫn đang là Feedback
            if (prevState === "FEEDBACK") return "LEADERBOARD";
            return prevState;
          });
        }, 3500);
      } else if (eventType === "last_question_warning") {
        setGameFinished(true); // Bật cờ này lập tức để chữ dưới bảng xếp hạng đổi thành "Đang tổng kết..."
      } else if (eventType === "game_finished") {
        // Không cần setGameFinished nữa, chỉ làm nhiệm vụ chuyển trang
        setTimeout(() => {
          router.push(`/rooms/${roomCode}/result`);
        }, 500);
      } else if (eventType === "chat_message") {
        const payload = message.payload || message.data;
        if (payload) setChatMessages((prev) => [...prev, payload]);
      }
    };

    return () => {
      ws.onerror = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.close();
    };
  }, [roomCode, router]);

  // ==========================================
  // 2. TIMER LOGIC
  // ==========================================
  useEffect(() => {
    if (!question || gameState !== "ANSWERING") {
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
  }, [question, gameState]);

  // ==========================================
  // 3. ACTIONS
  // ==========================================
  const handleSelectOption = (optionId: number) => {
    if (hasSubmitted || gameState !== "ANSWERING" || !question) return;

    const gameSessionId = localStorage.getItem("game_session_id");
    const startAt = new Date(question.server_started_at).getTime();
    const responseTimeMs = Date.now() - startAt;

    setHasSubmitted(true);
    setSelectedOptionId(optionId);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: "submit_answer",
          data: {
            question_id: question.question_id,
            selected_option_id: optionId,
            game_session_id: parseInt(gameSessionId || "0"),
            response_time_ms: responseTimeMs,
          },
        }),
      );
    }
  };

  const handleSendMessage = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: "send_chat", data: { message: msg } }),
      );
    }
  };

  // ==========================================
  // UI HELPERS
  // ==========================================
  if (gameState === "LOADING" || !question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 text-indigo-900">
        <Loader2 className="w-16 h-16 animate-spin mb-4 text-indigo-600" />
        <h2 className="text-2xl font-black font-display animate-pulse tracking-widest uppercase">
          Sẵn sàng...
        </h2>
      </div>
    );
  }

  const timerPercentage = (timeLeft / question.time_limit_seconds) * 100;
  const isCorrect = result?.correct_option_ids.includes(selectedOptionId || -1);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center relative overflow-hidden">
      <main className="w-full max-w-[800px] mt-8 mb-16 px-4 md:px-8 flex flex-col gap-8 z-10">
        <AnimatePresence mode="wait">
          {/* TRẠNG THÁI 1 & 2: TRẢ LỜI CÂU HỎI VÀ XEM ĐÁP ÁN */}
          {(gameState === "ANSWERING" || gameState === "FEEDBACK") && (
            <motion.div
              key="question-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col gap-6"
            >
              {/* FEEDBACK OVERLAY (Hiện khi có kết quả) */}
              {gameState === "FEEDBACK" && (
                <motion.div
                  initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                  animate={{ scale: 1, rotate: -2, opacity: 1 }}
                  className={`mx-auto py-3 px-8 rounded-full shadow-lg border-b-4 mb-2 ${
                    !selectedOptionId
                      ? "bg-slate-700 text-white border-slate-900"
                      : isCorrect
                        ? "bg-green-500 text-white border-green-700"
                        : "bg-red-500 text-white border-red-700"
                  }`}
                >
                  <span className="font-display text-3xl font-black italic uppercase">
                    {!selectedOptionId
                      ? "HẾT GIỜ!"
                      : isCorrect
                        ? "CHÍNH XÁC!"
                        : "SAI RỒI!"}
                  </span>
                </motion.div>
              )}

              {/* THẺ CÂU HỎI */}
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-full">
                    Câu hỏi {question.question_id}
                  </span>
                  {gameState === "ANSWERING" && (
                    <div className="flex items-center gap-2 font-black text-2xl text-indigo-600">
                      <TimerIcon className="w-6 h-6" /> {timeLeft}s
                    </div>
                  )}
                </div>

                {/* Thanh thời gian */}
                <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner relative">
                  <motion.div
                    className={`h-full rounded-full ${timeLeft <= 5 ? "bg-red-500" : "bg-indigo-500"}`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${timerPercentage}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>

                {/* Nội dung câu hỏi */}
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-md border-2 border-slate-200 flex items-center justify-center min-h-[200px]">
                  <h2 className="font-display text-3xl md:text-5xl font-black text-center text-slate-800 leading-tight">
                    {question.question_text}
                  </h2>
                </div>
              </div>

              {/* LƯỚI ĐÁP ÁN */}
              <div
                className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${gameState === "FEEDBACK" ? "pointer-events-none" : ""}`}
              >
                {question.options.map((opt, index) => {
                  const style = OPTION_STYLES[index % OPTION_STYLES.length];
                  const Icon = style.icon;
                  const isActuallyCorrect = result?.correct_option_ids.includes(
                    opt.id,
                  );
                  const isActuallySelected = selectedOptionId === opt.id;

                  // Styling cho trạng thái FEEDBACK
                  if (gameState === "FEEDBACK") {
                    return (
                      <div
                        key={opt.id}
                        className={`relative rounded-3xl p-6 flex flex-col items-center gap-3 border-4 transition-all duration-500 ${
                          isActuallyCorrect
                            ? "bg-green-100 border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.4)] scale-105 z-10"
                            : "bg-slate-100 border-slate-200 opacity-50 grayscale scale-95"
                        }`}
                      >
                        {isActuallyCorrect && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-4 -right-4 bg-green-500 text-white rounded-full p-2 shadow-lg"
                          >
                            <Check className="w-6 h-6 stroke-[4]" />
                          </motion.div>
                        )}
                        <Icon
                          className={`w-12 h-12 ${isActuallyCorrect ? "text-green-600" : "text-slate-400"} fill-current`}
                        />
                        <span
                          className={`font-display text-2xl font-bold ${isActuallyCorrect ? "text-green-900" : "text-slate-600"}`}
                        >
                          {opt.text}
                        </span>

                        {/* HIỆU ỨNG CỘNG ĐIỂM NẢY LÊN KHI CHỌN ĐÚNG */}
                        {isActuallyCorrect && isActuallySelected && (
                          <motion.div
                            initial={{ y: 0, opacity: 0, scale: 0.5 }}
                            animate={{ y: -80, opacity: 1, scale: 1.2 }}
                            className="absolute text-yellow-500 font-display text-4xl font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]"
                          >
                            + ĐIỂM
                          </motion.div>
                        )}
                      </div>
                    );
                  }

                  // Styling cho trạng thái ANSWERING
                  return (
                    <motion.button
                      key={opt.id}
                      whileHover={!hasSubmitted ? { scale: 1.02 } : {}}
                      whileTap={!hasSubmitted ? { scale: 0.95 } : {}}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={hasSubmitted}
                      className={`flex flex-col items-center justify-center gap-3 rounded-3xl p-8 border-b-[8px] transition-all ${style.color} ${style.border} text-white ${
                        hasSubmitted && !isActuallySelected
                          ? "opacity-50 grayscale"
                          : "opacity-100 shadow-lg"
                      }`}
                    >
                      <Icon className="w-14 h-14 fill-current drop-shadow-md" />
                      <span className="font-display text-2xl md:text-3xl font-bold drop-shadow-md">
                        {opt.text}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TRẠNG THÁI 3: BẢNG XẾP HẠNG (Chuyển tự động sau khi xem kết quả) */}
          {gameState === "LEADERBOARD" && (
            <motion.div
              key="leaderboard-view"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-indigo-900 text-white rounded-[2.5rem] p-6 md:p-10 shadow-2xl border-b-[12px] border-indigo-950 relative overflow-hidden"
            >
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

              <div className="text-center mb-10 relative z-10 flex flex-col items-center">
                <Trophy className="w-16 h-16 text-yellow-400 mb-2 drop-shadow-lg" />
                <h2 className="font-display text-4xl md:text-5xl font-black italic text-yellow-400 tracking-tighter uppercase drop-shadow-md">
                  Top Xếp Hạng
                </h2>
              </div>

              <div className="flex flex-col gap-3 relative z-10">
                {leaderboard.slice(0, 5).map((player, idx) => {
                  const isMe = player.display_name === currentUserDisplayName;
                  return (
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 100,
                      }}
                      key={player.user_id}
                      className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isMe
                          ? "bg-yellow-400 text-yellow-950 scale-[1.02] shadow-[0_4px_0_0_#b45309] z-10"
                          : "bg-white/10 border border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-inner ${
                          isMe
                            ? "bg-white text-yellow-600"
                            : "bg-indigo-800 text-white"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 font-display font-bold text-xl truncate">
                        {player.display_name}
                      </div>
                      <div className="text-right">
                        <div className="font-display font-black text-2xl">
                          {player.score.toLocaleString()}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-center mt-10 text-indigo-300 font-bold animate-pulse flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                {gameFinished
                  ? "Đang tổng kết điểm số chung cuộc..."
                  : "Đang chuẩn bị câu hỏi tiếp theo..."}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Component Chat Góc Dưới */}
      <div className="relative z-50">
        <ChatBox
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentUserDisplayName={currentUserDisplayName}
        />
      </div>
    </div>
  );
}
