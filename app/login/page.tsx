"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

interface LoginResponse {
  tokens: { access_token: string; refresh_token: string; token_type: string };
  user:   { id: number; email: string; full_name: string | null; is_active: boolean };
}

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"}/api/v1/auth/login`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail ?? "Đăng nhập thất bại.");
      }

      const data: LoginResponse = await res.json();

      // ── Lưu token (team đổi sang Cookie ở đây nếu muốn) ──
      // localStorage.setItem("access_token",  data.tokens.access_token);
      // localStorage.setItem("refresh_token", data.tokens.refresh_token);
      localStorage.setItem("access_token",  data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);

      router.push("/dashboard");

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="root">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />

      <div className="card">
        <header>
          <div className="logo">
            <svg viewBox="0 0 40 40" fill="none">
              <rect width="40" height="40" rx="12" fill="#6366f1"/>
              <path d="M12 20L20 12L28 20L20 28Z" fill="white"/>
              <circle cx="20" cy="20" r="5" fill="white" opacity=".85"/>
            </svg>
          </div>
          <h1>QuizBattle</h1>
          <p>Đăng nhập để tiếp tục</p>
        </header>

        {error && (
          <div className="err" role="alert">
            <svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="inp-wrap">
              <span className="ico">
                <svg viewBox="0 0 16 16"><rect x="1" y="3" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1 6l7 4 7-4" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input id="email" type="email" autoComplete="email" required
                placeholder="ban@example.com" value={email} disabled={loading}
                onChange={e => setEmail(e.target.value)} />
            </div>
          </div>

          {/* Password */}
          <div className="field">
            <div className="lbl-row">
              <label htmlFor="pw">Mật khẩu</label>
              <a href="/forgot-password" className="forgot">Quên mật khẩu?</a>
            </div>
            <div className="inp-wrap">
              <span className="ico">
                <svg viewBox="0 0 16 16"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5"/></svg>
              </span>
              <input id="pw" type={showPw ? "text" : "password"} autoComplete="current-password"
                required placeholder="••••••••" value={password} disabled={loading}
                onChange={e => setPassword(e.target.value)} />
              <button type="button" className="eye" tabIndex={-1}
                aria-label={showPw ? "Ẩn" : "Hiện"}
                onClick={() => setShowPw(v => !v)}>
                {showPw
                  ? <svg viewBox="0 0 16 16"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/><path d="M2 2l12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                  : <svg viewBox="0 0 16 16"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.5"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5"/></svg>
                }
              </button>
            </div>
          </div>

          <button type="submit" className={`btn${loading ? " loading" : ""}`} disabled={loading}>
            {loading ? <><span className="spin"/>Đang đăng nhập…</> : "Đăng nhập →"}
          </button>
        </form>

        <p className="foot">Chưa có tài khoản? <a href="/register">Đăng ký</a></p>
      </div>

      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        .root{min-height:100vh;display:flex;align-items:center;justify-content:center;
          background:#07071a;font-family:'DM Sans','Segoe UI',sans-serif;position:relative;
          overflow:hidden;padding:1.5rem}

        /* blobs */
        .blob{position:absolute;border-radius:50%;filter:blur(90px);opacity:.15;
          animation:fl 14s ease-in-out infinite;pointer-events:none}
        .b1{width:520px;height:520px;background:#6366f1;top:-150px;left:-150px;animation-delay:0s}
        .b2{width:420px;height:420px;background:#06b6d4;bottom:-120px;right:-100px;animation-delay:-5s}
        .b3{width:320px;height:320px;background:#a855f7;top:55%;left:55%;animation-delay:-10s}
        @keyframes fl{0%,100%{transform:translate(0,0)}50%{transform:translate(20px,-20px)}}

        /* card */
        .card{width:100%;max-width:430px;background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.09);backdrop-filter:blur(28px);
          border-radius:22px;padding:2.5rem 2.25rem 2rem;position:relative;z-index:1;
          animation:up .5s cubic-bezier(.16,1,.3,1) both}
        @keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}

        /* header */
        header{text-align:center;margin-bottom:1.75rem}
        .logo svg{width:48px;height:48px;margin-bottom:.9rem}
        h1{font-size:1.65rem;font-weight:700;color:#f1f1fb;letter-spacing:-.02em;margin-bottom:.3rem}
        header p{font-size:.88rem;color:rgba(255,255,255,.4)}

        /* error */
        .err{display:flex;align-items:center;gap:.5rem;background:rgba(239,68,68,.12);
          border:1px solid rgba(239,68,68,.3);color:#f87171;font-size:.84rem;
          border-radius:10px;padding:.7rem .9rem;margin-bottom:1.2rem;
          animation:shk .35s ease}
        .err svg{width:16px;height:16px;flex-shrink:0}
        @keyframes shk{0%,100%{transform:translateX(0)}25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}

        /* form */
        form{display:flex;flex-direction:column;gap:1.1rem}
        .field{display:flex;flex-direction:column;gap:.4rem}
        label{font-size:.78rem;font-weight:600;color:rgba(255,255,255,.55);
          text-transform:uppercase;letter-spacing:.04em}
        .lbl-row{display:flex;align-items:center;justify-content:space-between}
        .forgot{font-size:.78rem;color:#818cf8;text-decoration:none}
        .forgot:hover{color:#a5b4fc}

        .inp-wrap{position:relative}
        .ico{position:absolute;left:.85rem;top:50%;transform:translateY(-50%);
          color:rgba(255,255,255,.28);display:flex;pointer-events:none}
        .ico svg{width:16px;height:16px}
        input{width:100%;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);
          color:#f1f1fb;font-size:.92rem;border-radius:10px;padding:.75rem 2.8rem .75rem 2.5rem;
          outline:none;font-family:inherit;transition:border-color .2s,background .2s,box-shadow .2s}
        input::placeholder{color:rgba(255,255,255,.22)}
        input:focus{border-color:#6366f1;background:rgba(99,102,241,.08);
          box-shadow:0 0 0 3px rgba(99,102,241,.2)}
        input:disabled{opacity:.5;cursor:not-allowed}

        .eye{position:absolute;right:.85rem;top:50%;transform:translateY(-50%);
          background:none;border:none;color:rgba(255,255,255,.32);cursor:pointer;
          display:flex;padding:.2rem;transition:color .2s}
        .eye:hover{color:rgba(255,255,255,.7)}
        .eye svg{width:16px;height:16px}

        /* button */
        .btn{margin-top:.4rem;width:100%;padding:.85rem;font-family:inherit;
          background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;
          font-size:.95rem;font-weight:600;border:none;border-radius:11px;cursor:pointer;
          display:flex;align-items:center;justify-content:center;gap:.6rem;
          transition:opacity .2s,transform .15s,box-shadow .2s;
          box-shadow:0 4px 20px rgba(99,102,241,.4)}
        .btn:hover:not(:disabled){opacity:.9;transform:translateY(-1px);
          box-shadow:0 6px 28px rgba(99,102,241,.55)}
        .btn:disabled{opacity:.55;cursor:not-allowed}
        .btn.loading{opacity:.7}

        .spin{width:16px;height:16px;border:2px solid rgba(255,255,255,.3);
          border-top-color:#fff;border-radius:50%;animation:sp .7s linear infinite}
        @keyframes sp{to{transform:rotate(360deg)}}

        .foot{margin-top:1.5rem;text-align:center;font-size:.84rem;color:rgba(255,255,255,.35)}
        .foot a{color:#818cf8;font-weight:600;text-decoration:none}
        .foot a:hover{color:#a5b4fc}
      `}</style>
    </main>
  );
}
