"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, Copy, Play } from "lucide-react";
import { motion } from "framer-motion";
import ChatBox from "@/components/game/ChatBox"; // ĐẢM BẢO IMPORT ĐÚNG COMPONENT CHATBOX

interface Player {
  id: number;
  name: string;
}

// Thêm Type cho Chat
interface ChatMessage {
  user_id: string;
  display_name: string;
  message: string;
}

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.code as string;

  const [players, setPlayers] = useState<Player[]>([]);
  const [error, setError] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  // === STATE CHO CHAT ===
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Lấy tên người dùng hiện tại để ChatBox biết tin nhắn nào là của mình (tùy chọn)
    // Giả sử bạn có lưu display_name lúc đăng nhập, nếu không thì cứ để trống cũng không sao
    const savedName = localStorage.getItem("display_name") || "Tôi";
    setCurrentUserDisplayName(savedName);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const wsBaseUrl = apiUrl.replace(/^http/, "ws");
    const wsUrl = `${wsBaseUrl}/ws/rooms/${roomCode}?token=${token}`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Đã kết nối vào Sảnh chờ:", roomCode);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log("📥 [Lobby] Nhận từ Server:", message);

      // Backend của bạn có thể trả về 'event' hoặc 'type', mình bao gộp cả 2 trường hợp
      const eventType = message.event || message.type;

      if (eventType === "room_state") {
        setPlayers(message.data?.players || message.payload?.players || []);
      } else if (eventType === "game_started") {
        const sessionId =
          message.payload?.session_id || message.data?.session_id;
        if (sessionId) {
          localStorage.setItem("game_session_id", sessionId);
        }
        router.push(`/rooms/${roomCode}/play`);
      }
      // [THÊM LOGIC BẮT SỰ KIỆN CHAT TỪ SERVER]
      else if (eventType === "chat_message") {
        const payload = message.payload || message.data;
        if (payload) {
          setChatMessages((prev) => [...prev, payload]);
        }
      }
    };

    ws.onerror = () => {
      setError("Mất kết nối tới máy chủ phòng chờ!");
    };

    return () => {
      // Đóng đường ống bằng mọi giá dù nó đang ở trạng thái nào
      ws.close();
    };
  }, [roomCode, router]);

  // === HÀM GỬI TIN NHẮN CHAT QUA WEBSOCKET ===
  // === HÀM GỬI TIN NHẮN CHAT QUA WEBSOCKET ===
  const handleSendMessage = (msg: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const chatPayload = {
        event: "send_chat", // DÙNG CHỮ 'event'
        data: {
          // DÙNG CHỮ 'data'
          message: msg,
        },
      };
      wsRef.current.send(JSON.stringify(chatPayload));
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

  return (
    <div className="max-w-4xl mx-auto mt-10 relative min-h-[80vh]">
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
        <div className="bg-error/20 text-error font-bold p-4 rounded-xl text-center mb-6 animate-pulse">
          {error}
        </div>
      )}

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

      <div className="mt-8 text-center pb-20">
        <button
          onClick={handleStartGame}
          className="bg-secondary text-on-secondary btn-3d font-headline text-2xl px-12 py-5 rounded-2xl inline-flex items-center gap-3 w-full md:w-auto justify-center"
        >
          <Play fill="currentColor" size={28} /> START BATTLE
        </button>
      </div>

      {/* COMPONENT CHAT BOX HIỂN THỊ Ở GÓC DƯỚI */}
      <ChatBox
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        currentUserDisplayName={currentUserDisplayName}
      />
    </div>
  );
}
