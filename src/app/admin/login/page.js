"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Eye, EyeOff, LogIn, Trophy } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { logAction } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to admin
  useEffect(() => {
    const token = localStorage.getItem("sl_admin_token");
    if (token) {
      router.push("/admin");
    }
  }, [router]);

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Simulated verification delay
    setTimeout(() => {
      if (username === "NomanRafs" && password === "zH@g=K#5I}3%6eC") {
        localStorage.setItem("sl_admin_token", "sl_session_" + Date.now());
        logAction("Admin Login", "Successful authentication into administration console");
        router.push("/admin");
      } else {
        setError("Invalid administrative credentials. Try again.");
        logAction("Admin Login Failed", `Failed attempt by user: ${username}`);
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex-1 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-800 p-8 space-y-6 relative overflow-hidden">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-brand/10 blur-3xl" />
        
        {/* Brand logo */}
        <div className="text-center space-y-2 relative">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand text-white shadow-lg shadow-brand-glow">
            <Trophy size={24} />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin Console</h1>
          <p className="text-xs text-zinc-500 font-semibold">Enter your secure credentials to manage streams and analytics.</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 relative">
          {error && (
            <div className="rounded-xl bg-rose-950/80 border border-rose-800/40 p-3.5 text-xs font-bold text-rose-400">
              {error}
            </div>
          )}

          {/* Username */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Username</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-3 text-zinc-550" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-zinc-550 outline-none focus:border-brand/40 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Password</label>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-zinc-550" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-950 border border-zinc-850 pl-10 pr-10 py-2.5 text-xs font-semibold text-white placeholder-zinc-550 outline-none focus:border-brand/40 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-550 hover:text-white"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand py-3 text-xs font-extrabold text-white shadow-lg shadow-brand-glow hover:bg-brand-hover hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? (
              <span className="h-4.5 w-4.5 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              <>
                <LogIn size={14} />
                <span>Verify Credentials</span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
}
