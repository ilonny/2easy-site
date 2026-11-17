import { createGzip } from "node:zlib";
import { PassThrough, Readable } from "node:stream";
import { BoardJsonScanner } from "./scanBoardJson";

const DIRECT_IP_BASE_URL = "http://89.111.152.174:8889";
const RU_API_BASE_URL = "https://api.2easyeng.ru";
const HUB_TTL_MS = 10 * 60 * 1000;
const MAX_BYTES = 80 * 1024 * 1024;

export type TBoardLiteEvent =
  | { type: "meta"; board: unknown }
  | {
      type: "scene";
      elements: unknown[];
      appState: Record<string, unknown>;
    }
  | { type: "progress"; loaded: number; total: number | null }
  | { type: "done"; version: number; filesOmitted: boolean }
  | { type: "error"; message: string };

type THub = {
  events: TBoardLiteEvent[];
  waiters: Array<() => void>;
  files: Map<string, Record<string, unknown>>;
  fileWaiters: Map<string, Array<(file: Record<string, unknown> | null) => void>>;
  filesOmitted: boolean;
  done: boolean;
  error: string | null;
  startedAt: number;
  upstream: Promise<void> | null;
};

const hubs = new Map<string, THub>();

const matchesDomain = (hostname: string, domain: string) =>
  hostname === domain ||
  hostname === `www.${domain}` ||
  hostname.endsWith(`.${domain}`);

export const upstreamApiBase = (hostHeader: string, protoHeader: string) => {
  const proto = protoHeader.replace(/:$/, "").split(",")[0].trim().toLowerCase();
  const host = hostHeader.split(",")[0].trim().toLowerCase();
  if (proto !== "https") return `${DIRECT_IP_BASE_URL}/api`;
  if (matchesDomain(host, "2easyeng.ru")) return `${RU_API_BASE_URL}/api`;
  const envBase = (process.env.NEXT_PUBLIC_BASE_URL || "").replace(/\/$/, "");
  if (envBase) return `${envBase}/api`;
  return `${DIRECT_IP_BASE_URL}/api`;
};

const hubKey = (boardId: number, authorization: string) =>
  `${boardId}:${authorization}`;

const evictStaleHubs = () => {
  const now = Date.now();
  Array.from(hubs.entries()).forEach(([key, hub]) => {
    if (now - hub.startedAt > HUB_TTL_MS) hubs.delete(key);
  });
};

const createHub = (): THub => ({
  events: [],
  waiters: [],
  files: new Map(),
  fileWaiters: new Map(),
  filesOmitted: false,
  done: false,
  error: null,
  startedAt: Date.now(),
  upstream: null,
});

const publish = (hub: THub, event: TBoardLiteEvent) => {
  hub.events.push(event);
  const waiters = hub.waiters.splice(0);
  waiters.forEach((waiter) => waiter());
};

const finishWaiters = (hub: THub) => {
  Array.from(hub.fileWaiters.entries()).forEach(([id, waiters]) => {
    const file = hub.files.get(id) || null;
    waiters.forEach((waiter) => waiter(file));
  });
  hub.fileWaiters.clear();
  const waiters = hub.waiters.splice(0);
  waiters.forEach((waiter) => waiter());
};

const followHub = async (
  hub: THub,
  send: (event: TBoardLiteEvent) => void,
) => {
  let index = 0;
  while (true) {
    while (index < hub.events.length) {
      send(hub.events[index]);
      index += 1;
    }
    if (hub.done || hub.error) return;
    await new Promise<void>((resolve) => {
      hub.waiters.push(resolve);
    });
  }
};

const runUpstream = async (
  hub: THub,
  boardId: number,
  authorization: string,
  apiBase: string,
) => {
  const upstream = await fetch(`${apiBase}/board?id=${boardId}&omit_files=1`, {
    headers: {
      Authorization: authorization,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!upstream.ok || !upstream.body) {
    const message = `upstream ${upstream.status}`;
    publish(hub, { type: "error", message });
    hub.error = message;
    hub.done = true;
    finishWaiters(hub);
    return;
  }

  const total = Number(upstream.headers.get("content-length") || 0) || null;
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let lastProgressAt = 0;

  const scanner = new BoardJsonScanner({
    onBoard: (board) => publish(hub, { type: "meta", board }),
    onScene: (scene) => publish(hub, { type: "scene", ...scene }),
    onFile: (id, file) => {
      const dataURL = file.dataURL;
      if (typeof dataURL === "string" && dataURL) {
        hub.files.set(id, file);
        const waiters = hub.fileWaiters.get(id) || [];
        hub.fileWaiters.delete(id);
        waiters.forEach((waiter) => waiter(file));
      }
    },
  });

  const report = (force = false) => {
    const now = Date.now();
    if (!force && now - lastProgressAt < 200) return;
    lastProgressAt = now;
    publish(hub, { type: "progress", loaded: received, total });
  };

  while (true) {
    const { done, value } = await reader.read();
    if (value) {
      received += value.byteLength;
      if (received > MAX_BYTES) {
        throw new Error("Board payload is too large");
      }
      scanner.push(decoder.decode(value, { stream: !done }));
      hub.filesOmitted = scanner.filesOmitted;
      report();
    }
    if (done) {
      scanner.push(decoder.decode());
      scanner.finish();
      hub.filesOmitted = scanner.filesOmitted;
      break;
    }
  }

  publish(hub, {
    type: "done",
    version: scanner.version,
    filesOmitted: scanner.filesOmitted,
  });
  hub.done = true;
  finishWaiters(hub);
};

export const streamBoardLite = async (
  boardId: number,
  authorization: string,
  apiBase: string,
  send: (event: TBoardLiteEvent) => void,
) => {
  evictStaleHubs();
  const key = hubKey(boardId, authorization);
  let hub = hubs.get(key);
  if (!hub || hub.error || Date.now() - hub.startedAt > HUB_TTL_MS) {
    hub = createHub();
    hubs.set(key, hub);
    hub.upstream = runUpstream(hub, boardId, authorization, apiBase).catch(
      (error: unknown) => {
        const message = error instanceof Error ? error.message : "load failed";
        if (!hub!.error) {
          publish(hub!, { type: "error", message });
          hub!.error = message;
          hub!.done = true;
          finishWaiters(hub!);
        }
      },
    );
  }
  await followHub(hub, send);
};

export const readBoardLiteFile = async (
  boardId: number,
  authorization: string,
  fileId: string,
): Promise<Record<string, unknown> | null> => {
  const hub = hubs.get(hubKey(boardId, authorization));
  if (!hub || hub.filesOmitted) return null;
  const ready = hub.files.get(fileId);
  if (ready) return ready;
  if (hub.done || hub.error) return hub.files.get(fileId) || null;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      const waiters = hub.fileWaiters.get(fileId) || [];
      hub.fileWaiters.set(
        fileId,
        waiters.filter((waiter) => waiter !== onFile),
      );
      resolve(hub.files.get(fileId) || null);
    }, 20000);
    const onFile = (file: Record<string, unknown> | null) => {
      clearTimeout(timer);
      resolve(file);
    };
    const waiters = hub.fileWaiters.get(fileId) || [];
    waiters.push(onFile);
    hub.fileWaiters.set(fileId, waiters);
  });
};

export const hubOmitsFiles = (boardId: number, authorization: string) =>
  !!hubs.get(hubKey(boardId, authorization))?.filesOmitted;

const liteFiles = (data: unknown) => {
  if (!data || typeof data !== "object") return data;
  const source = data as Record<string, unknown>;
  const files = source.files;
  if (!files || typeof files !== "object") return data;
  const next: Record<string, unknown> = {};
  for (const [id, file] of Object.entries(files)) {
    if (!file || typeof file !== "object") continue;
    const { dataURL: _dataURL, ...rest } = file as Record<string, unknown>;
    next[id] = rest;
  }
  return { ...source, files: next };
};

const absorbFiles = (
  hub: THub | undefined,
  data: unknown,
) => {
  const files = (data as { files?: unknown } | null)?.files;
  if (!hub || !files || typeof files !== "object") return;
  for (const [id, file] of Object.entries(files)) {
    if (
      file &&
      typeof file === "object" &&
      typeof (file as { dataURL?: unknown }).dataURL === "string" &&
      (file as { dataURL: string }).dataURL
    ) {
      hub.files.set(id, file as Record<string, unknown>);
    }
  }
};

export const saveBoardLite = async (params: {
  boardId: number;
  authorization: string;
  apiBase: string;
  snapshot: Record<string, unknown>;
  clientVersion: number;
}) => {
  const key = hubKey(params.boardId, params.authorization);
  let hub = hubs.get(key);
  let filesOmitted = !!hub?.filesOmitted;
  const incomingFiles =
    params.snapshot.files && typeof params.snapshot.files === "object"
      ? { ...(params.snapshot.files as Record<string, unknown>) }
      : {};

  const needsBinary = Object.entries(incomingFiles).filter(([, file]) => {
    const dataURL = (file as { dataURL?: unknown } | null)?.dataURL;
    return typeof dataURL !== "string" || !dataURL;
  });

  if (!filesOmitted && hub) {
    await Promise.all(
      needsBinary.map(async ([id, file]) => {
        const cached = await readBoardLiteFile(
          params.boardId,
          params.authorization,
          id,
        );
        const dataURL = cached?.dataURL;
        if (typeof dataURL === "string" && dataURL) {
          incomingFiles[id] = {
            ...(cached || {}),
            ...(file as Record<string, unknown>),
            dataURL,
          };
        }
      }),
    );
  }

  if (!hub) {
    const loaded = await fetch(
      `${params.apiBase}/board?id=${params.boardId}&omit_files=1`,
      {
        headers: {
          Authorization: params.authorization,
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );
    const json = await loaded.json().catch(() => null);
    filesOmitted = !!json?.filesOmitted;
    const data = json?.content?.data;
    if (!filesOmitted && data) {
      hub = createHub();
      hub.done = true;
      hubs.set(key, hub);
      absorbFiles(hub, data);
      for (const [id, file] of needsBinary) {
        const cached = hub.files.get(id);
        const dataURL = cached?.dataURL;
        if (typeof dataURL === "string" && dataURL) {
          incomingFiles[id] = {
            ...cached,
            ...(file as Record<string, unknown>),
            dataURL,
          };
        }
      }
    }
  }

  if (!filesOmitted) {
    const missing = Object.entries(incomingFiles).filter(([, file]) => {
      const dataURL = (file as { dataURL?: unknown } | null)?.dataURL;
      return typeof dataURL !== "string" || !dataURL;
    });
    if (missing.length) {
      return {
        status: 409,
        body: {
          success: false,
          message: "Board images are still loading",
        },
      };
    }
  }

  const upstream = await fetch(`${params.apiBase}/board/save-content`, {
    method: "POST",
    headers: {
      Authorization: params.authorization,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      board_id: params.boardId,
      data: { ...params.snapshot, files: incomingFiles },
      client_version: params.clientVersion,
      omit_files: filesOmitted,
    }),
  });

  const text = await upstream.text();
  let body: Record<string, unknown> = {};
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { success: false, message: "Invalid upstream response" };
  }

  const content = body.content as { data?: unknown } | undefined;
  if (content?.data) {
    absorbFiles(hub, content.data);
    if (filesOmitted || text.length > 1_000_000) {
      content.data = liteFiles(content.data);
      (content as { filesOmitted?: boolean }).filesOmitted = true;
    }
  }

  return { status: upstream.status, body };
};

export const gzipNdjsonStream = () => {
  const gzip = createGzip({ level: 6 });
  const pass = new PassThrough();
  gzip.pipe(pass);
  return {
    stream: Readable.toWeb(pass) as ReadableStream<Uint8Array>,
    write(line: string) {
      gzip.write(line);
      gzip.flush();
    },
    end() {
      gzip.end();
    },
  };
};
