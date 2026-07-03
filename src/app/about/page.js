import React from "react";
import { Info, Cpu, HardDrive, ShieldCheck, Mail } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl w-full px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Introduction */}
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-black text-white tracking-tight">About SportLive</h1>
        <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
          An enterprise-grade, high-performance live sports streaming platform delivering modern serverless caching, low-latency player fallbacks, and real-time administrative dashboards.
        </p>
      </div>


      {/* Legal & DMCA Disclaimer Section */}
      <div className="rounded-2xl bg-zinc-900 border border-zinc-850 p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-zinc-950 pb-4">
          <Info className="text-brand" size={20} />
          <h2 className="text-base font-bold text-white">DMCA & Content Compliance Disclaimer</h2>
        </div>

        <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
          <p>
            SportLive acts purely as a content aggregator of public media streams. This application does not host, upload, record, or broadcast any proprietary sports videos, stream links, or IPTV playlist files on its servers.
          </p>
          <p>
            All media player instances connect directly to publicly accessible third-party networks, open-source aggregation directories (such as the iptv-org directory), or external content delivery networks. SportLive holds no control over the content, copyrights, or terms of service of these external stream sources.
          </p>
          <p>
            If you are a copyright owner or an agent thereof and believe that any stream linked in this application infringes upon your copyrights, please submit a formal DMCA notice to the stream hosting provider. Links will be immediately disabled upon request if direct concerns are brought to our attention.
          </p>
        </div>

        {/* Contact info */}
        <div className="pt-4 border-t border-zinc-950 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <span className="text-zinc-550 font-bold">Contact Licensing:</span>
          <a
            href="mailto:fozlarabbi5196@gmail.com"
            className="flex items-center gap-1.5 text-brand hover:underline font-bold"
          >
            <Mail size={14} />
            fozlarabbi5196@gmail.com
          </a>
        </div>
      </div>

    </div>
  );
}
