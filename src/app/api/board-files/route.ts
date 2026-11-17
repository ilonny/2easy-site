import { NextRequest } from "next/server";
import {
  hubOmitsFiles,
  readBoardLiteFile,
  upstreamApiBase,
} from "@/app/board/server/boardLiteHub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FILE_ID = /^[A-Za-z0-9_-]{1,128}$/;

export async function GET(req: NextRequest) {
  const boardId = Number(req.nextUrl.searchParams.get("id") || 0);
  const authorization = req.headers.get("authorization") || "";
  const ids = String(req.nextUrl.searchParams.get("file_ids") || "")
    .split(",")
    .map((id) => id.trim())
    .filter((id) => FILE_ID.test(id))
    .slice(0, 24);

  if (!boardId || authorization.length < 8 || !ids.length) {
    return Response.json({ success: false, files: {} }, { status: 400 });
  }

  const proto = req.headers.get("x-forwarded-proto") || req.nextUrl.protocol;
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  const apiBase = upstreamApiBase(host, proto);

  if (hubOmitsFiles(boardId, authorization)) {
    const upstream = await fetch(
      `${apiBase}/board/files?id=${boardId}&file_ids=${ids.join(",")}`,
      {
        headers: { Authorization: authorization, Accept: "application/json" },
        cache: "no-store",
      },
    );
    const json = await upstream.json().catch(() => ({ success: false, files: {} }));
    return Response.json(json, { status: upstream.status });
  }

  const files: Record<string, unknown> = {};
  await Promise.all(
    ids.map(async (id) => {
      const file = await readBoardLiteFile(boardId, authorization, id);
      if (file) files[id] = file;
    }),
  );

  return Response.json(
    { success: true, files },
    { headers: { "Cache-Control": "private, max-age=60" } },
  );
}
