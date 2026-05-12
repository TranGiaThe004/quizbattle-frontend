"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, EyeOff, Eye, ArrowRight } from "lucide-react";

interface LoginResponse {
  tokens?: { access_token: string; refresh_token: string; token_type: string };
  access_token?: string;
  refresh_token?: string;
  user: {
    id: number;
    email: string;
    full_name: string | null;
    is_active: boolean;
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPw, setShowPw] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        },
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data?.detail ??
            "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.",
        );
      }

      const data: LoginResponse = await res.json();

      const accessToken = data.tokens?.access_token || data.access_token;
      const refreshToken = data.tokens?.refresh_token || data.refresh_token;

      if (accessToken) {
        localStorage.setItem("access_token", accessToken);
      }
      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi hệ thống xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-primary-container to-[#5a00c6]">
      {/* Brand Title (Thu nhỏ size chữ) */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-8 font-headline text-4xl md:text-5xl italic font-black text-white drop-shadow-lg tracking-tighter"
      >
        QuizBattle
      </motion.h1>

      {/* Main Card (Giảm max-width từ 500px xuống 400px) */}
      <motion.main
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[400px] bg-surface rounded-2xl shadow-tactile border-2 border-[#eaddff] overflow-hidden z-10 mt-8"
      >
        {/* Tabs (Giảm padding và size chữ) */}
        <div className="flex bg-[#e9e5ff] border-b-2 border-outline-variant">
          <button
            onClick={() => setActiveTab("login")}
            className={`flex-1 py-3 text-center font-headline text-lg font-bold transition-all ${
              activeTab === "login"
                ? "bg-surface text-primary border-b-4 border-primary"
                : "text-on-surface-variant hover:bg-[#efebff]"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`flex-1 py-3 text-center font-headline text-lg font-bold transition-all ${
              activeTab === "signup"
                ? "bg-surface text-primary border-b-4 border-primary"
                : "text-on-surface-variant hover:bg-[#efebff]"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Card Body (Giảm padding tổng thể) */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Welcome Text */}
          <div className="text-center space-y-1.5">
            <h2 className="font-headline text-2xl font-extrabold">
              Welcome Back!
            </h2>
            <p className="text-sm text-on-surface-variant">
              Ready to claim your spot on the leaderboard?
            </p>
          </div>

          {/* Hiển thị Lỗi */}
          {error && (
            <div className="bg-error-container text-on-error-container p-2.5 rounded-lg flex items-center gap-2 text-xs font-bold animate-pulse">
              <span className="w-4 h-4 bg-error text-white rounded-full flex items-center justify-center text-[10px]">
                !
              </span>
              {error}
            </div>
          )}

          {/* Form (Giảm khoảng cách giữa các field) */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Email */}
            <div className="space-y-1">
              <label
                htmlFor="email"
                className="block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline-variant" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="player@quizbattle.com"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border-2 border-outline-variant rounded-lg focus:outline-none focus:border-primary transition-all font-medium disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label
                htmlFor="password"
                className={`block text-[10px] font-bold uppercase tracking-wider ${error ? "text-error" : "text-on-surface-variant"}`}
              >
                Password
              </label>
              <div className="relative">
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${error ? "text-error" : "text-outline-variant"}`}
                />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                  placeholder="••••••••"
                  className={`w-full pl-9 pr-10 py-2.5 text-sm rounded-lg focus:outline-none transition-all font-medium border-2 disabled:opacity-50 ${
                    error
                      ? "bg-error-container border-error text-on-error-container"
                      : "bg-white border-outline-variant focus:border-primary"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 focus:outline-none hover:text-primary transition-colors"
                  aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPw ? (
                    <Eye
                      className={`w-4 h-4 ${error ? "text-error" : "text-outline-variant"}`}
                    />
                  ) : (
                    <EyeOff
                      className={`w-4 h-4 ${error ? "text-error" : "text-outline-variant"}`}
                    />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Link */}
            <div className="flex justify-end">
              <a
                href="#"
                className="text-primary text-xs font-bold hover:underline"
              >
                Forgot Password?
              </a>
            </div>

            {/* Login Button (Thu gọn padding, icon và text) */}
            <motion.button
              type="submit"
              disabled={loading}
              whileTap={!loading ? { y: 2, boxShadow: "none" } : {}}
              className={`w-full py-3 font-headline text-lg font-bold rounded-lg shadow-button uppercase tracking-tight flex items-center justify-center gap-2 transition-all ${
                loading
                  ? "bg-outline-variant text-on-surface-variant cursor-not-allowed"
                  : "bg-secondary text-on-secondary hover:brightness-110"
              }`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-4 border-t-white border-on-surface-variant rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  Login <ArrowRight className="w-5 h-5" strokeWidth={3} />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t-2 border-outline-variant"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
              Or continue with
            </span>
            <div className="flex-grow border-t-2 border-outline-variant"></div>
          </div>

          {/* Social (Thu gọn nút social) */}
          <div className="grid grid-cols-2 gap-3">
            <SocialButton icon="google" label="Google" disabled={loading} />
            <SocialButton icon="apple" label="Apple" disabled={loading} />
          </div>
        </div>
      </motion.main>
    </div>
  );
}

function SocialButton({
  icon,
  label,
  disabled,
}: {
  icon: "google" | "apple";
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      className="flex items-center justify-center gap-2 py-2.5 bg-white border-2 border-outline-variant rounded-lg hover:bg-[#f6f2ff] transition-all active:scale-95 font-bold text-xs disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {icon === "google" ? (
        <svg className="w-4 h-4" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.19 2.31-.88 3.5-.8 1.49.03 2.65.65 3.5 1.6-3.05 1.93-2.52 5.86.37 7.13-.77 1.97-1.58 3.45-2.45 4.24zm-2.45-16.12c-.75.98-1.92 1.49-3.08 1.34.25-1.18.84-2.27 1.63-3.04.83-.81 1.95-1.34 3.08-1.22-.16 1.3-.77 2.19-1.63 2.92z" />
        </svg>
      )}
      {label}
    </button>
  );
}
