"use client";
import { useEffect, useState } from "react";
import { Trophy, Gamepad2, Star } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ total_games: 0, total_score: 0, average_rank: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${apiUrl}/api/v1/me/statistics`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.success) setStats(json.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-8 text-primary">Chào mừng trở lại!</h1>
      
      {/* KHỐI THỐNG KÊ CỦA LEADER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <StatCard icon={<Gamepad2 />} label="Trận đã đấu" value={stats.total_games} color="bg-blue-500" />
        <StatCard icon={<Trophy />} label="Tổng điểm" value={stats.total_score.toLocaleString()} color="bg-yellow-500" />
        <StatCard icon={<Star />} label="Hạng trung bình" value={`#${stats.average_rank}`} color="bg-purple-500" />
      </div>

      {/* Các phần UI cũ của Dashboard bên dưới... */}
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`${color} text-white p-6 rounded-3xl shadow-lg flex items-center gap-4 transition-transform hover:scale-105`}>
      <div className="p-4 bg-white/20 rounded-2xl">{icon}</div>
      <div>
        <p className="text-sm font-bold opacity-80 uppercase">{label}</p>
        <p className="text-3xl font-black">{value}</p>
      </div>
    </div>
  );
}