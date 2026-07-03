"use client";

import React, { useState, useEffect } from "react";
import { Zap } from "lucide-react";

const FALLBACK_SCORES = [
  { id: "f-1", league: "EPL", teamA: "Arsenal", scoreA: "1", teamB: "Chelsea", scoreB: "1", minute: "75'", type: "live" },
  { id: "f-2", league: "La Liga", teamA: "Real Madrid", scoreA: "2", teamB: "Real Sociedad", scoreB: "0", minute: "FT", type: "finished" },
  { id: "f-3", league: "Serie A", teamA: "Inter Milan", scoreA: "3", teamB: "Napoli", scoreB: "2", minute: "88'", type: "live" },
  { id: "f-4", league: "UCL", teamA: "Bayern Munich", scoreA: "0", teamB: "PSG", scoreB: "0", minute: "15'", type: "live" },
  { id: "f-5", league: "EPL", teamA: "Liverpool", scoreA: "4", teamB: "Everton", scoreB: "1", minute: "FT", type: "finished" }
];

export default function LiveScoreTicker() {
  const [scores, setScores] = useState(FALLBACK_SCORES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRealTimeScores = async () => {
      try {
        const response = await fetch(
          "https://site.api.espn.com/apis/site/v2/sports/soccer/all/scoreboard",
          { cache: "no-store" }
        );
        if (!response.ok) throw new Error("Network response error");
        
        const data = await response.json();
        
        if (data && data.events && data.events.length > 0) {
          const parsedEvents = data.events.map((event) => {
            const competition = event.competitions?.[0];
            const competitors = competition?.competitors || [];
            
            const homeCompetitor = competitors.find(c => c.homeAway === "home") || competitors[0];
            const awayCompetitor = competitors.find(c => c.homeAway === "away") || competitors[1];

            const state = event.status?.type?.state;
            let matchType = "upcoming";
            if (state === "in") matchType = "live";
            else if (state === "post") matchType = "finished";

            return {
              id: event.id || String(Math.random()),
              league: event.season?.slug?.toUpperCase() || competition?.type?.abbreviation || "SOCCER",
              teamA: homeCompetitor?.team?.shortDisplayName || homeCompetitor?.team?.displayName || "Home",
              scoreA: homeCompetitor?.score || "0",
              teamB: awayCompetitor?.team?.shortDisplayName || awayCompetitor?.team?.displayName || "Away",
              scoreB: awayCompetitor?.score || "0",
              minute: event.status?.type?.detail || "Upcoming",
              type: matchType
            };
          });

          setScores(parsedEvents);
        } else {
          // If no active matches on ESPN, keep fallback scores
          setScores(FALLBACK_SCORES);
        }
      } catch (err) {
        console.warn("ESPN score feed fetch failed, using fallback data:", err.message);
        setScores(FALLBACK_SCORES);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRealTimeScores();
    // Poll every 30 seconds for live updates
    const interval = setInterval(fetchRealTimeScores, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-zinc-950 border-b border-zinc-900 overflow-hidden py-2 px-4 select-none">
      <div className="mx-auto max-w-7xl flex items-center gap-4">
        
        {/* Live Banner Badge */}
        <div className="flex items-center gap-1 bg-brand text-white px-2.5 py-1 rounded text-[10px] font-extrabold uppercase tracking-widest shrink-0 shadow-sm shadow-brand-glow">
          <Zap size={10} className="fill-white live-pulse" />
          <span>Scores</span>
        </div>

        {/* Ticker Row */}
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-none py-1 w-full text-xs font-semibold">
          {scores.map((score) => (
            <div
              key={score.id}
              className="flex items-center gap-3 bg-zinc-900 border border-red-500/40 rounded-lg px-3 py-1.5 shrink-0 hover:border-red-500 transition-colors shadow-[0_0_8px_rgba(239,68,68,0.1)]"
            >
              <span className="text-[10px] text-zinc-500 uppercase font-extrabold tracking-wider">{score.league}</span>
              <div className="flex items-center gap-1.5 text-zinc-200">
                <span className="text-zinc-350">{score.teamA}</span>
                <span className="bg-zinc-950 px-1.5 py-0.5 rounded text-white font-extrabold">{score.scoreA}</span>
                <span className="text-zinc-600">:</span>
                <span className="bg-zinc-950 px-1.5 py-0.5 rounded text-white font-extrabold">{score.scoreB}</span>
                <span className="text-zinc-350">{score.teamB}</span>
              </div>
              
              {/* Game Minute / State badge */}
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold ${
                  score.type === "live"
                    ? "bg-brand/10 text-brand border border-brand/20 live-pulse"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {score.minute}
              </span>
            </div>
          ))}
        </div>
        
      </div>
    </div>
  );
}
