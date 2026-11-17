export type TBoardScanHandlers = {
  onBoard?: (board: unknown) => void;
  onScene?: (scene: {
    elements: unknown[];
    appState: Record<string, unknown>;
  }) => void;
  onFile?: (id: string, file: Record<string, unknown>) => void;
};

type TPhase =
  | "start"
  | "top-key"
  | "top-colon"
  | "top-value"
  | "top-comma"
  | "content-key"
  | "content-colon"
  | "content-value"
  | "content-comma"
  | "data-key"
  | "data-colon"
  | "data-value"
  | "data-comma"
  | "files-key"
  | "files-colon"
  | "files-value"
  | "files-comma"
  | "done";

const isWs = (char: string) =>
  char === " " || char === "\n" || char === "\r" || char === "\t";

const findStringEnd = (input: string, start: number): number | null => {
  let i = start + 1;
  while (i < input.length) {
    const char = input[i];
    if (char === "\\") {
      if (i + 1 >= input.length) return null;
      if (input[i + 1] === "u") {
        if (i + 5 >= input.length) return null;
        i += 6;
        continue;
      }
      i += 2;
      continue;
    }
    if (char === '"') return i + 1;
    i += 1;
  }
  return null;
};

const findContainerEnd = (input: string, start: number): number | null => {
  let depth = 1;
  let i = start + 1;
  while (i < input.length) {
    const char = input[i];
    if (char === '"') {
      const end = findStringEnd(input, i);
      if (end == null) return null;
      i = end;
      continue;
    }
    if (char === "{" || char === "[") {
      depth += 1;
      i += 1;
      continue;
    }
    if (char === "}" || char === "]") {
      depth -= 1;
      i += 1;
      if (depth === 0) return i;
      continue;
    }
    i += 1;
  }
  return null;
};

const findLiteralEnd = (
  input: string,
  start: number,
  eof: boolean,
): number | null => {
  let i = start;
  while (i < input.length) {
    const char = input[i];
    if (
      char === "," ||
      char === "}" ||
      char === "]" ||
      char === " " ||
      char === "\n" ||
      char === "\r" ||
      char === "\t"
    ) {
      break;
    }
    i += 1;
  }
  if (i === start) return null;
  if (i >= input.length && !eof) return null;
  return i;
};

const findJsonValueEnd = (
  input: string,
  start: number,
  eof: boolean,
): number | null => {
  let i = start;
  while (i < input.length && isWs(input[i])) i += 1;
  if (i >= input.length) return null;
  const char = input[i];
  if (char === '"') return findStringEnd(input, i);
  if (char === "{" || char === "[") return findContainerEnd(input, i);
  if (
    char === "t" ||
    char === "f" ||
    char === "n" ||
    char === "-" ||
    (char >= "0" && char <= "9")
  ) {
    return findLiteralEnd(input, i, eof);
  }
  throw new Error(`Unexpected JSON at ${i}`);
};

export class BoardJsonScanner {
  buffer = "";
  cursor = 0;
  phase: TPhase = "start";
  key = "";
  sceneEmitted = false;
  elements: unknown[] = [];
  appState: Record<string, unknown> = {};
  version = 0;
  filesOmitted = false;
  done = false;
  eof = false;
  handlers: TBoardScanHandlers;

  constructor(handlers: TBoardScanHandlers = {}) {
    this.handlers = handlers;
  }

  push(chunk: string, eof = false) {
    if (chunk) this.buffer += chunk;
    if (eof) this.eof = true;
    this.drain();
    if (this.cursor > 512 * 1024) {
      this.buffer = this.buffer.slice(this.cursor);
      this.cursor = 0;
    }
  }

  finish() {
    this.eof = true;
    this.drain();
    if (!this.done) {
      throw new Error("Incomplete board payload");
    }
  }

  drain() {
    while (!this.done && this.step()) {
      /* keep consuming complete tokens */
    }
  }

  skipWs() {
    while (this.cursor < this.buffer.length && isWs(this.buffer[this.cursor])) {
      this.cursor += 1;
    }
  }

  peek(): string | null {
    this.skipWs();
    if (this.cursor >= this.buffer.length) return null;
    return this.buffer[this.cursor];
  }

  parseValue(): { value: unknown; end: number } | null {
    const end = findJsonValueEnd(this.buffer, this.cursor, this.eof);
    if (end == null) return null;
    const value = JSON.parse(this.buffer.slice(this.cursor, end));
    return { value, end };
  }

  emitScene() {
    if (this.sceneEmitted) return;
    this.sceneEmitted = true;
    this.handlers.onScene?.({
      elements: this.elements,
      appState: this.appState,
    });
  }

  step(): boolean {
    if (this.phase === "done") return false;

    if (this.phase === "start") {
      const char = this.peek();
      if (char == null) return false;
      if (char !== "{") throw new Error("Board payload must be an object");
      this.cursor += 1;
      this.phase = "top-key";
      return true;
    }

    if (
      this.phase === "top-key" ||
      this.phase === "content-key" ||
      this.phase === "data-key"
    ) {
      const char = this.peek();
      if (char == null) return false;
      const close = this.phase === "top-key";
      if (char === "}") {
        this.cursor += 1;
        if (close) {
          this.phase = "done";
          this.done = true;
          return false;
        }
        this.phase = this.phase === "content-key" ? "top-comma" : "content-comma";
        return true;
      }
      const parsed = this.parseValue();
      if (!parsed || typeof parsed.value !== "string") return false;
      this.key = parsed.value;
      this.cursor = parsed.end;
      this.phase =
        this.phase === "top-key"
          ? "top-colon"
          : this.phase === "content-key"
            ? "content-colon"
            : "data-colon";
      return true;
    }

    if (
      this.phase === "top-colon" ||
      this.phase === "content-colon" ||
      this.phase === "data-colon" ||
      this.phase === "files-colon"
    ) {
      const char = this.peek();
      if (char == null) return false;
      if (char !== ":") throw new Error("Expected colon");
      this.cursor += 1;
      this.phase =
        this.phase === "top-colon"
          ? "top-value"
          : this.phase === "content-colon"
            ? "content-value"
            : this.phase === "data-colon"
              ? "data-value"
              : "files-value";
      return true;
    }

    if (this.phase === "top-value") return this.consumeTopValue();
    if (this.phase === "content-value") return this.consumeContentValue();
    if (this.phase === "data-value") return this.consumeDataValue();
    if (this.phase === "files-key") return this.consumeFilesKey();
    if (this.phase === "files-value") return this.consumeFilesValue();
    if (this.phase === "files-comma") return this.consumeFilesComma();

    if (
      this.phase === "top-comma" ||
      this.phase === "content-comma" ||
      this.phase === "data-comma"
    ) {
      const char = this.peek();
      if (char == null) return false;
      if (char === ",") {
        this.cursor += 1;
        this.phase =
          this.phase === "top-comma"
            ? "top-key"
            : this.phase === "content-comma"
              ? "content-key"
              : "data-key";
        return true;
      }
      if (char === "}") {
        this.cursor += 1;
        if (this.phase === "top-comma") {
          this.phase = "done";
          this.done = true;
          return false;
        }
        this.phase = this.phase === "content-comma" ? "top-comma" : "content-comma";
        return true;
      }
      throw new Error("Expected comma or closing brace");
    }

    return false;
  }

  openNested(next: TPhase): boolean {
    const char = this.peek();
    if (char == null) return false;
    if (char !== "{") throw new Error("Expected object");
    this.cursor += 1;
    this.phase = next;
    return true;
  }

  consumeTopValue(): boolean {
    if (this.key === "content") return this.openNested("content-key");
    const parsed = this.parseValue();
    if (!parsed) return false;
    this.cursor = parsed.end;
    if (this.key === "filesOmitted") this.filesOmitted = parsed.value === true;
    if (this.key === "board") this.handlers.onBoard?.(parsed.value);
    this.phase = "top-comma";
    return true;
  }

  consumeContentValue(): boolean {
    if (this.key === "data") return this.openNested("data-key");
    const parsed = this.parseValue();
    if (!parsed) return false;
    this.cursor = parsed.end;
    if (this.key === "version") this.version = Number(parsed.value || 0);
    this.phase = "content-comma";
    return true;
  }

  consumeDataValue(): boolean {
    if (this.key === "files") return this.openNested("files-key");
    const parsed = this.parseValue();
    if (!parsed) return false;
    this.cursor = parsed.end;
    if (this.key === "elements" && Array.isArray(parsed.value)) {
      this.elements = parsed.value;
      this.emitScene();
    }
    if (
      this.key === "appState" &&
      parsed.value &&
      typeof parsed.value === "object"
    ) {
      this.appState = parsed.value as Record<string, unknown>;
    }
    this.phase = "data-comma";
    return true;
  }

  consumeFilesKey(): boolean {
    const char = this.peek();
    if (char == null) return false;
    if (char === "}") {
      this.cursor += 1;
      this.phase = "data-comma";
      return true;
    }
    const parsed = this.parseValue();
    if (!parsed || typeof parsed.value !== "string") return false;
    this.key = parsed.value;
    this.cursor = parsed.end;
    this.phase = "files-colon";
    return true;
  }

  consumeFilesValue(): boolean {
    const parsed = this.parseValue();
    if (!parsed) return false;
    this.cursor = parsed.end;
    const file =
      parsed.value && typeof parsed.value === "object"
        ? (parsed.value as Record<string, unknown>)
        : { id: this.key };
    this.handlers.onFile?.(this.key, file);
    this.phase = "files-comma";
    return true;
  }

  consumeFilesComma(): boolean {
    const char = this.peek();
    if (char == null) return false;
    if (char === ",") {
      this.cursor += 1;
      this.phase = "files-key";
      return true;
    }
    if (char === "}") {
      this.cursor += 1;
      this.phase = "data-comma";
      return true;
    }
    throw new Error("Expected comma or end of files");
  }
}
