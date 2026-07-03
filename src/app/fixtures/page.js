"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Countdown from "@/components/Countdown";
import { Calendar, Search, Bookmark, Bell, Award, Check } from "lucide-react";

export default function FixturesPage() {
  const { fixtures, bookmarks, toggleBookmark, logAction } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTournament, setFilterTournament] = useState("all");
  const [reminderFixtureIds, setReminderFixtureIds] = useState([]);

  const toggleReminder = (id) => {
    if (reminderFixtureIds.includes(id)) {
      setReminderFixtureIds((prev) => prev.filter((item) => item !== id));
      logAction("Reminder Removed", `Removed reminder for fixture ${id}`);
    } else {
      setReminderFixtureIds((prev) => [...prev, id]);
      logAction("Reminder Scheduled", `Scheduled push notification reminder for fixture ${id}`);
      alert("Notification Reminder Scheduled! You will be alerted when the match starts.");
    }
  };

  // Get unique tournaments for filter dropdown
  const tournamentsList = ["all", ...new Set(fixtures.map((f) => f.tournament))];

  // Filter fixtures based on query & selected tournament
  const filteredFixtures = fixtures.filter((f) => {
    const matchesSearch =
      f.teamA.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.teamB.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.tournament.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTournament = filterTournament === "all" || f.tournament === filterTournament;
    
    return matchesSearch && matchesTournament;
  });

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header & Summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Award size={24} className="text-brand" />
            Upcoming Match Fixtures
          </h1>
          <p className="text-xs text-zinc-500 font-semibold mt-1">
            Real-time tracking of international tournaments, matches, countdowns, and live broadcasts.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
        {/* Search */}
        <div className="relative sm:col-span-2">
          <Search size={16} className="absolute left-3 top-3 text-zinc-550" />
          <input
            type="text"
            placeholder="Search teams, countries, leagues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl bg-zinc-950 border border-zinc-850 pl-10 pr-4 py-2.5 text-xs font-semibold text-white placeholder-zinc-550 outline-none focus:border-brand/40 focus:bg-zinc-950/60 transition-all"
          />
        </div>

        {/* Filter Tournaments */}
        <select
          value={filterTournament}
          onChange={(e) => setFilterTournament(e.target.value)}
          className="rounded-xl bg-zinc-950 border border-zinc-850 px-4 py-2.5 text-xs font-bold text-zinc-350 outline-none cursor-pointer focus:border-brand/40 focus:bg-zinc-950/60 transition-all"
        >
          {tournamentsList.map((t) => (
            <option key={t} value={t} className="bg-zinc-950">
              {t === "all" ? "All Tournaments" : t}
            </option>
          ))}
        </select>
      </div>

      {/* Fixtures List */}
      {filteredFixtures.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-zinc-800 py-16 text-center text-xs text-zinc-550 font-bold uppercase tracking-wide">
          No matches found matching criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredFixtures.map((fix) => {
            const isBookmarked = bookmarks.includes(fix.id);
            const hasReminder = reminderFixtureIds.includes(fix.id);
            return (
              <div
                key={fix.id}
                className="group rounded-2xl bg-zinc-900 border border-zinc-800 p-6 hover:border-zinc-700/80 transition-all flex flex-col justify-between gap-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950 border border-zinc-850 px-2 py-0.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      {fix.tournament}
                    </span>
                    <p className="text-[10px] text-zinc-550 font-extrabold uppercase tracking-widest">{fix.group}</p>
                  </div>

                  {/* Bookmark Option */}
                  <button
                    onClick={() => toggleBookmark(fix.id)}
                    className="p-1.5 rounded-lg bg-zinc-950 border border-zinc-850 text-zinc-450 hover:text-white transition-all cursor-pointer"
                    title={isBookmarked ? "Remove Bookmark" : "Bookmark Fixture"}
                  >
                    <Bookmark size={14} className={isBookmarked ? "fill-brand text-brand" : ""} />
                  </button>
                </div>

                {/* Team Grid */}
                <div className="flex items-center justify-between text-center select-none py-2">
                  {/* Team A */}
                  <div className="flex flex-col items-center gap-2 w-24">
                    <div className="h-12 w-12 bg-zinc-950 border border-zinc-850 rounded-full flex items-center justify-center p-2 shadow-md">
                      <img src={fix.teamALogo} alt={fix.teamA} className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white truncate max-w-full">{fix.teamA}</span>
                  </div>

                  {/* Center Versus Detail */}
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

                  {/* Team B */}
                  <div className="flex flex-col items-center gap-2 w-24">
                    <div className="h-12 w-12 bg-zinc-950 border border-zinc-850 rounded-full flex items-center justify-center p-2 shadow-md">
                      <img src={fix.teamBLogo} alt={fix.teamB} className="h-full w-full object-contain" />
                    </div>
                    <span className="text-xs font-black text-white truncate max-w-full">{fix.teamB}</span>
                  </div>
                </div>

                {/* Footer Controls: Countdown, Remind Me */}
                <div className="pt-4 border-t border-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Ticking countdown */}
                  <Countdown targetDate={fix.rawDate} />

                  {/* Reminder Action */}
                  <button
                    onClick={() => toggleReminder(fix.id)}
                    className={`w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                      hasReminder
                        ? "bg-emerald-950/80 border-emerald-800/40 text-emerald-400"
                        : "bg-zinc-950 border-zinc-850 hover:text-white"
                    }`}
                  >
                    {hasReminder ? <Check size={12} /> : <Bell size={12} />}
                    <span>{hasReminder ? "Reminded Scheduled" : "Remind Me"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Warning */}
      <div className="rounded-2xl border border-zinc-900 bg-zinc-950 p-4 flex items-center gap-3">
        <Calendar size={18} className="text-brand shrink-0" />
        <p className="text-[10px] text-zinc-550 leading-normal">
          Upcoming fixtures are synchronized with global sports server schedules. Live links will activate inside the Live Streaming Player precisely 15 minutes before the match kickoff.
        </p>
      </div>

    </div>
  );
}
