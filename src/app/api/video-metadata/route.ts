import { NextRequest } from "next/server";

export const runtime = "nodejs";

function parseDurationSeconds(url: string, html: string) {
  const normalizedUrl = url.toLowerCase();

  if (normalizedUrl.includes("youtube.com") || normalizedUrl.includes("youtu.be")) {
    const match = html.match(/"lengthSeconds":"(\d+)"/);
    if (match) return Number(match[1]);
  }

  if (normalizedUrl.includes("odysee.com")) {
    const metaMatch = html.match(/property="video:duration"\s+content="(\d+)"/i);
    if (metaMatch) return Number(metaMatch[1]);
    const jsonMatch = html.match(/"duration"\s*:\s*(\d+)/i);
    if (jsonMatch) return Number(jsonMatch[1]);
  }

  return null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return Response.json({ durationSeconds: null }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 TriCoreLessonBot",
      },
      cache: "no-store",
    });
    const html = await response.text();
    return Response.json({
      durationSeconds: parseDurationSeconds(url, html),
    });
  } catch {
    return Response.json({ durationSeconds: null }, { status: 200 });
  }
}
