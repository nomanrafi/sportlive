"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import VideoPlayer from "@/components/VideoPlayer";
import { Heart, Share2, Users, Send, CheckCircle, Flag, MessageSquare, Info, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";

function LivePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    channels,
    favorites,
    toggleFavorite,
    addToHistory,
    chatMessages,
    setChatMessages,
    logAction,
    liveViewersCount,
    setActiveChannelId
  } = useApp();

  const activeChannelParam = searchParams.get("channel");
  const tabParam = searchParams.get("tab") || "all";

  // Find active channel
  const [activeChannel, setActiveChannel] = useState(null);
  const [typedMessage, setTypedMessage] = useState("");
  const [chatUsername, setChatUsername] = useState("");
  const [hasSetUsername, setHasSetUsername] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    const savedName = localStorage.getItem("sl_chatUsername");
    if (savedName) {
      setChatUsername(savedName);
      setHasSetUsername(true);
    }
  }, []);

  useEffect(() => {
    if (!channels || channels.length === 0) return;
    const channelId = activeChannelParam;
    const found = channelId
      ? channels.find((c) => c.id === channelId) || channels[0]
      : channels[0];
    setActiveChannel(found);
    if (found) {
      setActiveChannelId(found.id);
      addToHistory(found);
    }
    
    // Clear active channel when leaving the live page
    return () => {
      setActiveChannelId(null);
    };
  }, [activeChannelParam, channels, setActiveChannelId]);

  // Scroll chat container to bottom on new message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const selectChannel = (id) => {
    const params = new URLSearchParams(searchParams);
    params.set("channel", id);
    router.push(`/live?${params.toString()}`);
  };

  const selectTab = (tab) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", tab);
    router.push(`/live?${params.toString()}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !hasSetUsername) return;

    const messageText = typedMessage;
    setTypedMessage("");
    logAction("Chat Message Sent", `Sent message in stream chat`);

    // Insert to Supabase directly
    await supabase.from('messages').insert({
      user_name: chatUsername,
      text: messageText
    });
  };

  // Filter channels based on active tab
  const filteredChannels = tabParam === "favorites"
    ? channels.filter((c) => favorites.includes(c.id))
    : channels;

  const isFav = activeChannel && favorites.includes(activeChannel.id);

  const handleAutoSwitchNext = () => {
    const currentIndex = filteredChannels.findIndex((c) => c.id === activeChannel?.id);
    if (currentIndex !== -1 && filteredChannels.length > 1) {
      const nextIndex = (currentIndex + 1) % filteredChannels.length;
      const nextChannel = filteredChannels[nextIndex];
      selectChannel(nextChannel.id);
      logAction("Auto-Switch Triggered", `Switched from ${filteredChannels[currentIndex].name} to ${nextChannel.name}`);
    }
  };

  if (!activeChannel) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-zinc-550 font-bold uppercase tracking-widest animate-pulse">Loading channel...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-4">
      
      {/* Top: Channels Horizontal List */}
      <div className="space-y-4">
        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <div className="flex gap-2 text-xs font-extrabold uppercase">
            <button
              onClick={() => selectTab("all")}
              className={`pb-2.5 border-b-2 px-1 cursor-pointer transition-all ${
                tabParam !== "favorites"
                  ? "border-brand text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              All Channels ({channels.length})
            </button>
            <button
              onClick={() => selectTab("favorites")}
              className={`pb-2.5 border-b-2 px-1 cursor-pointer transition-all flex items-center gap-1 ${
                tabParam === "favorites"
                  ? "border-brand text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Star size={12} className={favorites.length > 0 ? "fill-brand text-brand" : ""} />
              Favorites ({favorites.length})
            </button>
          </div>
        </div>

        {/* Channels Row */}
        {filteredChannels.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-12 text-center text-xs text-zinc-500 font-bold uppercase">
            No favorited channels yet. Click the heart icon on any channel to save it here.
          </div>
        ) : (
          <div className="flex items-stretch gap-2.5 overflow-x-auto pb-4 pt-1 custom-scrollbar snap-x">
            {filteredChannels.map((chan) => {
              const isSelected = activeChannel.id === chan.id;
              return (
                <button
                  key={chan.id}
                  onClick={() => selectChannel(chan.id)}
                  className={`snap-start shrink-0 w-48 rounded-xl border p-2.5 text-left flex items-center gap-2.5 h-12 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ${
                    isSelected
                      ? "bg-emerald-900/20 border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                      : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700/80"
                  }`}
                >
                  <div className="h-7 w-14 bg-zinc-950 rounded border border-zinc-850 flex items-center justify-center overflow-hidden p-1 shrink-0">
                    <img src={chan.logo} alt={chan.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <span className={`text-xs font-extrabold truncate block leading-tight ${isSelected ? "text-white" : "text-zinc-350"}`}>
                    {chan.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Player and Chat Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Player & Meta (Col span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          <VideoPlayer
            streamUrl={activeChannel.videoUrl}
            backupUrl={activeChannel.backupUrl}
            onLogAction={logAction}
            liveViewersCount={liveViewersCount}
            onAutoSwitchNext={handleAutoSwitchNext}
          />

          {/* Active Stream Metadata */}
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-28 bg-zinc-950 rounded-xl p-2.5 border border-zinc-800 flex items-center justify-center">
                  <img src={activeChannel.logo} alt={activeChannel.name} className="max-h-full max-w-full object-contain" />
                </div>
                <div>
                  <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                    {activeChannel.name}
                    <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                      Live
                    </span>
                  </h1>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">{activeChannel.group}</p>
                </div>
              </div>

              {/* Streaming metrics */}
              <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                <span className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-400">
                  <Users size={12} className="text-zinc-550" />
                  <span>{activeChannel.viewers} Viewers</span>
                </span>
                <span className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 px-3 py-2 rounded-xl text-zinc-400">
                  <CheckCircle size={12} className="text-emerald-500" />
                  <span>Uptime: {activeChannel.uptime}</span>
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-xs leading-relaxed">
              {activeChannel.description}
            </p>

            {/* Action controls */}
            <div className="pt-4 border-t border-zinc-950 flex flex-wrap gap-3 items-center justify-between text-xs font-bold text-zinc-400">
              <div className="flex gap-2">
                <button
                  onClick={() => toggleFavorite(activeChannel.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border transition-all cursor-pointer ${
                    isFav
                      ? "bg-brand/10 border-brand/20 text-brand"
                      : "bg-zinc-950 border-zinc-850 hover:text-white"
                  }`}
                >
                  <Heart size={14} className={isFav ? "fill-brand text-brand" : ""} />
                  <span>{isFav ? "Favorited" : "Add to Favorites"}</span>
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    alert("Stream share link copied!");
                  }}
                  className="flex items-center gap-1.5 bg-zinc-950 border border-zinc-850 hover:text-white px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Share2 size={14} />
                  <span>Share</span>
                </button>
              </div>

              <button className="flex items-center gap-1 bg-transparent hover:text-rose-400 text-[10px] uppercase font-bold tracking-wider cursor-pointer">
                <Flag size={12} />
                Report stream offline
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Live Chat (Col span 1) */}
        <div className="rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col h-[500px] lg:h-[450px] overflow-hidden relative">
          
          {/* Name Setup Overlay */}
          {!hasSetUsername && (
            <div className="absolute inset-0 z-10 bg-zinc-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-2xl w-full max-w-[280px]">
                <div className="w-12 h-12 bg-brand/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={20} className="text-brand" />
                </div>
                <h3 className="text-white font-extrabold text-sm mb-1">Join Live Chat</h3>
                <p className="text-zinc-400 text-xs mb-4">Enter a display name to start chatting with other viewers.</p>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (chatUsername.trim()) {
                    setHasSetUsername(true);
                    localStorage.setItem("sl_chatUsername", chatUsername.trim().substring(0, 20));
                  }
                }} className="space-y-3">
                  <input
                    type="text"
                    value={chatUsername}
                    onChange={(e) => setChatUsername(e.target.value)}
                    placeholder="Your Name..."
                    maxLength={20}
                    className="w-full rounded-xl bg-zinc-950 border border-zinc-800 px-3 py-2.5 text-xs font-bold text-white focus:border-brand/50 outline-none text-center transition-all"
                    autoFocus
                  />
                  <button type="submit" disabled={!chatUsername.trim()} className="w-full bg-brand hover:bg-brand-hover text-white text-xs font-extrabold py-2.5 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                    Start Chatting
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-zinc-950/80 px-4 py-3.5 border-b border-zinc-850 flex items-center justify-between">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
              <MessageSquare size={14} className="text-brand" />
              Live Match Chat
            </h2>
            <span className="h-1.5 w-1.5 rounded-full bg-brand live-pulse"></span>
          </div>

          {/* Message List */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar text-xs">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="space-y-1 select-text">
                <div className="flex items-center justify-between text-[9px] text-zinc-550 font-bold">
                  <span className={msg.user === chatUsername && hasSetUsername ? "text-brand" : "text-zinc-400"}>
                    {msg.user}
                  </span>
                  <span>{msg.time}</span>
                </div>
                <p className="bg-zinc-950/60 border border-zinc-850/60 rounded-xl px-3 py-2 text-zinc-300 leading-normal">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Form Input */}
          <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950/80 border-t border-zinc-850 flex gap-2">
            <input
              type="text"
              placeholder="Join the discussion..."
              value={typedMessage}
              onChange={(e) => setTypedMessage(e.target.value)}
              disabled={!hasSetUsername}
              className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs font-medium text-white placeholder-zinc-550 outline-none focus:border-brand/40 focus:bg-zinc-900/60 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              className="flex items-center justify-center h-8.5 w-8.5 rounded-xl bg-brand text-white hover:bg-brand-hover active:scale-95 transition-all cursor-pointer shrink-0 shadow-md shadow-brand-glow"
            >
              <Send size={14} className="fill-white" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-zinc-550 font-bold uppercase tracking-widest animate-pulse">Loading Live Page...</span>
      </div>
    }>
      <LivePageContent />
    </Suspense>
  );
}
