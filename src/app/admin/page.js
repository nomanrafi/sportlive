"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  LayoutDashboard, Tv, Calendar, ListTodo, LogOut, Plus, Trash, Edit, 
  Download, RefreshCw, CheckCircle, ShieldAlert, Monitor, Smartphone, Globe, Sparkles, User
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const {
    channels, addChannel, updateChannel, deleteChannel,
    fixtures, addFixture, updateFixture, deleteFixture,
    liveViewersCount, peakViewers, totalVisitors, totalViews, systemLogs, logAction,
    deviceStats, locationStats
  } = useApp();

  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState("analytics"); // analytics, channels, fixtures, logs

  // Channel Form State
  const [editingChannelId, setEditingChannelId] = useState(null);
  const [channelForm, setChannelForm] = useState({
    name: "", logo: "", videoUrl: "", backupUrl: "", group: "Sports", description: ""
  });

  // Fixture Form State
  const [editingFixtureId, setEditingFixtureId] = useState(null);
  const [fixtureForm, setFixtureForm] = useState({
    teamA: "", teamB: "", teamALogo: "", teamBLogo: "", date: "", time: "", tournament: "", group: "Group Stage"
  });

  // Real-time viewer history for live graph (max 30 data points)
  const [viewerHistory, setViewerHistory] = useState([{ count: 0, label: "Now" }]);

  useEffect(() => {
    const now = new Date();
    const label = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setViewerHistory(prev => {
      const next = [...prev, { count: liveViewersCount, label }];
      return next.slice(-30); // keep last 30 points
    });
  }, [liveViewersCount]);

  // Compute SVG polyline points from viewerHistory
  const buildSvgPath = (history) => {
    if (history.length < 2) return "";
    const maxVal = Math.max(...history.map(h => h.count), 1);
    const w = 100, h = 28;
    return history.map((pt, i) => {
      const x = (i / (history.length - 1)) * w;
      const y = h - (pt.count / maxVal) * h + 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
  };

  const [filterChannel, setFilterChannel] = useState("all");
  const [filterDate, setFilterDate] = useState("");
  const [filterTime, setFilterTime] = useState("");
  const [activeRange, setActiveRange] = useState("live");

  useEffect(() => {
    const token = localStorage.getItem("sl_admin_token");
    if (!token) {
      router.push("/admin/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("sl_admin_token");
    logAction("Admin Logged Out", "Logged out from system administration console");
    router.push("/admin/login");
  };

  // --- CRUD: Channels ---
  const handleChannelSubmit = (e) => {
    e.preventDefault();
    if (!channelForm.name || !channelForm.videoUrl) return;

    if (editingChannelId) {
      updateChannel(editingChannelId, channelForm);
      setEditingChannelId(null);
      alert("Channel updated successfully!");
    } else {
      const newId = channelForm.name.toLowerCase().replace(/\s+/g, "-");
      addChannel({
        id: newId,
        ...channelForm,
        status: "online",
        viewers: "0",
        uptime: "100%",
        bufferingRate: "0.0%"
      });
      alert("Channel created successfully!");
    }

    setChannelForm({ name: "", logo: "", videoUrl: "", backupUrl: "", group: "Sports", description: "" });
  };

  const startEditChannel = (chan) => {
    setEditingChannelId(chan.id);
    setChannelForm({
      name: chan.name,
      logo: chan.logo,
      videoUrl: chan.videoUrl,
      backupUrl: chan.backupUrl || "",
      group: chan.group,
      description: chan.description || ""
    });
  };

  // --- CRUD: Fixtures ---
  const handleFixtureSubmit = (e) => {
    e.preventDefault();
    if (!fixtureForm.teamA || !fixtureForm.teamB || !fixtureForm.date) return;

    const formattedFixture = {
      ...fixtureForm,
      rawDate: `${fixtureForm.date}T${fixtureForm.time || "12:00"}:00`,
      status: "upcoming"
    };

    if (editingFixtureId) {
      updateFixture(editingFixtureId, formattedFixture);
      setEditingFixtureId(null);
      alert("Fixture updated successfully!");
    } else {
      const newId = `fix-${Date.now()}`;
      addFixture({
        id: newId,
        ...formattedFixture
      });
      alert("Fixture scheduled successfully!");
    }

    setFixtureForm({ teamA: "", teamB: "", teamALogo: "", teamBLogo: "", date: "", time: "", tournament: "", group: "Group Stage" });
  };

  const startEditFixture = (fix) => {
    setEditingFixtureId(fix.id);
    // Parse rawDate back into date/time inputs
    const [datePart, timePart] = (fix.rawDate || "").split("T");
    setFixtureForm({
      teamA: fix.teamA,
      teamB: fix.teamB,
      teamALogo: fix.teamALogo,
      teamBLogo: fix.teamBLogo,
      date: datePart || "",
      time: (timePart || "").slice(0, 5) || "",
      tournament: fix.tournament,
      group: fix.group
    });
  };

  // CSV Export simulator
  const exportLogs = () => {
    const headers = "Date,Time,Action,Details\n";
    const rows = systemLogs
      .map((log) => `"${log.date}","${log.time}","${log.action.replace(/"/g, '""')}","${log.details.replace(/"/g, '""')}"`)
      .join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sportlive_system_logs_${Date.now()}.csv`;
    link.click();
    logAction("Export System Logs", "System logs data exported to CSV file");
  };

  if (!authorized) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <span className="text-zinc-550 font-bold uppercase tracking-widest animate-pulse">Loading administration console...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar */}
        <div className="space-y-6">
          <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-950 pb-3">
              <span className="h-2 w-2 rounded-full bg-brand live-pulse"></span>
              <span className="text-xs font-black text-white uppercase tracking-wider">Console Status</span>
            </div>
            
            <nav className="flex flex-col gap-1.5 text-xs font-bold">
              <button
                onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "analytics" ? "bg-brand text-white shadow-md shadow-brand-glow" : "text-zinc-450 hover:bg-zinc-950 hover:text-white"
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Telemetry Analytics</span>
              </button>
              <button
                onClick={() => setActiveTab("channels")}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "channels" ? "bg-brand text-white shadow-md shadow-brand-glow" : "text-zinc-450 hover:bg-zinc-950 hover:text-white"
                }`}
              >
                <Tv size={16} />
                <span>Channel Manager CRUD</span>
              </button>
              <button
                onClick={() => setActiveTab("fixtures")}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "fixtures" ? "bg-brand text-white shadow-md shadow-brand-glow" : "text-zinc-450 hover:bg-zinc-950 hover:text-white"
                }`}
              >
                <Calendar size={16} />
                <span>Fixture Scheduler CRUD</span>
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`flex items-center gap-2.5 px-4.5 py-3 rounded-xl transition-all cursor-pointer ${
                  activeTab === "logs" ? "bg-brand text-white shadow-md shadow-brand-glow" : "text-zinc-450 hover:bg-zinc-950 hover:text-white"
                }`}
              >
                <ListTodo size={16} />
                <span>Action & System Logs</span>
              </button>
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 border border-zinc-800 hover:border-rose-900/50 hover:text-rose-400 py-3 text-xs font-bold text-zinc-400 rounded-xl transition-all cursor-pointer bg-zinc-950/45"
            >
              <LogOut size={14} />
              <span>Exit Administrative Console</span>
            </button>
          </div>
        </div>

        {/* Dashboard Panels Container */}
        <div className="lg:col-span-3">
          
          {/* TAB 1: TELEMETRY ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              {/* Top stats boxes */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Live Viewers</span>
                  <p className="text-xl font-black text-white">{liveViewersCount.toLocaleString()}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Unique Visitors</span>
                  <p className="text-xl font-black text-white">{totalVisitors ? totalVisitors.toLocaleString() : "..."}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Total Views</span>
                  <p className="text-xl font-black text-white">{totalViews ? totalViews.toLocaleString() : "..."}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5 space-y-2">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Peak Viewers</span>
                  <p className="text-xl font-black text-white">{peakViewers.toLocaleString()}</p>
                </div>
              </div>

              {/* Real-Time Viewer Analytics */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-5">
                {/* Header + Filters */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-black text-white uppercase tracking-wider">Live Viewer Telemetry</h3>
                    <p className="text-[10px] text-zinc-500 font-bold mt-0.5">Real-time data from Supabase Presence</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Range Toggle */}
                    <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                      {['live', 'daily', 'weekly'].map(r => (
                        <button
                          key={r}
                          onClick={() => setActiveRange(r)}
                          className={`text-[10px] font-bold uppercase px-3 py-1.5 rounded-md transition-all ${
                            activeRange === r ? 'bg-brand text-white shadow-sm' : 'text-zinc-500 hover:text-white'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    {/* Channel Filter */}
                    <div className="flex bg-zinc-950 rounded-lg border border-zinc-800 h-8 px-2 items-center">
                      <select
                        value={filterChannel}
                        onChange={e => setFilterChannel(e.target.value)}
                        className="bg-transparent text-[10px] font-bold text-zinc-400 outline-none uppercase cursor-pointer"
                      >
                        <option className="bg-zinc-900 text-white" value="all">All Channels</option>
                        {channels.map(c => <option className="bg-zinc-900 text-white" key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>

                    {/* Date / Time */}
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400 outline-none focus:border-brand/50 h-8 cursor-pointer transition-all"
                      />
                      <input
                        type="time"
                        value={filterTime}
                        onChange={e => setFilterTime(e.target.value)}
                        style={{ colorScheme: 'dark' }}
                        className="rounded-lg bg-zinc-950 border border-zinc-800 px-3 py-1 text-[11px] text-zinc-400 outline-none focus:border-brand/50 h-8 cursor-pointer transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Metric Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Live Viewers Now</p>
                      <h4 className="text-3xl font-black text-white mt-1">{liveViewersCount.toLocaleString()}</h4>
                      <p className="text-[9px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse inline-block" />
                        Supabase Presence
                      </p>
                    </div>
                    <div className="h-11 w-11 bg-brand/10 text-brand border border-brand/20 rounded-full flex items-center justify-center">
                      <Sparkles size={18} />
                    </div>
                  </div>
                  <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Peak Viewers</p>
                      <h4 className="text-3xl font-black text-white mt-1">{peakViewers.toLocaleString()}</h4>
                      <p className="text-[9px] text-zinc-500 font-bold mt-1">Session high</p>
                    </div>
                    <div className="h-11 w-11 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full flex items-center justify-center">
                      <User size={18} />
                    </div>
                  </div>
                </div>

                {/* Real-Time SVG Graph */}
                <div className="relative bg-zinc-950 rounded-xl border border-zinc-800 p-4 h-48">
                  <p className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Viewer Count — Live Trace</p>
                  <svg className="w-full h-32" viewBox="0 0 100 30" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[5, 15, 25].map(y => (
                      <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="#27272a" strokeWidth="0.3" />
                    ))}
                    {/* Shaded area under graph */}
                    {viewerHistory.length >= 2 && (
                      <polygon
                        points={`0,29 ${buildSvgPath(viewerHistory)} 100,29`}
                        fill="url(#areaGrad)"
                        opacity="0.3"
                      />
                    )}
                    {/* Line */}
                    {viewerHistory.length >= 2 && (
                      <polyline
                        points={buildSvgPath(viewerHistory)}
                        fill="none"
                        stroke="url(#lineGrad)"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    <defs>
                      <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#e61944" />
                        <stop offset="100%" stopColor="#ff4d6d" />
                      </linearGradient>
                      <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#e61944" />
                        <stop offset="100%" stopColor="#e61944" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Time labels */}
                  <div className="flex justify-between text-[8px] text-zinc-600 font-bold uppercase mt-1 px-0.5">
                    {viewerHistory.length > 0 && <span>{viewerHistory[0]?.label}</span>}
                    {viewerHistory.length > 1 && <span>{viewerHistory[Math.floor(viewerHistory.length / 2)]?.label}</span>}
                    {viewerHistory.length > 0 && <span>{viewerHistory[viewerHistory.length - 1]?.label}</span>}
                  </div>
                </div>
              </div>

              {/* Geographic and Device stats column grids (Real-Time) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Geographic distributions */}
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                    <Globe size={14} className="text-zinc-500" />
                    Geographic Distribution
                  </h3>
                  <div className="space-y-2 text-xs">
                    {Object.entries(locationStats || {}).length > 0 ? (
                      Object.entries(locationStats)
                        .sort((a, b) => b[1] - a[1])
                        .map(([country, count]) => {
                          const pct = liveViewersCount > 0 ? Math.round((count / liveViewersCount) * 100) : 0;
                          return (
                            <div key={country} className="flex justify-between items-center py-2 border-b border-zinc-950 last:border-0">
                              <span className="text-zinc-400 font-bold">{country}</span>
                              <div className="flex gap-4 text-zinc-550 font-semibold">
                                <span>{count.toLocaleString()}</span>
                                <span className="text-brand font-bold">{pct}%</span>
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-6 text-center text-zinc-600 font-bold text-[10px] uppercase">
                        Waiting for viewer connections...
                      </div>
                    )}
                  </div>
                </div>

                {/* Device distribution progress */}
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                  <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                    <Monitor size={14} className="text-zinc-500" />
                    Viewer Devices
                  </h3>
                  <div className="space-y-4 text-xs">
                    {Object.entries(deviceStats || {}).length > 0 ? (
                      Object.entries(deviceStats)
                        .sort((a, b) => b[1] - a[1])
                        .map(([device, count]) => {
                          const pct = liveViewersCount > 0 ? Math.round((count / liveViewersCount) * 100) : 0;
                          return (
                            <div key={device} className="space-y-1.5">
                              <div className="flex justify-between font-bold">
                                <span className="text-zinc-400">{device}</span>
                                <span className="text-white">{pct}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                <div className="h-full bg-brand rounded-full transition-all duration-700 ease-in-out" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })
                    ) : (
                      <div className="py-6 text-center text-zinc-600 font-bold text-[10px] uppercase">
                        Waiting for viewer connections...
                      </div>
                    )}
                  </div>
                </div>
              </div>


              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Stream Health & CDN Latency</h3>
                <div className="overflow-x-auto w-full text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-950 text-zinc-500 font-extrabold text-[10px] uppercase">
                        <th className="pb-3">Channel Name</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Viewers</th>
                        <th className="pb-3 text-right">Uptime</th>
                        <th className="pb-3 text-right">Buffer Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950">
                      {channels.map((chan) => (
                        <tr key={chan.id} className="text-zinc-350">
                          <td className="py-3.5 font-bold text-white">{chan.name}</td>
                          <td className="py-3.5">
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 uppercase border border-emerald-500/20">
                              Online
                            </span>
                          </td>
                          <td className="py-3.5 text-right font-semibold">{chan.viewers}</td>
                          <td className="py-3.5 text-right font-semibold">{chan.uptime}</td>
                          <td className="py-3.5 text-right font-semibold text-brand">{chan.bufferingRate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: CHANNEL MANAGER CRUD */}
          {activeTab === "channels" && (
            <div className="space-y-6">
              
              {/* CRUD Input Form */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={16} className="text-brand" />
                  {editingChannelId ? "Update Live Channel" : "Add New Live Channel"}
                </h3>
                <form onSubmit={handleChannelSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Channel Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ESPN HD"
                      value={channelForm.name}
                      onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Group Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Sports US"
                      value={channelForm.group}
                      onChange={(e) => setChannelForm({ ...channelForm, group: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/logo.png"
                      value={channelForm.logo}
                      onChange={(e) => setChannelForm({ ...channelForm, logo: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Primary HLS Stream URL *</label>
                    <input
                      type="text"
                      required
                      placeholder="https://example.com/stream.m3u8"
                      value={channelForm.videoUrl}
                      onChange={(e) => setChannelForm({ ...channelForm, videoUrl: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Backup / Fallback Stream URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/backup.m3u8"
                      value={channelForm.backupUrl}
                      onChange={(e) => setChannelForm({ ...channelForm, backupUrl: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Stream Description</label>
                    <textarea
                      placeholder="Channel details and content specs..."
                      value={channelForm.description}
                      onChange={(e) => setChannelForm({ ...channelForm, description: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold h-16 resize-none"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-brand text-white font-extrabold py-2.5 rounded-xl hover:bg-brand-hover shadow-md shadow-brand-glow active:scale-[0.99] transition-all cursor-pointer text-center"
                    >
                      {editingChannelId ? "Update Channel Details" : "Publish Live Channel"}
                    </button>
                    {editingChannelId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingChannelId(null);
                          setChannelForm({ name: "", logo: "", videoUrl: "", backupUrl: "", group: "Sports", description: "" });
                        }}
                        className="bg-zinc-800 text-zinc-350 font-bold px-4 py-2.5 rounded-xl hover:bg-zinc-750 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table List of Channels */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Active Channels List</h3>
                <div className="overflow-x-auto w-full text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-950 text-zinc-500 font-extrabold text-[10px] uppercase">
                        <th className="pb-3">Name</th>
                        <th className="pb-3">Category</th>
                        <th className="pb-3">Stream Link (m3u8)</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950">
                      {channels.map((chan) => (
                        <tr key={chan.id} className="text-zinc-350">
                          <td className="py-3 font-bold text-white">{chan.name}</td>
                          <td className="py-3 font-semibold">{chan.group}</td>
                          <td className="py-3 font-mono text-[10px] text-zinc-500 max-w-[200px] truncate">{chan.videoUrl}</td>
                          <td className="py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => startEditChannel(chan)}
                                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:text-brand hover:border-brand/20 transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete ${chan.name}?`)) deleteChannel(chan.id);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:text-rose-400 hover:border-rose-900/30 transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: FIXTURE SCHEDULER CRUD */}
          {activeTab === "fixtures" && (
            <div className="space-y-6">
              
              {/* CRUD Input Form */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Plus size={16} className="text-brand" />
                  {editingFixtureId ? "Update Scheduled Match" : "Schedule New Match"}
                </h3>
                <form onSubmit={handleFixtureSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Team A (Host) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Real Madrid"
                      value={fixtureForm.teamA}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, teamA: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Team B (Guest) *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Barcelona"
                      value={fixtureForm.teamB}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, teamB: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Team A Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/teama.png"
                      value={fixtureForm.teamALogo}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, teamALogo: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Team B Logo URL</label>
                    <input
                      type="text"
                      placeholder="https://example.com/teamb.png"
                      value={fixtureForm.teamBLogo}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, teamBLogo: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Date *</label>
                    <input
                      type="date"
                      required
                      value={fixtureForm.date}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, date: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Time *</label>
                    <input
                      type="time"
                      required
                      value={fixtureForm.time}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, time: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">League / Tournament *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. La Liga"
                      value={fixtureForm.tournament}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, tournament: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-550">Group/Phase</label>
                    <input
                      type="text"
                      placeholder="e.g. Semi-Finals"
                      value={fixtureForm.group}
                      onChange={(e) => setFixtureForm({ ...fixtureForm, group: e.target.value })}
                      className="w-full rounded-xl bg-zinc-950 border border-zinc-850 px-3.5 py-2.5 text-white placeholder-zinc-650 outline-none focus:border-brand/40 transition-all font-semibold"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2 flex gap-3">
                    <button
                      type="submit"
                      className="flex-1 bg-brand text-white font-extrabold py-2.5 rounded-xl hover:bg-brand-hover shadow-md shadow-brand-glow active:scale-[0.99] transition-all cursor-pointer text-center"
                    >
                      {editingFixtureId ? "Update Match Schedule" : "Schedule Match Event"}
                    </button>
                    {editingFixtureId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingFixtureId(null);
                          setFixtureForm({ teamA: "", teamB: "", teamALogo: "", teamBLogo: "", date: "", time: "", tournament: "", group: "Group Stage" });
                        }}
                        className="bg-zinc-800 text-zinc-350 font-bold px-4 py-2.5 rounded-xl hover:bg-zinc-750 transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Table List of Fixtures */}
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-xs font-black text-white uppercase tracking-wider">Scheduled Matches</h3>
                <div className="overflow-x-auto w-full text-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-950 text-zinc-500 font-extrabold text-[10px] uppercase">
                        <th className="pb-3">Match Event</th>
                        <th className="pb-3">Tournament</th>
                        <th className="pb-3 text-right">Date/Time</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-950">
                      {fixtures.map((fix) => (
                        <tr key={fix.id} className="text-zinc-350">
                          <td className="py-3 font-bold text-white">
                            {fix.teamA} <span className="text-zinc-650">vs</span> {fix.teamB}
                          </td>
                          <td className="py-3 font-semibold">{fix.tournament}</td>
                          <td className="py-3 text-right font-mono text-[10px]">{fix.date} @ {fix.time}</td>
                          <td className="py-3 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => startEditFixture(fix)}
                                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:text-brand hover:border-brand/20 transition-all cursor-pointer"
                                title="Edit"
                              >
                                <Edit size={12} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm(`Delete scheduled match ${fix.teamA} vs ${fix.teamB}?`)) deleteFixture(fix.id);
                                }}
                                className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:text-rose-400 hover:border-rose-900/30 transition-all cursor-pointer"
                                title="Delete"
                              >
                                <Trash size={12} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: ACTION LOGS */}
          {activeTab === "logs" && (
            <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-950 pb-4">
                <div>
                  <h3 className="text-xs font-black text-white uppercase tracking-wider">System Activity Logs</h3>
                  <p className="text-[10px] text-zinc-550 font-bold mt-0.5">Real-time log telemetry tracker of administrator operations and stream status</p>
                </div>
                
                <button
                  onClick={exportLogs}
                  className="flex items-center gap-1.5 bg-brand text-white text-xs font-extrabold px-4.5 py-2.5 rounded-xl hover:bg-brand-hover shadow-md shadow-brand-glow transition-all cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export CSV Log</span>
                </button>
              </div>

              {/* Logs Display Box */}
              <div className="rounded-xl border border-zinc-950 bg-zinc-950/80 p-4 font-mono text-[10px] text-zinc-400 space-y-2 max-h-[360px] overflow-y-auto custom-scrollbar">
                {systemLogs.length === 0 ? (
                  <span className="text-zinc-650 block text-center uppercase py-8">No logging telemetry registered yet.</span>
                ) : (
                  systemLogs.map((log) => (
                    <div key={log.id} className="py-1 border-b border-zinc-900/40 last:border-0 flex items-start justify-between gap-4 select-text">
                      <div className="space-x-2">
                        <span className="text-zinc-600 font-bold">[{log.time}]</span>
                        <span className="text-brand font-black">{log.action}:</span>
                        <span className="text-zinc-350">{log.details}</span>
                      </div>
                      <span className="text-zinc-600 shrink-0">{log.date}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Security Advisory */}
              <div className="rounded-xl bg-zinc-950 border border-zinc-850 p-4 flex items-center gap-3">
                <ShieldAlert size={18} className="text-brand shrink-0" />
                <p className="text-[10px] text-zinc-550 leading-normal">
                  Administrator logging session keys are bound to local browser sandbox storage. Logging telemetry resets upon manual cookie erasure or server configuration rebuild.
                </p>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
