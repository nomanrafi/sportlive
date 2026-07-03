import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "SportLive | Enterprise Live Sports Streaming Platform",
  description: "Watch low-latency HD live sports streams with real-time statistics, matches fixtures, and active chat on the premium sports platform.",
  keywords: "sports, live streaming, football, cricket, HLS streaming, HD sports",
  authors: [{ name: "SportLive Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};


export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 antialiased sports-bg-pattern custom-scrollbar">
        <AppProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          <Footer />
        </AppProvider>
      </body>
    </html>
  );
}
