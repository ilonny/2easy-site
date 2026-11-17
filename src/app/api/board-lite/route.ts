import { NextRequest } from "next/server";
import {
  gzipNdjsonStream,
  streamBoardLite,
  upstreamApiBase,
} from "@/app/board/server/boardLiteHub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const boardId = Number(req.nextUrl.searchParams.get("id") || 0);
  const authorization = req.headers.get("authorization") || "";
  if (!boardId || authorization.length < 8) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const apiBase = upstreamApiBase(host, proto);
  const gzip = gzipNdjsonStream();

  void streamBoardLite(boardId, authorization, apiBase, (event) => {
    gzip.write(`${JSON.stringify(event)}\n`);
  }).finally(() => {
    gzip.end();
  });

  return new Response(gzip.stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Content-Encoding": "gzip",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
