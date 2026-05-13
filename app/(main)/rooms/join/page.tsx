"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Keyboard, ArrowRight } from "lucide-react";

export default function JoinRoomPage() {
  const [roomCode, setRoomCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!roomCode.trim()) {
      setError("Vui lòng nhập mã phòng!");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");

      // KIỂM TRA: Chưa đăng nhập thì bắt đi đăng nhập trước
      if (!token) {
        setError("Bạn cần đăng nhập để chơi!");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      // Gọi API tham gia phòng
      const response = await axios.post(
        `${apiUrl}/api/v1/rooms/join`,
        { room_code: roomCode.toUpperCase() }, // Chuyển thành chữ hoa cho chuẩn
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        // Chuyển hướng thẳng vào Sảnh chờ
        router.push(`/rooms/${roomCode.toUpperCase()}/lobby`);
      }
    } catch (err: any) {
      // Bắt lỗi từ Backend (Phòng không tồn tại, đang chơi...)
      setError(
        err.response?.data?.detail ||
          "Không thể tham gia phòng. Vui lòng kiểm tra lại mã!",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border-2 border-gray-100 p-8 text-center">
        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
          <Keyboard size={40} />
        </div>

        <h1 className="text-3xl font-black text-gray-800 mb-2">
          Tham gia Quiz!
        </h1>
        <p className="text-gray-500 mb-8 font-medium">
          Nhập mã phòng do Chủ phòng cung cấp
        </p>

        <form onSubmit={handleJoin} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value)}
              placeholder="Nhập mã PIN tại đây"
              className="w-full text-center text-3xl font-black tracking-[0.2em] uppercase text-gray-800 bg-gray-50 border-4 border-gray-200 rounded-2xl py-4 focus:border-blue-500 focus:bg-white focus:outline-none transition-all placeholder:text-gray-300 placeholder:text-xl placeholder:tracking-normal placeholder:font-bold"
              maxLength={6}
            />
            {error && (
              <p className="text-red-500 font-bold mt-3 text-sm animate-pulse">
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl py-4 rounded-2xl shadow-[0_6px_0_rgb(29,78,216)] hover:shadow-[0_4px_0_rgb(29,78,216)] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? "Đang kết nối..." : "VÀO PHÒNG NGAY"}{" "}
            <ArrowRight size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}
