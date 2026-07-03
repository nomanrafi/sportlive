import React from "react";
import Link from "next/link";
import { Trophy, ShieldAlert } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md py-10 text-zinc-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <img src="/assets/sportlivelogo.png" alt="SportLive Logo" className="h-8 w-auto object-contain" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Sport<span className="text-white">Live</span>
              </span>
            </Link>
            <p className="text-zinc-500 max-w-md leading-relaxed text-xs">
              SportLive is an enterprise-grade live sports streaming platform built for high-performance delivery, real-time fixtures updates, and custom interactive dashboards. Enjoy low-latency streaming and lag-free analytics.
            </p>
            {/* Social Icons (SVGs) */}
            <div className="flex gap-4 pt-2">
              <a href="#" className="hover:text-brand transition-colors" title="Twitter">
                <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="hover:text-brand transition-colors" title="YouTube">
                <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.107C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.388.511a3.003 3.003 0 0 0-2.11 2.107C0 8.053 0 12 0 12s0 3.947.502 5.837a3.003 3.003 0 0 0 2.11 2.107c1.883.511 9.388.511 9.388.511s7.505 0 9.388-.511a3.003 3.003 0 0 0 2.11-2.107C24 15.947 24 12 24 12s0-3.947-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </a>
              <a href="#" className="hover:text-brand transition-colors" title="GitHub">
                <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/live" className="hover:text-white transition-colors">Live Streams</Link></li>
              <li><Link href="/fixtures" className="hover:text-white transition-colors">Match Fixtures</Link></li>
            </ul>
          </div>

          {/* Legal / Policy */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200">Legal & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">DMCA Disclaimer</a></li>
              <li><Link href="/about" className="hover:text-white transition-colors">About & Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* Bottom Credits */}
        <div className="mt-8 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-550">
          <p>&copy; {new Date().getFullYear()} SportLive. All rights reserved.</p>
          <div className="flex items-center gap-1.5 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-400">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-pulse"></div>
            <span>All systems operational. Low-latency servers online.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
