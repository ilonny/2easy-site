import type { TField, TFieldOption } from "../components/editor/FillGapsSelect/types";

/** Старые упражнения: options пустой или в нестандартном виде → Math.max(...[]) даёт -Infinity и селект схлопывается. */
export function normalizeFieldOptions(raw: unknown): TFieldOption[] {
  if (raw == null) return [];
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  } else {
    return [];
  }

  const out: TFieldOption[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    let opt: TFieldOption | null = null;
    if (item == null) continue;
    if (typeof item === "string") {
      const v = item.trim();
      if (!v) continue;
      opt = { value: v, isCorrect: false };
    } else if (typeof item === "object") {
      const o = item as Record<string, unknown>;
      const rawVal = o.value ?? o.label ?? o.text;
      if (rawVal == null) continue;
      const v = String(rawVal).trim();
      if (!v) continue;
      opt = {
        value: v,
        isCorrect: Boolean(o.isCorrect),
      };
    }
    if (opt && !seen.has(opt.value)) {
      seen.add(opt.value);
      out.push(opt);
    }
  }
  return out;
}

export function normalizeField(field: TField | undefined): TField | undefined {
  if (!field) return undefined;
  return {
    ...field,
    options: normalizeFieldOptions(field.options),
  };
}

export function maxOptionTextLength(options: TFieldOption[]): number {
  const lengths = options
    .map((o) => String(o?.value ?? "").length)
    .filter((n) => n > 0);
  return lengths.length > 0 ? Math.max(...lengths) : 8;
}

export type TGapHtmlNode =
  | { type: "text"; text: string }
  | { type: "gap"; id: string }
  | {
      type: "el";
      tag: string;
      attrs: Record<string, string>;
      children: TGapHtmlNode[];
    };

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);

function decodeHtmlText(text: string): string {
  return text
    .replace(/&nbsp;/gi, "\u00a0")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&#(\d+);/g, (all, n) => {
      const code = Number(n);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    })
    .replace(/&#x([0-9a-f]+);/gi, (all, n) => {
      const code = parseInt(n, 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : all;
    });
}

function parseAttrs(raw: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  const re =
    /([^\s=/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;
  const src = raw.replace(/\/\s*$/, "");
  while ((match = re.exec(src))) {
    const name = match[1].toLowerCase();
    if (name === "/") continue;
    attrs[name] = decodeHtmlText(match[2] ?? match[3] ?? match[4] ?? "");
  }
  return attrs;
}

function hasClass(attrs: Record<string, string>, cls: string) {
  return ` ${attrs.class || ""} `.includes(` ${cls} `);
}

/**
 * Turn saved contenteditable HTML into a tree.
 * `.answerWrapper` nodes (editor placeholder ______ + chevron) become gaps
 * so the student view can render a real control in React instead of
 * portaling into innerHTML — that portal was wiped on each keystroke.
 */
export function parseLegacyGapHtml(html: string): TGapHtmlNode[] {
  const src = html || "";
  const root: TGapHtmlNode[] = [];
  type Frame = {
    tag: string;
    attrs: Record<string, string>;
    children: TGapHtmlNode[];
  };
  const stack: Frame[] = [];

  const append = (node: TGapHtmlNode) => {
    const parent = stack[stack.length - 1];
    if (parent) parent.children.push(node);
    else root.push(node);
  };

  const closeFrame = (frame: Frame) => {
    if (hasClass(frame.attrs, "answerWrapper")) {
      append({ type: "gap", id: frame.attrs.id || "" });
      return;
    }
    append({
      type: "el",
      tag: frame.tag,
      attrs: frame.attrs,
      children: frame.children,
    });
  };

  const re =
    /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)([^>]*?)(\/?)>|([^<]+)/g;

  let match: RegExpExecArray | null;
  while ((match = re.exec(src))) {
    if (match[0].startsWith("<!--") || match[0].startsWith("<![")) continue;
    if (match[5] != null) {
      if (match[5]) append({ type: "text", text: decodeHtmlText(match[5]) });
      continue;
    }
    if (match[1]) {
      const tag = match[1].toLowerCase();
      while (stack.length) {
        const frame = stack.pop()!;
        closeFrame(frame);
        if (frame.tag === tag) break;
      }
      continue;
    }
    const tag = (match[2] || "").toLowerCase();
    const rawAttrs = match[3] || "";
    const selfClosing = match[4] === "/" || VOID_TAGS.has(tag);
    const attrs = parseAttrs(rawAttrs);
    if (selfClosing) {
      closeFrame({ tag, attrs, children: [] });
      continue;
    }
    stack.push({ tag, attrs, children: [] });
  }
  while (stack.length) {
    closeFrame(stack.pop()!);
  }
  return root;
}

export function collectGapIds(nodes: TGapHtmlNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: TGapHtmlNode[]) => {
    list.forEach((node) => {
      if (node.type === "gap") {
        if (node.id) ids.push(node.id);
        return;
      }
      if (node.type === "el") walk(node.children);
    });
  };
  walk(nodes);
  return ids;
}

export function computeSelectWrapperMinWidth(maxOptionLength: number): number {
  let minWidth =
    maxOptionLength *
    (maxOptionLength <= 5
      ? 75
      : maxOptionLength <= 10
        ? 20
        : maxOptionLength >= 20
          ? 10
          : 15);
  if (!Number.isFinite(minWidth) || minWidth < 70) {
    minWidth = 85;
  }
  if (typeof window !== "undefined" && window.innerWidth < 640) {
    return Math.min(minWidth, Math.max(96, window.innerWidth - 64));
  }
  return Math.min(minWidth, 360);
}
