"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, LogOut, LayoutDashboard } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [displayName, setDisplayName] = useState("Bạn");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    if (token) {
      const savedName = localStorage.getItem("display_name");

      if (savedName) {
        setDisplayName(savedName);
      } else {
        // 🚀 NẾU CÓ TOKEN NHƯNG CHƯA CÓ TÊN: Chủ động gọi API lấy thông tin profile
        const fetchUserProfile = async () => {
          try {
            const apiUrl =
              process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
            const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
              // Hoặc endpoint profile của team bạn
              headers: { Authorization: `Bearer ${token}` },
            });
            if (response.ok) {
              const resData = await response.json();
              const actualName =
                resData.data?.username || resData.username || "Thành viên";

              // Lưu vào cả State lẫn LocalStorage để lần sau không phải gọi lại API nữa
              setDisplayName(actualName);
              localStorage.setItem("display_name", actualName);
            }
          } catch (err) {
            console.error("Không lấy được profile:", err);
          }
        };

        fetchUserProfile();
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("display_name"); // Xóa luôn tên để dọn dẹp sạch sẽ
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <header className="bg-white flex justify-between items-center px-5 py-3 w-full fixed top-0 left-0 z-50 border-b-4 border-indigo-200 shadow-sm">
      <div className="flex items-center gap-8">
        <span
          className="font-display text-2xl font-black text-indigo-600 italic uppercase tracking-tighter cursor-pointer"
          onClick={() => router.push("/")}
        >
          QuizBattle
        </span>
        <nav className="hidden md:flex gap-6">
          <a
            onClick={() => router.push("/")}
            className={`font-bold text-sm pb-1 cursor-pointer transition-colors ${
              pathname === "/"
                ? "text-indigo-600 border-b-4 border-yellow-400"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Live Battles
          </a>
          <a
            onClick={() => router.push("/quizzes")}
            className={`font-bold text-sm pb-1 cursor-pointer transition-colors ${
              pathname.startsWith("/quizzes")
                ? "text-indigo-600 border-b-4 border-yellow-400"
                : "text-slate-500 hover:text-indigo-600"
            }`}
          >
            Library
          </a>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            {/* --- PHẦN THÊM MỚI: XIN CHÀO & AVATAR --- */}
            <div className="flex items-center gap-3 mr-2">
              <span className="font-bold text-sm text-slate-500 hidden sm:block">
                Xin chào, <span className="text-indigo-600">{displayName}</span>
              </span>
            </div>
            {/* -------------------------------------- */}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ y: 2 }}
              onClick={() => router.push("/dashboard")}
              className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors"
            >
              <LayoutDashboard size={18} /> Dashboard
            </motion.button>
            <div className="flex gap-2 border-r-2 border-slate-200 pr-4">
              <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                <Bell className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/login")}
              className="font-bold text-indigo-600 px-4 py-2 hover:bg-indigo-50 rounded-full transition-colors"
            >
              Log In
            </button>
            <button
              onClick={() => router.push("/login?tab=signup")}
              className="font-bold bg-yellow-400 text-yellow-950 px-6 py-2 rounded-full shadow-md hover:bg-yellow-500 transition-colors"
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
