"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, QrCode, Play, Zap } from "lucide-react";
import ChatBox from "@/components/game/ChatBox";

interface Player {
  id: number;
  name: string;
}

interface ChatMessage {
  user_id: string;
  display_name: string;
  message: string;
}

// Bảng màu ngẫu nhiên cho thẻ Avatar người chơi
const AVATAR_COLORS = [
  { bg: "bg-indigo-100", border: "border-indigo-300", text: "text-indigo-700" },
  { bg: "bg-yellow-100", border: "border-yellow-400", text: "text-yellow-700" },
  { bg: "bg-green-100", border: "border-green-400", text: "text-green-700" },
  { bg: "bg-pink-100", border: "border-pink-300", text: "text-pink-700" },
  { bg: "bg-orange-100", border: "border-orange-300", text: "text-orange-700" },
];

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  // --- STATES LOGIC GAME ---
  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");
  const wsRef = useRef<WebSocket | null>(null);
  const prevPlayersCount = useRef(0);

  // --- STATES UI & CHAT ---
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");
  const [toastMessage, setToastMessage] = useState<{
    name: string;
    time: number;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

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

    ws.onopen = () => {
      console.log("Đã kết nối vào Sảnh chờ:", roomCode);
      setError("");
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      const eventType = message.event || message.type;

      if (eventType === "room_state") {
        const newPlayers =
          message.data?.players || message.payload?.players || [];
        setPlayers(newPlayers);

        // Kích hoạt Toast khi có người mới join
        if (
          newPlayers.length > prevPlayersCount.current &&
          prevPlayersCount.current > 0
        ) {
          const newestPlayer = newPlayers[newPlayers.length - 1];
          setToastMessage({ name: newestPlayer.name, time: Date.now() });
        }
        prevPlayersCount.current = newPlayers.length;
      } else if (eventType === "game_started") {
        const sessionId =
          message.payload?.session_id || message.data?.session_id;
        if (sessionId) localStorage.setItem("game_session_id", sessionId);
        router.push(`/rooms/${roomCode}/play`);
      } else if (eventType === "chat_message") {
        const payload = message.payload || message.data;
        if (payload) setChatMessages((prev) => [...prev, payload]);
      }
    };

    ws.onerror = () => setError("Mất kết nối tới máy chủ phòng chờ!");

    return () => {
      ws.onerror = null;
      ws.onmessage = null;
      ws.onclose = null;
      ws.close();
    };
  }, [roomCode, router]);

  // Tự động tắt Toast thông báo sau 3 giây
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // ==========================================
  // 2. ACTIONS
  // ==========================================
  const handleSendMessage = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ event: "send_chat", data: { message: msg } }),
      );
    }
  };

  const handleStartGame = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      const response = await fetch(`${apiUrl}/api/v1/rooms/${roomCode}/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        setError(data.message || data.detail || "Không thể bắt đầu game!");
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ khi bắt đầu game!");
    }
  };

  const handleCopyLink = () => {
    // Tạo link join tự động dựa trên URL hiện tại
    const joinUrl = `${window.location.origin}/rooms/join?code=${roomCode}`;
    navigator.clipboard.writeText(joinUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // ==========================================
  // 3. UI RENDER (ĐÃ THU NHỎ ~80%)
  // ==========================================
  return (
    <div className="min-h-screen relative overflow-x-hidden bg-slate-50 font-sans pb-24">
      {/* Background Decoration */}
      <div className="fixed -z-10 top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-60 h-60 bg-indigo-300 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-yellow-300 rounded-full blur-[100px]"></div>
      </div>

      <main className="pt-8 px-4 max-w-[960px] mx-auto flex flex-col items-center gap-6">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border-2 border-red-300 text-red-600 font-bold p-3 rounded-lg text-center w-full max-w-lg text-sm animate-pulse">
            {error}
          </div>
        )}

        {/* Game PIN Card */}
        <section className="w-full flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-2xl p-6 shadow-[0px_6px_15px_rgba(79,70,229,0.1)] border-b-8 border-indigo-100 relative overflow-hidden text-center"
          >
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-600 to-transparent"></div>
            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="font-bold text-xs text-indigo-700 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
                Waiting for players...
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-slate-800 font-black tracking-tighter drop-shadow-sm">
                PIN: {roomCode}
              </h1>
              <div className="flex flex-wrap justify-center gap-3 mt-2">
                <button
                  onClick={handleCopyLink}
                  className="bg-yellow-400 text-yellow-950 px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all"
                >
                  <Copy className="w-4 h-4" />
                  {isCopied ? "COPIED!" : "COPY INVITE LINK"}
                </button>
                <button className="bg-slate-50 text-indigo-600 px-5 py-2.5 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-slate-100 transition-colors border-2 border-indigo-100">
                  <QrCode className="w-4 h-4" />
                  SHOW QR CODE
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Player Count */}
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 text-white w-11 h-11 rounded-full flex items-center justify-center font-display font-black text-xl shadow-md border-2 border-indigo-200">
            {players.length}
          </div>
          <h2 className="font-display text-2xl font-black text-slate-800">
            Players Ready
          </h2>
        </div>

        {/* Player Grid */}
        <section className="w-full grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-3">
          <AnimatePresence>
            {players.map((player, idx) => {
              const theme = AVATAR_COLORS[player.id % AVATAR_COLORS.length];

              return (
                <motion.div
                  layout
                  key={player.id}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl ${theme.bg} flex items-center justify-center border-b-[3px] ${theme.border} group-hover:scale-105 group-hover:-translate-y-1 transition-all overflow-hidden shadow-sm`}
                  >
                    <span
                      className={`font-display font-black text-3xl ${theme.text} uppercase`}
                    >
                      {player.name.charAt(0)}
                    </span>
                  </div>
                  <span className="font-bold text-xs text-slate-700 text-center line-clamp-1 px-1 bg-white/50 rounded-md">
                    {player.name}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {players.length === 0 && (
            <div className="col-span-full text-center py-8 opacity-50">
              <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="font-bold text-sm text-slate-500">
                Đang chờ kết nối...
              </p>
            </div>
          )}
        </section>
      </main>

      {/* Footer / Start Button */}
      <footer className="fixed bottom-0 left-0 w-full p-4 md:p-6 flex justify-center bg-gradient-to-t from-slate-50 via-slate-50/90 to-transparent z-40 pointer-events-none">
        <motion.button
          onClick={handleStartGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto bg-indigo-600 text-white px-10 md:px-16 py-4 md:py-5 rounded-3xl font-display text-xl md:text-2xl font-black shadow-[0px_6px_0px_0px_#3730a3] active:translate-y-1.5 active:shadow-none flex items-center gap-3 transition-all hover:bg-indigo-700"
        >
          <Play className="w-6 h-6 fill-current" />
          START BATTLE
        </motion.button>
      </footer>

      {/* Component Chat Góc Dưới */}
      <div className="relative z-50 ">
        <ChatBox
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          currentUserDisplayName={currentUserDisplayName}
        />
      </div>

      {/* Thông báo (Toast) người mới Join */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
            className="fixed right-4 md:right-6 top-20 bg-white p-3 rounded-xl shadow-lg flex items-center gap-3 border-l-4 border-green-500 z-50"
          >
            <div className="bg-green-100 p-1.5 rounded-full">
              <Zap className="w-4 h-4 text-green-600 fill-current" />
            </div>
            <div>
              <p className="font-bold text-xs text-slate-800 truncate max-w-[120px]">
                {toastMessage.name}{" "}
                <span className="text-green-600">joined!</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
