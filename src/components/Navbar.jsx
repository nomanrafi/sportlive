"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, Menu, X, Globe, Sun, Moon, Heart, User } from "lucide-react";
import { useApp } from "@/context/AppContext";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/live", label: "Live Channels" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const pathName = usePathname();
  const { theme, setTheme, language, setLanguage, favorites } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const languages = [
    { code: "en", label: "EN" },
    { code: "es", label: "ES" },
    { code: "bn", label: "BN" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 items-center justify-center transition-transform duration-300 group-hover:scale-105">
            <img src="/assets/sportlivelogo.png" alt="SportLive Logo" className="h-10 w-auto object-contain" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
            Sport<span className="text-white">Live</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand ring-1 ring-inset ring-brand/20">
              <span className="h-1.5 w-1.5 rounded-full bg-brand live-pulse"></span>
              Live
            </span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathName === link.href || (link.href !== "/" && pathName.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-bold px-4 py-2 rounded-lg transition-all duration-200 block ${
                  isActive
                    ? "bg-gradient-to-r from-brand to-[#00FA9E] text-zinc-950 shadow-[0_4px_0_0_#4a148c] translate-y-0 active:translate-y-[4px] active:shadow-none"
                    : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 shadow-[0_4px_0_0_#18181b] hover:bg-zinc-800 hover:text-white hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#18181b] translate-y-0 active:translate-y-[4px] active:shadow-none"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Utilities: Favorites, Theme Toggle, Language, Admin Trigger */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Favorites Count */}
          <Link 
            href="/live?tab=favorites" 
            className="relative p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-brand hover:border-brand/30 transition-all"
            title="Favorites"
          >
            <Heart size={18} className={favorites.length > 0 ? "fill-brand text-brand" : ""} />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-[9px] font-extrabold text-white">
                {favorites.length}
              </span>
            )}
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            >
              <Globe size={18} />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>
            {langDropdownOpen && (
              <div className="absolute right-0 mt-2 w-24 origin-top-right rounded-xl bg-zinc-900 border border-zinc-800 p-1.5 shadow-xl ring-1 ring-black/5 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-bold transition-colors ${
                      language === lang.code ? "bg-brand text-white" : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white transition-all cursor-pointer"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>


        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center gap-3">

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800/80 bg-zinc-950/95 px-4 py-4 space-y-4">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathName === link.href || (link.href !== "/" && pathName.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-sm font-bold px-4 py-3 rounded-xl transition-all duration-200 block ${
                    isActive
                      ? "bg-gradient-to-r from-brand to-[#00FA9E] text-zinc-950 shadow-[0_4px_0_0_#4a148c] translate-y-0 active:translate-y-[4px] active:shadow-none"
                      : "bg-zinc-900/80 border border-zinc-800 text-zinc-300 shadow-[0_4px_0_0_#18181b] hover:bg-zinc-800 hover:text-white hover:translate-y-[2px] hover:shadow-[0_2px_0_0_#18181b] translate-y-0 active:translate-y-[4px] active:shadow-none"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
            <span className="text-xs font-bold text-zinc-500">Preferences</span>
            <div className="flex items-center gap-3">
              {/* Mobile Favorites */}
              <Link
                href="/live?tab=favorites"
                onClick={() => setMobileMenuOpen(false)}
                className="relative p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"
              >
                <Heart size={16} className={favorites.length > 0 ? "fill-brand text-brand" : ""} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand text-[8px] font-bold text-white">
                    {favorites.length}
                  </span>
                )}
              </Link>
              
              {/* Mobile Language */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg px-2 py-1.5 text-xs font-bold uppercase"
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="bn">BN</option>
              </select>

              {/* Mobile Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400"
              >
                {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
