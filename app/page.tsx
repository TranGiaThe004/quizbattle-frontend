"use client";

import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bell,
  Settings,
  Rocket,
  PlayCircle,
  Star,
  PlusCircle,
  Layers,
  Trophy,
  Medal,
  TrendingUp,
  Share2,
  Globe,
  Sparkles,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import TopNav from "@/components/layout/TopNav";
import { fetchWithAuth } from "@/lib/fetchApi";

export default function HomePage() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");

  // State quản lý việc Join phòng
  const [isJoining, setIsJoining] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleJoinGame = async () => {
    if (!roomCode.trim()) return;
    setErrorMsg("");

    const token = localStorage.getItem("access_token");
    if (!token) {
      setErrorMsg("Vui lòng đăng nhập để tham gia!");
      setTimeout(() => router.push("/login"), 1500);
      return;
    }
    setIsJoining(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetchWithAuth(`${apiUrl}/api/v1/rooms/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ room_code: roomCode.toUpperCase() }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        router.push(`/rooms/${roomCode.toUpperCase()}/lobby`);
      } else {
        setErrorMsg(data.message || "Mã phòng không hợp lệ!");
      }
    } catch (error) {
      setErrorMsg("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-yellow-400 selection:text-yellow-950 font-sans">
      {/* Top Navigation Bar */}
      <TopNav />

      <main className="pt-24 max-w-[1280px] mx-auto px-5 pb-8">
        {/* Hero Section */}
        <section className="relative w-full h-[500px] mb-8 rounded-3xl overflow-hidden flex items-center justify-center bg-indigo-900 shadow-2xl border-4 border-indigo-200">
          <div className="absolute inset-0 opacity-30 bg-[url('https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/80 via-transparent to-purple-800/80"></div>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative z-10 bg-white p-10 rounded-3xl shadow-[0px_10px_0px_0px_#cbd5e1] border-2 border-slate-200 max-w-md w-full flex flex-col items-center gap-6 text-center"
          >
            <h1 className="font-display text-4xl font-extrabold text-slate-900">
              Ready for Battle?
            </h1>
            <p className="text-slate-500 font-medium">
              Enter your Game PIN and prove your dominance.
            </p>
            <div className="w-full flex flex-col gap-4">
              <input
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setErrorMsg(""); // Gõ phím là tự xóa dòng lỗi
                }}
                onKeyDown={(e) => e.key === "Enter" && handleJoinGame()}
                className={`w-full text-center font-display text-3xl tracking-[0.3em] py-6 rounded-2xl border-4 ${errorMsg ? "border-red-400 focus:ring-red-100 text-red-600" : "border-slate-200 focus:border-indigo-400 focus:ring-indigo-100 text-indigo-600"} bg-slate-50 placeholder:text-slate-400 placeholder:tracking-normal uppercase outline-none transition-all font-black`}
                placeholder="GAME PIN"
                type="text"
                maxLength={6}
                disabled={isJoining}
              />

              {/* Hiển thị dòng lỗi nếu có */}
              {errorMsg && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-500 font-bold text-sm"
                >
                  {errorMsg}
                </motion.p>
              )}

              <motion.button
                onClick={handleJoinGame}
                disabled={isJoining || !roomCode.trim()}
                whileHover={
                  !isJoining && roomCode.trim() ? { scale: 1.02 } : {}
                }
                whileTap={
                  !isJoining && roomCode.trim() ? { y: 6, shadow: "none" } : {}
                }
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-display text-2xl font-black transition-all ${
                  !roomCode.trim()
                    ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : isJoining
                      ? "bg-yellow-500 text-yellow-950 opacity-80 cursor-wait"
                      : "bg-yellow-400 text-yellow-950 shadow-[0px_6px_0px_0px_#b45309] hover:bg-yellow-500"
                }`}
              >
                {isJoining ? (
                  <div className="w-8 h-8 border-4 border-yellow-950 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Rocket className="w-8 h-8 fill-current" />
                    Join Game
                  </>
                )}
              </motion.button>
            </div>
          </motion.div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            {/* Live Status */}
            <div className="bg-rose-500 text-white p-4 rounded-2xl flex items-center justify-between shadow-md border-2 border-rose-600">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-black text-xs uppercase tracking-widest">
                  Live Now
                </span>
                <span className="text-lg font-bold">
                  12,842 Players Battling
                </span>
              </div>
            </div>

            {/* Featured Quizzes */}
            <section>
              <div className="flex justify-between items-end mb-6">
                <h2 className="font-display text-3xl font-extrabold text-slate-900">
                  Featured Quizzes
                </h2>
                <a
                  className="text-indigo-600 font-bold text-sm hover:underline cursor-pointer"
                  onClick={() => router.push("/quizzes")}
                >
                  See All
                </a>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuizCard
                  category="IT & Tech"
                  title="FastAPI Masterclass"
                  plays="4.2k"
                  description="Test your knowledge on Python's fastest framework."
                  image="https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
                />
                <QuizCard
                  category="Programming"
                  title="React vs Next.js"
                  plays="12.8k"
                  description="The ultimate frontend battle challenge."
                  image="https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=600&auto=format&fit=crop"
                />
              </div>
            </section>

            {/* Categories */}
            <section>
              <h2 className="font-display text-3xl font-extrabold text-slate-900 mb-6">
                Explore
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CategoryItem
                  icon={<PlusCircle className="w-10 h-10 fill-current" />}
                  label="Create Quiz"
                  onClick={() => router.push("/quizzes/create")}
                />
                <CategoryItem
                  icon={<Star className="w-10 h-10 fill-current" />}
                  label="My Library"
                  onClick={() => router.push("/quizzes")}
                />
                <CategoryItem
                  icon={<Layers className="w-10 h-10 fill-current" />}
                  label="History"
                  onClick={() => router.push("/dashboard")}
                />
                <CategoryItem
                  icon={<Trophy className="w-10 h-10 fill-current" />}
                  label="Tournaments"
                />
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 flex flex-col gap-8">
            <Leaderboard />

            {/* Pro Upgrade */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative bg-indigo-600 text-white rounded-3xl p-8 overflow-hidden shadow-xl"
            >
              <div className="absolute -right-8 -bottom-8 opacity-20">
                <Sparkles size={160} />
              </div>
              <div className="relative z-10">
                <h3 className="font-display text-2xl font-black mb-4">
                  Host Your Own Battle!
                </h3>
                <p className="opacity-90 mb-6 font-medium">
                  Create custom quizzes, invite friends, and see who reigns
                  supreme.
                </p>
                <motion.button
                  onClick={() => router.push("/quizzes/create")}
                  whileTap={{ y: 4, shadow: "none" }}
                  className="bg-yellow-400 text-yellow-950 px-6 py-3 rounded-xl font-black shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 transition-all"
                >
                  Create Quiz Now
                </motion.button>
              </div>
            </motion.div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 mt-8 py-16 px-5">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-1">
            <span className="font-display text-3xl font-black text-white italic uppercase tracking-tighter block mb-4">
              QuizBattle
            </span>
            <p className="text-slate-400">
              Elevating education through high-stakes real-time competition.
            </p>
          </div>
          <FooterColumn
            title="Explore"
            links={["Live Battles", "Public Library", "Featured Creators"]}
          />
          <FooterColumn
            title="Support"
            links={["Help Center", "Safety Center", "Terms of Service"]}
          />
          <div>
            <h4 className="font-bold text-sm text-white mb-4 uppercase">
              Follow Us
            </h4>
            <div className="flex gap-4">
              <SocialLink icon={<Share2 className="w-5 h-5" />} />
              <SocialLink icon={<Globe className="w-5 h-5" />} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function QuizCard({
  category,
  title,
  plays,
  description,
  image,
}: {
  category: string;
  title: string;
  plays: string;
  description: string;
  image: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      className="group cursor-pointer bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border-2 border-slate-100 hover:border-indigo-400"
    >
      <div className="relative h-48 overflow-hidden bg-slate-200">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={image}
          alt={title}
        />
        <span className="absolute top-4 left-4 bg-indigo-600 text-white px-3 py-1 rounded-lg font-black text-xs uppercase">
          {category}
        </span>
        <div className="absolute bottom-4 right-4 bg-white/95 px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
          <PlayCircle className="w-4 h-4 text-indigo-600" />
          <span className="font-bold text-xs text-slate-800">
            {plays} Plays
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-black text-slate-900 mb-2">
          {title}
        </h3>
        <p className="text-slate-500 text-sm font-medium">{description}</p>
      </div>
    </motion.div>
  );
}

function CategoryItem({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ y: 4, borderBottomWidth: 0 }}
      className="flex flex-col items-center gap-4 p-6 bg-white rounded-3xl hover:bg-indigo-50 transition-colors group cursor-pointer border-b-4 border-slate-200 active:translate-y-1 shadow-sm"
    >
      <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white">
        {icon}
      </div>
      <span className="font-bold text-sm text-center text-slate-700 group-hover:text-indigo-900">
        {label}
      </span>
    </motion.div>
  );
}

function Leaderboard() {
  const players = [
    { rank: 1, name: "Thầy Thế", xp: "124,500 XP", trend: true },
    { rank: 2, name: "ThiDev", xp: "112,800 XP", trend: false },
    { rank: 3, name: "HuyFullstack", xp: "98,200 XP", trend: true },
    { rank: 4, name: "QuizMaster", xp: "85,400 XP", trend: false },
  ];

  return (
    <div className="bg-white border-2 border-slate-200 rounded-3xl p-8 shadow-[0px_8px_0px_0px_#e2e8f0]">
      <div className="flex items-center gap-3 mb-8">
        <Medal className="text-yellow-500 w-8 h-8 fill-current" />
        <h2 className="font-display text-2xl font-black text-slate-900">
          Top Creators
        </h2>
      </div>
      <div className="flex flex-col gap-4">
        {players.map((p) => (
          <div
            key={p.rank}
            className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${p.rank === 1 ? "bg-yellow-50 border-b-4 border-yellow-200" : "hover:bg-slate-50 border-2 border-transparent hover:border-slate-100"}`}
          >
            <span
              className={`font-display text-2xl font-black w-6 text-center ${p.rank === 1 ? "text-yellow-600" : "text-slate-400"}`}
            >
              {p.rank}
            </span>
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg ${p.rank === 1 ? "bg-yellow-400 text-yellow-950 shadow-md" : "bg-slate-200 text-slate-600"}`}
            >
              {p.name.charAt(0)}
            </div>
            <div className="flex-grow">
              <p className="font-bold text-sm text-slate-900">{p.name}</p>
              <p className="text-xs font-bold text-indigo-600">{p.xp}</p>
            </div>
            {p.trend && <TrendingUp className="w-5 h-5 text-green-500" />}
          </div>
        ))}
      </div>
      <button className="w-full mt-8 py-3 rounded-xl font-bold text-sm text-indigo-600 border-2 border-indigo-200 hover:bg-indigo-50 transition-colors">
        View All Rankings
      </button>
    </div>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="font-bold text-sm text-white mb-4 uppercase">{title}</h4>
      <ul className="flex flex-col gap-2 text-sm text-slate-400">
        {links.map((link) => (
          <li key={link}>
            <a className="hover:text-white transition-colors cursor-pointer">
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialLink({ icon }: { icon: ReactNode }) {
  return (
    <a className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer">
      {icon}
    </a>
  );
}
