"use client";

export type TUnscrambleToken = {
  id: string;
  value: string;
};

export type TUnscrambleSentence = {
  id: string;
  /** Author input, e.g. "She / is / a / teacher." */
  raw: string;
  tokens: TUnscrambleToken[];
};

export type TUnscrambleWordsData = {
  id?: number;
  sortIndex?: number;

  title?: string;
  titleColor?: string;
  subtitle?: string;
  description?: string;
  images?: Array<Record<string, string>>;

  sentences: TUnscrambleSentence[];
};

/** Split on `/`, trim, drop empties. */
export function parseUnscrambleTokenValues(raw: string): string[] {
  return String(raw || "")
    .split("/")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
}

/** At least one `/` and ≥2 non-empty tokens. */
export function isUnscrambleSentenceValid(raw: string): boolean {
  if (!String(raw || "").includes("/")) return false;
  return parseUnscrambleTokenValues(raw).length >= 2;
}

/** Exact match (case-sensitive); only trims edges. */
export function normalizeUnscrambleToken(s: string): string {
  return String(s || "").trim();
}
