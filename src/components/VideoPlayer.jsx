"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Hls from "hls.js";
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, ChevronUp } from "lucide-react";

export default function VideoPlayer({ streamUrl, backupUrl, onLogAction, liveViewersCount, onAutoSwitchNext }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const onLogActionRef = useRef(onLogAction);
  const onAutoSwitchNextRef = useRef(onAutoSwitchNext);
  const autoSwitchTimerRef = useRef(null);

  // Keep refs up to date without causing re-renders
  useEffect(() => { onLogActionRef.current = onLogAction; }, [onLogAction]);
  useEffect(() => { onAutoSwitchNextRef.current = onAutoSwitchNext; }, [onAutoSwitchNext]);

  // Player States
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [buffering, setBuffering] = useState(true);
  const [streamOffline, setStreamOffline] = useState(false);

  // Quality Switcher States
  const [levels, setLevels] = useState([]);
  const [currentLevel, setCurrentLevel] = useState(-1);
  const [usingBackup, setUsingBackup] = useState(false);
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const qualityMenuRef = useRef(null);

  // Track buffering start time to avoid false positives
  const bufferingStartRef = useRef(null);

  // Proxy helper: route streams through /api/stream on production to bypass CORS
  const proxyUrl = (url) => {
    if (!url) return url;
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1");
    if (isLocalhost) return url; // dev: use direct URL
    return `/api/stream?url=${encodeURIComponent(url)}`; // prod: proxy
  };

  // Handle click outside for quality menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (qualityMenuRef.current && !qualityMenuRef.current.contains(event.target)) {
        setShowQualityMenu(false);
      }
    };
    if (showQualityMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showQualityMenu]);

  // Initialize HLS Player - only re-runs when URL or backup changes, NOT on every render
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setBuffering(true);
    setIsPlaying(false);
    setStreamOffline(false);

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const activeUrl = proxyUrl(usingBackup ? backupUrl : streamUrl);

    const handleWaiting = () => {
      setBuffering(true);
      bufferingStartRef.current = Date.now();
    };
    const handlePlaying = () => {
      setBuffering(false);
      bufferingStartRef.current = null;
    };

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 3,
        maxMaxBufferLength: 10,
        enableWorker: true,
      });
      hlsRef.current = hls;

      hls.loadSource(activeUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setLevels(hls.levels);
        setBuffering(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        if (onLogActionRef.current) onLogActionRef.current("Stream Playback Started", `Loaded ${activeUrl}`);
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setCurrentLevel(data.level);
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              if (!usingBackup && backupUrl && backupUrl !== streamUrl) {
                setUsingBackup(true);
                if (onLogActionRef.current) onLogActionRef.current("Stream Failover", "Primary failed. Switching to backup.");
              } else {
                setBuffering(false);
                setStreamOffline(true);
                if (onLogActionRef.current) onLogActionRef.current("Stream Critical Error", "Both stream links failed.");
              }
              break;
          }
        }
      });

      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);

      return () => {
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
        hls.destroy();
      };
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = activeUrl;
      video.addEventListener("loadedmetadata", () => {
        setBuffering(false);
        video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
      });
      video.addEventListener("waiting", handleWaiting);
      video.addEventListener("playing", handlePlaying);
      return () => {
        video.removeEventListener("waiting", handleWaiting);
        video.removeEventListener("playing", handlePlaying);
      };
    }
  }, [streamUrl, backupUrl, usingBackup]);

  // Auto-switch feature disabled as per user request
  // useEffect(() => { ... }, [buffering]);

  // Sync Volume
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().then(() => setIsPlaying(true));
      }
    }
  };

  const toggleMute = () => setIsMuted(!isMuted);

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (val > 0) setIsMuted(false);
  };

  const changeQuality = (levelIndex) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentLevel(levelIndex);
      if (onLogActionRef.current) {
        onLogActionRef.current("Change Quality", levelIndex === -1 ? "Auto" : `Level ${levelIndex}`);
      }
    }
  };

  const triggerFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      if (el.requestFullscreen) el.requestFullscreen();
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
      else if (el.msRequestFullscreen) el.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    document.addEventListener("msfullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      document.removeEventListener("msfullscreenchange", onFullscreenChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl group/player">

      {/* Live Views Overlay - Top Center */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="bg-black/25 border border-white/5 shadow-lg backdrop-blur-sm rounded-full p-1.5 flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 bg-black/40 rounded-full pl-2.5 pr-3 py-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dc2626] animate-pulse"></span>
            <span className="text-white font-extrabold text-[10px] tracking-wide">LIVE</span>
          </div>
          <div className="flex items-center gap-1.5 bg-black/40 rounded-full pl-2 pr-3 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#10b981]"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <span className="text-white font-extrabold text-[10px] tracking-wide">
              {liveViewersCount !== undefined
                ? liveViewersCount > 1000
                  ? (liveViewersCount / 1000).toFixed(1) + "K"
                  : liveViewersCount
                : 0}
            </span>
          </div>
        </div>
      </div>

      {/* Native Video Tag */}
      <video
        ref={videoRef}
        className="h-full w-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* Stream Offline Overlay */}
      {streamOffline && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10 gap-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          </div>
          <div className="text-center">
            <p className="text-white font-extrabold text-sm uppercase tracking-widest">Stream Offline</p>
            <p className="text-zinc-500 text-xs mt-1 font-bold">This channel is currently unavailable.</p>
            <p className="text-zinc-600 text-[10px] mt-0.5">Try updating the stream URL from Admin Panel.</p>
          </div>
        </div>
      )}

      {/* Buffering Loader Overlay */}
      {buffering && !streamOffline && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-10 gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute h-12 w-12 rounded-full border-2 border-brand border-t-transparent animate-spin"></span>
            <span className="h-8 w-8 rounded-full border-2 border-zinc-800 border-b-transparent animate-spin duration-1000"></span>
          </div>
          <span className="text-xs font-bold text-zinc-400 tracking-wider uppercase animate-pulse">
            Connecting...
          </span>
        </div>
      )}

      {/* Controls Overlay Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent p-4 flex flex-col gap-3 z-10 transition-opacity duration-300 opacity-100 md:opacity-0 md:group-hover/player:opacity-100">
        <div className="flex items-center justify-between">
          {/* Left: Play/Pause, Volume */}
          <div className="flex items-center gap-4">
            <button onClick={togglePlay} className="text-white hover:text-brand transition-colors cursor-pointer">
              {isPlaying ? <Pause size={20} className="fill-white hover:fill-brand" /> : <Play size={20} className="fill-white hover:fill-brand" />}
            </button>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <input
                type="range" min="0" max="1" step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-brand"
              />
            </div>
          </div>

          {/* Right: Quality, Fullscreen */}
          <div className="flex items-center gap-3">
            <div className="relative" ref={qualityMenuRef}>
              <button
                onClick={() => setShowQualityMenu(!showQualityMenu)}
                className="flex items-center gap-1.5 bg-zinc-900/80 border border-zinc-800 hover:border-brand/50 rounded-lg px-2.5 py-1 text-xs transition-colors cursor-pointer shadow-lg"
              >
                <span className="text-[10px] text-zinc-400 font-bold">Quality:</span>
                <span className="text-white font-bold">
                  {currentLevel === -1 ? "Auto" : levels[currentLevel]?.height ? `${levels[currentLevel].height}p` : "Auto"}
                </span>
                <ChevronUp size={12} className={`text-zinc-400 transition-transform ${showQualityMenu ? "rotate-180" : ""}`} />
              </button>

              {showQualityMenu && (
                <div className="absolute bottom-full right-0 mb-2 min-w-[120px] rounded-xl bg-zinc-950/95 border border-zinc-800 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col z-50 py-1">
                  <button
                    onClick={() => { changeQuality(-1); setShowQualityMenu(false); }}
                    className={`px-4 py-2.5 text-xs font-bold text-left hover:bg-zinc-800 transition-colors ${
                      currentLevel === -1 ? "bg-gradient-to-r from-brand/20 to-transparent text-brand border-l-2 border-brand" : "text-zinc-300 border-l-2 border-transparent"
                    }`}
                  >
                    Auto
                  </button>
                  {levels.map((level, idx) => (
                    <button
                      key={idx}
                      onClick={() => { changeQuality(idx); setShowQualityMenu(false); }}
                      className={`px-4 py-2.5 text-xs font-bold text-left hover:bg-zinc-800 transition-colors ${
                        currentLevel === idx ? "bg-gradient-to-r from-brand/20 to-transparent text-brand border-l-2 border-brand" : "text-zinc-300 border-l-2 border-transparent"
                      }`}
                    >
                      {level.height}p {level.bitrate ? <span className="text-[9px] text-zinc-500 font-normal ml-1">{`${(level.bitrate / 1000000).toFixed(1)} Mbps`}</span> : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={triggerFullscreen} className="text-zinc-400 hover:text-white transition-colors cursor-pointer" title="Fullscreen">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
