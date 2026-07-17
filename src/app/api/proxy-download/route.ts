import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST_SUFFIXES = ["selstorage.ru", "2easyeng.com", "localhost"];

function isAllowedUrl(raw: string): boolean {
  try {
    const u = new URL(raw);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;

    const base = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "";
    if (base) {
      try {
        if (u.hostname === new URL(base).hostname) return true;
      } catch {
        /* ignore */
      }
    }

    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => u.hostname === suffix || u.hostname.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

function sanitizeFilename(name: string) {
  const cleaned = name.replace(/[^\w.\-()\s\u0400-\u04FF]+/g, "_").trim();
  return cleaned || "audio";
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const filename = sanitizeFilename(
    req.nextUrl.searchParams.get("filename") || "audio",
  );

  if (!url || !isAllowedUrl(url)) {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  try {
    const upstream = await fetch(url);
    if (!upstream.ok) {
      return NextResponse.json({ error: "Upstream failed" }, { status: 502 });
    }

    const buf = await upstream.arrayBuffer();
    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const encoded = encodeURIComponent(filename);

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encoded}`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Download failed" }, { status: 502 });
  }
}
