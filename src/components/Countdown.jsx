"use client";

import React, { useState, useEffect, useRef } from "react";

// ─── Global single tick source ─────────────────────────────────────────────
// All Countdown instances share ONE setInterval instead of creating their own.
const listeners = new Set();
let globalTimer = null;

function startGlobalTimer() {
  if (globalTimer) return;
  globalTimer = setInterval(() => {
    const now = Date.now();
    listeners.forEach((cb) => cb(now));
  }, 1000);
}

function stopGlobalTimer() {
  if (listeners.size === 0 && globalTimer) {
    clearInterval(globalTimer);
    globalTimer = null;
  }
}

function useGlobalTick(callback) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    const handler = (now) => cbRef.current(now);
    listeners.add(handler);
    startGlobalTimer();
    return () => {
      listeners.delete(handler);
      stopGlobalTimer();
    };
  }, []);
}
// ──────────────────────────────────────────────────────────────────────────

function calcTimeLeft(targetDate) {
  const difference = +new Date(targetDate) - Date.now();
  if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    isLive: false,
  };
}

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(targetDate));

  useGlobalTick(() => {
    setTimeLeft(calcTimeLeft(targetDate));
  });

  if (timeLeft.isLive) {
    return (
      <div className="flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-1 text-xs font-bold text-brand uppercase tracking-wider">
        <span className="h-2 w-2 rounded-full bg-brand live-pulse"></span>
        Match Live
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 items-center">
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-extrabold text-white">{String(timeLeft.days).padStart(2, "0")}</span>
        <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">Days</span>
      </div>
      <span className="text-zinc-600 font-bold text-xs -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-extrabold text-white">{String(timeLeft.hours).padStart(2, "0")}</span>
        <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">Hrs</span>
      </div>
      <span className="text-zinc-600 font-bold text-xs -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-extrabold text-white">{String(timeLeft.minutes).padStart(2, "0")}</span>
        <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">Min</span>
      </div>
      <span className="text-zinc-600 font-bold text-xs -mt-3">:</span>
      <div className="flex flex-col items-center">
        <span className="text-sm sm:text-base font-extrabold text-brand">{String(timeLeft.seconds).padStart(2, "0")}</span>
        <span className="text-[9px] font-semibold text-zinc-550 uppercase tracking-wider">Sec</span>
      </div>
    </div>
  );
}
