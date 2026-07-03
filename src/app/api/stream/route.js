import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url param" }, { status: 400 });
  }

  let decodedUrl;
  try {
    decodedUrl = decodeURIComponent(targetUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "*/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Connection": "keep-alive"
      },
      redirect: 'follow'
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const isM3U8 = 
      decodedUrl.includes(".m3u8") || 
      contentType.includes("mpegurl") || 
      contentType.includes("x-mpegURL");

    if (isM3U8) {
      // Rewrite the M3U8 manifest so that segment URLs also go through our proxy
      const text = await response.text();
      const baseUrl = new URL(decodedUrl);
      const proxyBase = new URL(request.url).origin + "/api/stream?url=";

      const rewritten = text
        .split("\n")
        .map((line) => {
          const trimmed = line.trim();
          // Skip empty lines and comment/tag lines
          if (!trimmed || (trimmed.startsWith("#") && !trimmed.includes("URI="))) {
            // Handle URI= inside tags (e.g., #EXT-X-KEY:URI="...")
            if (trimmed.includes('URI="')) {
              return line.replace(/URI="([^"]+)"/g, (match, uri) => {
                const absoluteUri = uri.startsWith("http")
                  ? uri
                  : new URL(uri, baseUrl).href;
                return `URI="${proxyBase}${encodeURIComponent(absoluteUri)}"`;
              });
            }
            return line;
          }
          // It's a segment or sub-playlist URL
          if (trimmed.startsWith("http")) {
            return proxyBase + encodeURIComponent(trimmed);
          } else {
            const absolute = new URL(trimmed, baseUrl).href;
            return proxyBase + encodeURIComponent(absolute);
          }
        })
        .join("\n");

      return new Response(rewritten, {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.apple.mpegurl",
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "no-cache, no-store",
        },
      });
    }

    // For TS segments and other binary content — stream directly
    const buffer = await response.arrayBuffer();
    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": response.headers.get("content-type") || "video/mp2t",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Proxy fetch failed", detail: err.message },
      { status: 502 }
    );
  }
}
