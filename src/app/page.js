"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import LiveScoreTicker from "@/components/LiveScoreTicker";
import Countdown from "@/components/Countdown";
import { Play, Tv, Calendar, Heart, ShieldAlert, Zap, Film, Eye } from "lucide-react";

export default function Home() {
  const { channels, fixtures, highlights, favorites, toggleFavorite, liveViewersCount } = useApp();

  // Get active upcoming fixtures (at least 2)
  const activeFixtures = fixtures.slice(0, 3);

  return (
    <div className="w-full pb-16">
      {/* Live Scores Ticker */}
      <LiveScoreTicker />

      {/* Hero Banner Section */}
      <section className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800">
          {/* Accent lighting gradients - pointer-events-none so they don't block clicks */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-zinc-800/30 blur-3xl" />
          
          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 sm:p-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 border border-brand/20 px-3.5 py-1 text-xs font-bold text-brand uppercase tracking-wider">
                <span className="h-2 w-2 rounded-full bg-brand live-pulse"></span>
                World Cup Live Broadcast
              </div>
              <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                Experience Every Goal In <span className="text-brand-gradient">Full 4K Quality</span>
              </h1>
              <p className="text-zinc-400 text-sm sm:text-base leading-relaxed max-w-lg">
                Join over <span className="text-white font-bold">{liveViewersCount.toLocaleString()}</span> active fans streaming live matches with adaptive bitrate playback, low-latency servers, and zero lag.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/live"
                  className="flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand-glow hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Play size={16} className="fill-white" />
                  Stream Live Now
                </Link>
                <Link
                  href="/fixtures"
                  className="flex items-center gap-2 rounded-xl bg-zinc-800/80 border border-zinc-700/80 px-6 py-3.5 text-sm font-bold text-zinc-200 hover:bg-zinc-750 transition-all"
                >
                  <Calendar size={16} />
                  Match Fixtures
                </Link>
              </div>
            </div>
            
            {/* Visual Sports Mock Card */}
            <div className="relative lg:block hidden">
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950/80 aspect-[16/9] shadow-2xl">
                {/* Simulated Stream Banner */}
                <div className="absolute inset-0 bg-cover bg-center opacity-60" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=640')" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
                
                {/* Live Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-brand text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-white live-pulse"></span>
                    LIVE
                  </span>
                  <span className="bg-black/60 backdrop-blur-md text-zinc-300 px-2 py-0.5 rounded text-[10px] font-bold">
                    High Quality
                  </span>
                </div>

                {/* Viewers Overlay (Top Right) */}
                <div className="absolute top-4 right-4">
                  <span className="bg-black/60 backdrop-blur-md text-zinc-300 px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1.5 border border-zinc-800">
                    <Eye size={12} className="text-brand" />
                    {liveViewersCount.toLocaleString()}
                  </span>
                </div>
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Link href="/live" className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-xl shadow-brand-glow hover:scale-110 hover:opacity-90 active:scale-95 transition-all">
                    <Play size={24} className="fill-white translate-x-0.5" />
                  </Link>
                </div>
                
                {/* Ticker title */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-white">
                  <div>
                    <p className="font-bold text-sm">FIFA World Cup 2026</p>
                    <p className="text-[10px] text-zinc-400">Broadcasting via High-Performance CDN</p>
                  </div>
                  <span className="bg-brand/10 border border-brand/20 px-2 py-1 rounded text-brand font-bold text-[10px]">
                    {liveViewersCount.toLocaleString()} Viewers
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Live Channels and Upcoming Fixtures */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Channels Grid (Cols 1 & 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Tv size={20} className="text-brand" />
              Live Channels
            </h2>
            <Link href="/live" className="text-xs font-bold text-brand hover:underline">
              View All Channels
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {channels.map((chan) => {
              const isFav = favorites.includes(chan.id);
              return (
                <div
                  key={chan.id}
                  className="group relative rounded-2xl bg-zinc-900 border border-zinc-800 p-5 hover:border-zinc-700/80 transition-all flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Channel Logo */}
                    <div className="h-10 w-24 bg-zinc-950 rounded-lg p-2 border border-zinc-800/80 flex items-center justify-center overflow-hidden">
                      {/* Logo image placeholder or actual Wiki Image */}
                      <img 
                        src={chan.logo} 
                        alt={chan.name}
                        className="max-h-full max-w-full object-contain filter brightness-95 group-hover:brightness-100 transition-all"
                      />
                    </div>
                    
                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(chan.id)}
                      className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-brand hover:border-brand/20 transition-all"
                      title={isFav ? "Remove from Favorites" : "Add to Favorites"}
                    >
                      <Heart size={16} className={isFav ? "fill-brand text-brand" : ""} />
                    </button>
                  </div>

                  {/* Channel Details */}
                  <div className="mt-6 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-bold text-zinc-550 uppercase tracking-wide">{chan.group}</span>
                      <span className="text-emerald-500 font-bold flex items-center gap-1 text-[10px]">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-pulse"></span>
                        ONLINE
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white group-hover:text-brand transition-colors">
                      {chan.name}
                    </h3>
                    <p className="text-zinc-550 text-xs line-clamp-2">
                      {chan.description}
                    </p>
                  </div>

                  {/* Play stream / Switch to Stream button */}
                  <div className="mt-4 pt-4 border-t border-zinc-950 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-bold">{chan.viewers} Viewers</span>
                    <Link
                      href={`/live?channel=${chan.id}`}
                      className="flex items-center gap-1.5 rounded-lg bg-brand/10 border border-brand/20 px-3 py-1.5 text-xs font-bold text-brand hover:bg-brand hover:text-white transition-all"
                    >
                      <Play size={12} className="fill-current" />
                      Stream Live
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real-Time Match Fixtures Widget (Col 3) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Calendar size={20} className="text-brand" />
              Live & Upcoming
            </h2>
            <Link href="/fixtures" className="text-xs font-bold text-brand hover:underline">
              Full Fixtures
            </Link>
          </div>

          <div className="space-y-4">
            {activeFixtures.map((fix) => (
              <div
                key={fix.id}
                className="relative rounded-2xl bg-zinc-900 border border-[#00FA9E]/40 p-5 transition-all space-y-4 overflow-hidden"
                style={{boxShadow: '0 0 0 1px rgba(0,250,158,0.2), 0 0 18px 4px rgba(0,250,158,0.12), inset 0 0 30px rgba(0,250,158,0.04)'}}
              >
                <div className="flex justify-between items-center text-[10px]">
                  <span className="bg-zinc-950 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-bold uppercase tracking-wider">
                    {fix.tournament}
                  </span>
                  <span className="text-zinc-500 font-bold">{fix.group}</span>
                </div>

                {/* Team Logos and Names */}
                <div className="flex items-center justify-between text-center">
                  <div className="flex flex-col items-center gap-1 w-20">
                    <div className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center p-1.5 shadow-md">
                      <img src={fix.teamALogo} alt={fix.teamA} className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xs font-extrabold text-white truncate max-w-full">{fix.teamA}</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 shrink-0">
                    <div className="bg-gradient-to-br from-purple-600 via-brand to-[#00FA9E] p-[1.5px] rounded-xl shadow-lg shadow-brand-glow">
                      <div className="bg-zinc-950 rounded-xl px-5 py-3 flex flex-col items-center gap-1.5">
                        <span className="text-base font-black tracking-widest uppercase bg-gradient-to-r from-purple-400 to-[#00FA9E] bg-clip-text text-transparent">
                          VS
                        </span>
                        <span className="text-xs text-zinc-300 font-bold text-center leading-snug">
                          {fix.date}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-semibold">
                          {fix.time}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-1 w-20">
                    <div className="h-10 w-10 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center p-1.5 shadow-md">
                      <img src={fix.teamBLogo} alt={fix.teamB} className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xs font-extrabold text-white truncate max-w-full">{fix.teamB}</span>
                  </div>
                </div>

                {/* Countdown timer & Stream actions */}
                <div className="pt-3 border-t border-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <Countdown targetDate={fix.rawDate} />
                  <Link
                    href={`/live`}
                    className="w-full sm:w-auto text-center rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1.5 text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                  >
                    Set Reminder
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Featured Video Highlights */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16 space-y-6">
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Film size={20} className="text-brand" />
          Featured Highlights
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {highlights.map((hl) => (
            <a
              key={hl.id}
              href={hl.youtubeId ? `https://www.youtube.com/watch?v=${hl.youtubeId}` : "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden hover:border-brand/40 transition-all flex flex-col justify-between cursor-pointer"
            >
              {/* Image thumbnail with duration badge */}
              <div className="relative aspect-[16/9] overflow-hidden bg-zinc-950">
                <img
                  src={hl.thumbnail}
                  alt={hl.title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
                />
                <span className="absolute bottom-2.5 right-2.5 bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                  {hl.duration}
                </span>

                {/* YouTube play overlay on hover */}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-12 w-12 rounded-full bg-brand text-white flex items-center justify-center shadow-xl shadow-brand-glow scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Play size={20} className="fill-white translate-x-0.5" />
                  </div>
                </div>

                {/* YouTube badge */}
                <span className="absolute top-2.5 left-2.5 bg-red-600 text-white px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <svg className="h-2.5 w-2.5 fill-white" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  YouTube
                </span>
              </div>

              {/* Title & Info */}
              <div className="p-4 space-y-3">
                <h3 className="text-xs font-bold text-zinc-200 line-clamp-2 leading-relaxed group-hover:text-white transition-colors">
                  {hl.title}
                </h3>
                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold">
                  <span>{hl.views} views</span>
                  <span>{hl.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* Safety / Compliance footer bar */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 flex items-center gap-3">
          <Zap size={20} className="text-brand shrink-0" />
          <p className="text-[11px] text-zinc-500 leading-normal">
            SportLive aggregates public live streams and schedules. We do not stream or upload media files ourselves. All intellectual property and media signals are copyrighted by their respective broadcasters.
          </p>
        </div>
      </section>
    </div>
  );
}
