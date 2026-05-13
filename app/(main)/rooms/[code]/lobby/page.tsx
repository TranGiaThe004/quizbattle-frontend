// app/(main)/rooms/[code]/lobby/page.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Copy, Play } from "lucide-react";
import { motion } from "framer-motion";

interface Player {
  id: number;
  name: string;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");
  // Dùng useRef để giữ kết nối ws không bị re-render liên tục
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Lấy token để xin quyền vào phòng
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // --- BẮT ĐẦU ĐOẠN CODE ĐÃ ĐƯỢC TỐI ƯU ---
    // Khởi tạo kết nối WebSocket linh hoạt theo môi trường (Dev/Prod)
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    // Tự động chuyển đổi http:// thành ws:// hoặc https:// thành wss://
    const wsBaseUrl = apiUrl.replace(/^http/, 'ws'); 
    const wsUrl = `${wsBaseUrl}/ws/rooms/${roomCode}?token=${token}`;
    // --- KẾT THÚC ĐOẠN CODE ĐÃ ĐƯỢC TỐI ƯU ---

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Đã kết nối vào Sảnh chờ:", roomCode);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Bắt sự kiện room_state từ Backend bắn về
      if (message.event === "room_state") {
        setPlayers(message.data.players);
      }
    };

    ws.onerror = () => {
      setError("Mất kết nối tới máy chủ phòng chờ!");
    };

    // Cleanup: Chạy khi người dùng chuyển trang hoặc đóng Component
    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [roomCode, router]);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      {/* Box Mã Phòng */}
      <div className="bg-primary-container rounded-3xl p-8 text-center shadow-lg mb-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent"></div>
        <p className="text-on-primary-container font-bold uppercase tracking-widest mb-2">
          Room Code
        </p>
        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter text-primary drop-shadow-sm">
          {roomCode}
        </h1>
        <button className="mt-6 flex items-center justify-center gap-2 mx-auto bg-white/50 hover:bg-white px-6 py-3 rounded-full font-bold text-primary transition-all backdrop-blur-sm">
          <Copy size={20} /> Copy Invite Link
        </button>
      </div>

      {error && (
        <div className="bg-error/20 text-error font-bold p-4 rounded-xl text-center mb-6">
          {error}
        </div>
      )}

      {/* Box Danh sách Người chơi */}
      <div className="bg-surface rounded-3xl shadow-md border-2 border-outline-variant p-6 md:p-8">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-secondary-container text-on-secondary-container rounded-xl">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold font-headline">Waiting Room</h2>
          </div>
          <span className="bg-surface-container-highest px-4 py-2 rounded-full font-bold text-on-surface">
            {players.length} Players
          </span>
        </div>

        {/* Grid Avatar hiển thị realtime */}
        {players.length === 0 ? (
          <div className="text-center py-12 text-outline">
            <div className="w-16 h-16 border-4 border-t-primary border-surface-container-high rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-bold text-lg">Waiting for players to join...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {players.map((player) => (
              <motion.div
                key={player.id}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-surface-container py-4 px-2 rounded-2xl border-2 border-transparent hover:border-primary/30 transition-all text-center flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-black text-xl shadow-inner">
                  {player.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-on-surface truncate w-full px-2">
                  {player.name}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Tạm thời hiển thị nút Start Game (Host mới thấy logic này sau) */}
      <div className="mt-8 text-center">
        <button className="bg-secondary text-on-secondary btn-3d font-headline text-2xl px-12 py-5 rounded-2xl inline-flex items-center gap-3 w-full md:w-auto justify-center">
          <Play fill="currentColor" size={28} /> START BATTLE
        </button>
      </div>
    </div>
  );
}