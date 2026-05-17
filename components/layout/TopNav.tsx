"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Bell, LogOut, LayoutDashboard } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi load trang
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
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
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ y: 2 }}
              onClick={() => router.push("/dashboard")}
              className="hidden md:flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-indigo-700 transition-colors"
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
              onClick={() => router.push("/register")}
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
