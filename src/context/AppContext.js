"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { supabase } from "../lib/supabase";

const AppContext = createContext();

const DEFAULT_CHANNELS = [
  {
    id: "demo-channel",
    name: "TSN",
    logo: "https://i.imgur.com/Pai5oUE.png", // Change this to your logo path
    videoUrl: "http://193.225.32.62:8890/live.m3u8", // Your m3u8 link here
    backupUrl: "https://37b4c228.wurl.com/manifest/f36d25e7e52f1ba8d7e56eb859c636563214f541/UmFrdXRlblRWLWZyX0ZJRkFQbHVzRnJlbmNoX0hMUw/6f5437c5-e015-4754-8476-c8c6d27d3a55/1.m3u8",
    status: "online",
    viewers: "0",
    group: "Test Group",
    description: "This is a demo channel for testing local m3u8 links.",
    uptime: "100%",
    bufferingRate: "0%",
  },
  {
    id: "bein-sports",
    name: "beIN Sports",
    logo: "/logos/bein.svg",
    videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    backupUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    status: "online",
    viewers: "0",
    group: "Sports Europe",
    description: "beIN Sports is the premier destination for international soccer, featuring La Liga, Ligue 1, Serie A, and UEFA Champions League.",
    uptime: "99.95%",
    bufferingRate: "0.4%",
  },
  {
    id: "t-sports",
    name: "T Sports",
    logo: "/logos/tsports.svg",
    videoUrl: "https://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8",
    backupUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    status: "online",
    viewers: "0",
    group: "Sports Asia",
    description: "T Sports is the first sports channel in Bangladesh, offering live coverage of cricket, football, kabaddi, and national leagues.",
    uptime: "99.88%",
    bufferingRate: "0.8%",
  },
  {
    id: "fox-sports",
    name: "FOX Sports Live",
    logo: "/logos/fox.svg",
    videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
    backupUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    status: "online",
    viewers: "0",
    group: "Sports US",
    description: "FOX Sports delivers top-tier live action, including NFL Sunday, MLB World Series, FIFA World Cup qualifiers, and NASCAR racing.",
    uptime: "99.97%",
    bufferingRate: "0.3%",
  },
  {
    id: "bbc-sports",
    name: "BBC Sports",
    logo: "/logos/bbc.svg",
    videoUrl: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    backupUrl: "https://playertest.longtailvideo.com/adaptive/wowzaid3/playlist.m3u8",
    status: "online",
    viewers: "0",
    group: "Sports UK",
    description: "BBC Sport brings you the latest sports news, live action, results, and analysis from the world of football, cricket, rugby, and tennis.",
    uptime: "99.96%",
    bufferingRate: "0.2%",
  }
];

const DEFAULT_FIXTURES = [];

const DEFAULT_HIGHLIGHTS = [
  {
    id: "hl-1",
    title: "Argentina vs France [3-3] (4-2 Pens) | World Cup Final Highlights",
    thumbnail: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=640",
    duration: "14:22",
    views: "2.4M",
    date: "2 days ago",
    youtubeId: "8Z1eMy2lX-g"
  },
  {
    id: "hl-2",
    title: "Brazil vs Germany [1-7] | Historical Semi-Final Highlights",
    thumbnail: "https://images.unsplash.com/photo-1540747737956-3787257478c2?q=80&w=640",
    duration: "10:15",
    views: "5.8M",
    date: "1 week ago",
    youtubeId: "YtDk98wO520"
  },
  {
    id: "hl-3",
    title: "Real Madrid vs Barcelona [3-2] | El Clásico Highlights",
    thumbnail: "https://images.unsplash.com/photo-1518063319789-7217e6706b04?q=80&w=640",
    duration: "12:40",
    views: "1.1M",
    date: "3 days ago",
    youtubeId: "Z5cZ_7Wz25s"
  }
];

export const AppProvider = ({ children }) => {
  // Database States (Editable by Admin)
  const [channels, setChannels] = useState(DEFAULT_CHANNELS);
  const [fixtures, setFixtures] = useState(DEFAULT_FIXTURES);
  const [highlights, setHighlights] = useState(DEFAULT_HIGHLIGHTS);

  // User Personalization States
  const [favorites, setFavorites] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");

  // True Live Viewers via Supabase Presence
  const [liveViewersCount, setLiveViewersCount] = useState(0);

  const [peakViewers, setPeakViewers] = useState(0);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [deviceStats, setDeviceStats] = useState({});
  const [locationStats, setLocationStats] = useState({});

  // Live Chat Storage
  const [chatMessages, setChatMessages] = useState([]);

  // Per-channel real-time viewers
  const [channelViewers, setChannelViewers] = useState({});
  const presenceRoomRef = useRef(null);
  const activeChannelIdRef = useRef(activeChannelId);

  // Load state from localStorage on client side + Supabase for channels/fixtures
  useEffect(() => {
    const savedFavorites = localStorage.getItem("sl_favorites");
    const savedHistory = localStorage.getItem("sl_history");
    const savedBookmarks = localStorage.getItem("sl_bookmarks");
    const savedTheme = localStorage.getItem("sl_theme");
    const savedLanguage = localStorage.getItem("sl_language");

    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedHistory) setWatchHistory(JSON.parse(savedHistory));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("light", savedTheme === "light");
    }
    if (savedLanguage) setLanguage(savedLanguage);

    // --- Load channels (Currently using Local Hardcoded for Testing) ---
    const loadChannels = () => {
      setChannels(DEFAULT_CHANNELS);
    };

    // --- Load admin-added fixtures from Supabase ---
    const loadFixtures = async () => {
      const { data, error } = await supabase.from('fixtures').select('*');
      if (!error && data) {
        setFixtures(data);
      } else {
        setFixtures([]);
      }
    };

    loadChannels();
    loadFixtures();

    // --- Subscribe to Supabase realtime for channels & fixtures ---
    const channelSub = supabase
      .channel('public:channels')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'channels' }, () => {
        loadChannels();
      })
      .subscribe();

    const fixtureSub = supabase
      .channel('public:fixtures')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'fixtures' }, () => {
        loadFixtures();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channelSub);
      supabase.removeChannel(fixtureSub);
    };
  }, []);

  // Separate useEffect: fetch ESPN live fixtures + FIFA highlights on mount
  useEffect(() => {
    // Fetch real-time upcoming fixtures from ESPN
    const fetchRealTimeFixtures = async () => {
      try {
        // Fetch from multiple major leagues for upcoming matches
        const leagues = [
          { slug: "eng.1", name: "Premier League" },
          { slug: "esp.1", name: "La Liga" },
          { slug: "ger.1", name: "Bundesliga" },
          { slug: "ita.1", name: "Serie A" },
          { slug: "fra.1", name: "Ligue 1" },
          { slug: "usa.1", name: "MLS" },
          { slug: "fifa.world", name: "FIFA World Cup" },
          { slug: "UEFA.CHAMPIONS", name: "Champions League" },
        ];

        const allFixtures = [];

        await Promise.allSettled(
          leagues.map(async (league) => {
            const res = await fetch(
              `https://site.api.espn.com/apis/site/v2/sports/soccer/${league.slug}/scoreboard`,
              { cache: "no-store" }
            );
            if (!res.ok) return;
            const data = await res.json();
            if (!data?.events?.length) return;

            data.events.forEach((event) => {
              const competition = event.competitions?.[0];
              const competitors = competition?.competitors || [];
              const home = competitors.find(c => c.homeAway === "home") || competitors[0];
              const away = competitors.find(c => c.homeAway === "away") || competitors[1];
              const rawDate = event.date;
              const d = new Date(rawDate);

              // Skip old matches (older than 24 hours ago)
              if (Date.now() - d.getTime() > 24 * 60 * 60 * 1000) return;

              const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
              const timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZoneName: "short" });
              const state = event.status?.type?.state;

              allFixtures.push({
                id: event.id || String(Math.random()),
                teamA: home?.team?.shortDisplayName || home?.team?.displayName || "Home",
                teamB: away?.team?.shortDisplayName || away?.team?.displayName || "Away",
                teamALogo: home?.team?.logo || "",
                teamBLogo: away?.team?.logo || "",
                date: dateStr,
                time: timeStr,
                rawDate: rawDate,
                tournament: league.name,
                group: event.status?.type?.detail || "Scheduled",
                status: state === "in" ? "live" : state === "post" ? "finished" : "upcoming",
              });
            });
          })
        );

        // Sort logic: FIFA World Cup first, then by date ascending
        allFixtures.sort((a, b) => {
          if (a.tournament === "FIFA World Cup" && b.tournament !== "FIFA World Cup") return -1;
          if (b.tournament === "FIFA World Cup" && a.tournament !== "FIFA World Cup") return 1;
          return new Date(a.rawDate) - new Date(b.rawDate);
        });

        if (allFixtures.length > 0) {
          setFixtures(prev => {
            // Keep any admin-added fixtures that aren't from the ESPN API
            const customFixtures = prev.filter(f => !allFixtures.some(apiF => apiF.id === f.id));
            return [...customFixtures, ...allFixtures];
          });
        }
      } catch (err) {
        console.warn("Real-time fixtures fetch failed:", err);
      }
    };

    fetchRealTimeFixtures();

    // Fetch FIFA YouTube Highlights dynamically
    const fetchFIFAHighlights = async () => {
      try {
        const response = await fetch("https://api.rss2json.com/v1/api.json?rss_url=https%3A%2F%2Fwww.youtube.com%2Ffeeds%2Fvideos.xml%3Fchannel_id%3DUCpcTrCXblq78GZrTUTLWeBw", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();

        if (data.status === "ok" && data.items && data.items.length > 0) {
          const newHighlights = data.items
            .filter(item => !item.title.toLowerCase().includes("shorts") && !item.link.includes("shorts"))
            .slice(0, 3)
            .map((item, index) => {
              const youtubeId = item.guid.split(":")[2] || item.link.split("v=")[1];
              return {
                id: `hl-${index + 1}`,
                title: item.title,
                thumbnail: item.thumbnail,
                duration: "Highlights",
                views: "New",
                date: new Date(item.pubDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }),
                youtubeId: youtubeId
              };
            });

          if (newHighlights.length > 0) {
            setHighlights(newHighlights);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch FIFA highlights:", err);
      }
    };

    fetchFIFAHighlights();

    // Log startup
    logAction("System Startup", "SportLive streaming system online");
  }, []);

  // Sync back to localStorage
  const saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const toggleFavorite = (channelId) => {
    const nextFavorites = favorites.includes(channelId)
      ? favorites.filter((id) => id !== channelId)
      : [...favorites, channelId];
    setFavorites(nextFavorites);
    saveToStorage("sl_favorites", nextFavorites);
    logAction("Toggle Favorite", `Channel ${channelId} favorite state toggled`);
  };

  const addToHistory = (channel) => {
    const nextHistory = [
      channel,
      ...watchHistory.filter((item) => item.id !== channel.id)
    ].slice(0, 10);
    setWatchHistory(nextHistory);
    saveToStorage("sl_history", nextHistory);
  };

  const toggleBookmark = (fixtureId) => {
    const nextBookmarks = bookmarks.includes(fixtureId)
      ? bookmarks.filter((id) => id !== fixtureId)
      : [...bookmarks, fixtureId];
    setBookmarks(nextBookmarks);
    saveToStorage("sl_bookmarks", nextBookmarks);
    logAction("Toggle Bookmark", `Fixture ${fixtureId} bookmarked`);
  };

  const handleSetTheme = (nextTheme) => {
    setTheme(nextTheme);
    localStorage.setItem("sl_theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
    logAction("Change Theme", `Theme changed to ${nextTheme}`);
  };

  const handleSetLanguage = (nextLang) => {
    setLanguage(nextLang);
    localStorage.setItem("sl_language", nextLang);
    logAction("Change Language", `Language changed to ${nextLang}`);
  };

  const logAction = (action, details) => {
    const newLog = {
      id: Date.now() + Math.random().toString(36).substr(2, 4),
      time: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(),
      action,
      details
    };
    setSystemLogs((prev) => [newLog, ...prev].slice(0, 100));
  };

  // Manage Supabase Real-time Chat & Presence
  useEffect(() => {
    let chatSubscription = null;
    let presenceSubscription = null;

    const initSupabase = async () => {
      // --- 1. Init Chat ---
      const oneHourAgo = new Date(Date.now() - 3600000).toISOString();

      const { data } = await supabase
        .from('messages')
        .select('*')
        .gte('created_at', oneHourAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      if (data) {
        setChatMessages(data.reverse().map(msg => ({
          id: msg.id,
          user: msg.user_name,
          text: msg.text,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: new Date(msg.created_at).getTime()
        })));
      }

      chatSubscription = supabase
        .channel('public:messages')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, payload => {
          const newMsg = payload.new;
          setChatMessages(prev => [...prev, {
            id: newMsg.id,
            user: newMsg.user_name,
            text: newMsg.text,
            time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            timestamp: new Date(newMsg.created_at).getTime()
          }].slice(-50));
        })
        .subscribe();

      // --- 2. Init Presence (Real-time Live Viewers + Geo + Device) ---
      const getDeviceType = () => {
        const ua = navigator.userAgent;
        if (/(smart[-]?tv|hbbtv|appletv|roku|firetv|xbox|playstation|wii)/i.test(ua)) return "Smart TV";
        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
        if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile Devices";
        return "Desktop Browser";
      };

      const getLocation = () => {
        try {
          const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          if (timeZone) {
            const city = timeZone.split('/')[1]?.replace('_', ' ');
            // Basic mapping for common TZs
            if (timeZone.includes('Dhaka')) return "Bangladesh";
            if (timeZone.includes('Kolkata')) return "India";
            if (timeZone.includes('America/')) return "United States";
            if (timeZone.includes('London')) return "United Kingdom";
            if (timeZone.includes('Qatar')) return "Qatar";
            if (timeZone.includes('Dubai')) return "UAE";
            return city || "Unknown";
          }
        } catch (e) { }
        return "Unknown";
      };

      const room = supabase.channel('global_viewers_room');
      presenceRoomRef.current = room;

      room
        .on('presence', { event: 'sync' }, () => {
          const newState = room.presenceState();
          let totalUsers = 0;
          const counts = {};
          const dStats = {};
          const lStats = {};

          for (const key in newState) {
            const presences = newState[key];
            totalUsers += presences.length;
            presences.forEach(p => {
              if (p.channel_id) counts[p.channel_id] = (counts[p.channel_id] || 0) + 1;
              if (p.device) dStats[p.device] = (dStats[p.device] || 0) + 1;
              if (p.location) lStats[p.location] = (lStats[p.location] || 0) + 1;
            });
          }
          setLiveViewersCount(totalUsers);
          setChannelViewers(counts);
          setDeviceStats(dStats);
          setLocationStats(lStats);
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await room.track({
              online_at: new Date().toISOString(),
              channel_id: activeChannelIdRef.current,
              device: getDeviceType(),
              location: getLocation()
            });
          }
        });

      presenceSubscription = room;
    };

    initSupabase();

    const cleanupInterval = setInterval(async () => {
      const oneHourAgoMs = Date.now() - 3600000;
      const oneHourAgoIso = new Date(oneHourAgoMs).toISOString();

      setChatMessages(prev => prev.filter(msg => msg.timestamp > oneHourAgoMs));

      await supabase
        .from('messages')
        .delete()
        .lt('created_at', oneHourAgoIso);
    }, 60000);

    return () => {
      if (chatSubscription) supabase.removeChannel(chatSubscription);
      if (presenceSubscription) supabase.removeChannel(presenceSubscription);
      clearInterval(cleanupInterval);
    };
  }, []);



  // Admin CRUD Functions — Supabase as source of truth
  const addChannel = async (newChan) => {
    const { error } = await supabase.from('channels').upsert(newChan);
    if (!error) {
      setChannels(prev => [...prev, newChan]);
      logAction("Admin: Add Channel", `Added channel ${newChan.name}`);
    } else {
      console.error("Supabase addChannel error:", error.message);
    }
  };

  const updateChannel = async (id, updatedChan) => {
    const merged = { ...channels.find(c => c.id === id), ...updatedChan };
    const { error } = await supabase.from('channels').upsert(merged);
    if (!error) {
      setChannels(prev => prev.map(c => c.id === id ? merged : c));
      logAction("Admin: Update Channel", `Updated channel ${id}`);
    } else {
      console.error("Supabase updateChannel error:", error.message);
    }
  };

  const deleteChannel = async (id) => {
    const { error } = await supabase.from('channels').delete().eq('id', id);
    if (!error) {
      setChannels(prev => prev.filter(c => c.id !== id));
      logAction("Admin: Delete Channel", `Deleted channel ${id}`);
    } else {
      console.error("Supabase deleteChannel error:", error.message);
    }
  };

  const addFixture = async (newFix) => {
    const { error } = await supabase.from('fixtures').upsert(newFix);
    if (!error) {
      setFixtures(prev => [...prev, newFix]);
      logAction("Admin: Add Fixture", `Scheduled match: ${newFix.teamA} vs ${newFix.teamB}`);
    } else {
      console.error("Supabase addFixture error:", error.message);
    }
  };

  const updateFixture = async (id, updatedFix) => {
    const merged = { ...fixtures.find(f => f.id === id), ...updatedFix };
    const { error } = await supabase.from('fixtures').upsert(merged);
    if (!error) {
      setFixtures(prev => prev.map(f => f.id === id ? merged : f));
      logAction("Admin: Update Fixture", `Updated match fixture ${id}`);
    } else {
      console.error("Supabase updateFixture error:", error.message);
    }
  };

  const deleteFixture = async (id) => {
    const { error } = await supabase.from('fixtures').delete().eq('id', id);
    if (!error) {
      setFixtures(prev => prev.filter(f => f.id !== id));
      logAction("Admin: Delete Fixture", `Deleted match fixture ${id}`);
    } else {
      console.error("Supabase deleteFixture error:", error.message);
    }
  };

  useEffect(() => {
    activeChannelIdRef.current = activeChannelId;
    if (presenceRoomRef.current) {
      try {
        const getDeviceType = () => {
          const ua = navigator.userAgent;
          if (/(smart[-]?tv|hbbtv|appletv|roku|firetv|xbox|playstation|wii)/i.test(ua)) return "Smart TV";
          if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) return "Tablet";
          if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) return "Mobile Devices";
          return "Desktop Browser";
        };

        const getLocation = () => {
          try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (timeZone) {
              const city = timeZone.split('/')[1]?.replace('_', ' ');
              if (timeZone.includes('Dhaka')) return "Bangladesh";
              if (timeZone.includes('Kolkata')) return "India";
              if (timeZone.includes('America/')) return "United States";
              if (timeZone.includes('London')) return "United Kingdom";
              if (timeZone.includes('Qatar')) return "Qatar";
              if (timeZone.includes('Dubai')) return "UAE";
              return city || "Unknown";
            }
          } catch (e) { }
          return "Unknown";
        };

        presenceRoomRef.current.track({
          online_at: new Date().toISOString(),
          channel_id: activeChannelId,
          device: getDeviceType(),
          location: getLocation()
        });
      } catch (e) {
        // Channel might not be fully subscribed yet, which is fine
        // because the subscribe callback in initSupabase will track the latest state.
      }
    }
  }, [activeChannelId]);

  const channelsWithRealViewers = useMemo(() => {
    return channels.map(c => {
      const count = channelViewers[c.id] || 0;
      const formattedCount = count > 999 ? (count / 1000).toFixed(1) + "k" : String(count);
      return { ...c, viewers: formattedCount };
    });
  }, [channels, channelViewers]);

  const contextValue = useMemo(() => ({
    channels: channelsWithRealViewers,
    fixtures,
    highlights,
    favorites,
    watchHistory,
    bookmarks,
    theme,
    language,
    liveViewersCount,
    peakViewers,
    activeChannelId,
    setActiveChannelId,
    chatMessages,
    setChatMessages,
    systemLogs,
    deviceStats,
    locationStats,
    toggleFavorite,
    addToHistory,
    toggleBookmark,
    setTheme: handleSetTheme,
    setLanguage: handleSetLanguage,
    logAction,
    addChannel,
    updateChannel,
    deleteChannel,
    addFixture,
    updateFixture,
    deleteFixture,
  }), [
    channelsWithRealViewers, fixtures, highlights, favorites, watchHistory,
    bookmarks, theme, language, liveViewersCount, peakViewers, activeChannelId,
    chatMessages, systemLogs, deviceStats, locationStats,
    toggleFavorite, addToHistory, toggleBookmark,
    handleSetTheme, handleSetLanguage, logAction,
    addChannel, updateChannel, deleteChannel, addFixture, updateFixture, deleteFixture,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
