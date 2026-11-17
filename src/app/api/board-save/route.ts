import { NextRequest } from "next/server";
import { saveBoardLite, upstreamApiBase } from "@/app/board/server/boardLiteHub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const authorization = req.headers.get("authorization") || "";
  if (authorization.length < 8) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const boardId = Number(body?.board_id || 0);
  const snapshot = body?.data;
  if (!boardId || !snapshot || typeof snapshot !== "object") {
    return Response.json(
      { success: false, message: "board_id and data are required" },
      { status: 400 },
    );
  }

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const result = await saveBoardLite({
    boardId,
    authorization,
    apiBase: upstreamApiBase(host, proto),
    snapshot: snapshot as Record<string, unknown>,
    clientVersion: Number(body?.client_version ?? -1),
  });

  return Response.json(result.body, { status: result.status });
}
