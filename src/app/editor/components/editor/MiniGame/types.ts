"use client";

export const MINI_GAME_KINDS = [
  "flash-cards",
  "matching-pairs",
  "spin-wheel",
  "hangman",
  "wordsearch",
] as const;

export type TMiniGameKind = (typeof MINI_GAME_KINDS)[number];

export const MINI_GAME_EX_TYPE = "mini_game";

export type TMiniGameItem = {
  id: string;
  term: string;
  definition?: string;
};

export type TMiniGameData = {
  id?: number;
  sortIndex?: number;
  title?: string;
  titleColor?: string;
  subtitle?: string;
  description?: string;
  images?: Array<Record<string, string>>;
  activeGame: TMiniGameKind;
  items: TMiniGameItem[];
  options?: {
    showDefinitionOnWheel?: boolean;
    shuffle?: boolean;
    /** Flash cards: one at a time (default) or all on screen */
    flashCardsLayout?: "one" | "all";
  };
};

export type TMiniGameDragCell = { row: number; col: number };

/** Shared live snapshot (also used as local/answer-shaped progress). */
export type TMiniGameAnswerState = {
  activeGame?: TMiniGameKind;
  score?: number;
  total?: number;
  completed?: boolean;
  knownIds?: string[];
  matchedPairIds?: string[];
  lastSpinItemId?: string | null;
  hangman?: {
    wordIndex: number;
    /** Revealed letter positions (one index per successful guess). */
    revealedIndexes?: number[];
    /** Letters guessed that were not in the remaining unrevealed slots. */
    missedLetters?: string[];
    /** @deprecated legacy — all instances of a letter revealed at once */
    guessed?: string[];
    wrong: number;
    status: "playing" | "won" | "lost";
  };
  foundWords?: string[];
  /** Live UI — flash / matching layout */
  layoutSeed?: number;
  order?: string[];
  flipped?: boolean;
  flippedIds?: string[];
  cardIndex?: number;
  openIds?: string[];
  tileOrder?: string[];
  /** Live UI — wheel spin in flight */
  spinTargetId?: string | null;
  spinStartedAtMs?: number | null;
  spinDurationMs?: number;
  spinToken?: number;
  /** Live UI — wordsearch drag */
  drag?: { start: TMiniGameDragCell; hover: TMiniGameDragCell } | null;
};

export type TMiniGameLiveState = TMiniGameAnswerState;

export type TMiniGamePatch =
  | Partial<TMiniGameAnswerState>
  | ((prev: TMiniGameAnswerState) => TMiniGameAnswerState);

export function isMiniGameKind(value: unknown): value is TMiniGameKind {
  return (
    typeof value === "string" &&
    (MINI_GAME_KINDS as readonly string[]).includes(value)
  );
}

/** Map chooser subItem type / stored type → activeGame */
export function resolveActiveGame(
  templateType?: string | null,
  data?: Partial<TMiniGameData> | null,
): TMiniGameKind {
  if (isMiniGameKind(templateType)) return templateType;
  if (isMiniGameKind(data?.activeGame)) return data.activeGame;
  return "flash-cards";
}

/** At least one side filled — for games that need words. */
export function isMiniGameItemValid(item: {
  term?: string;
  definition?: string;
}): boolean {
  return (
    !!String(item?.term || "").trim() ||
    !!String(item?.definition || "").trim()
  );
}

export function minItemsForGame(game: TMiniGameKind): number {
  switch (game) {
    case "matching-pairs":
    case "wordsearch":
      return 4;
    case "flash-cards":
    case "spin-wheel":
    case "hangman":
    default:
      return 1;
  }
}

/**
 * Normalize items. Flash cards keep empty sides; other games drop blank pairs
 * and fall back to the other side when a word is needed.
 */
export function validItems(
  items: TMiniGameItem[] | undefined,
  opts?: { keepEmpty?: boolean },
): TMiniGameItem[] {
  const normalized = (items || []).map((i) => ({
    id: i.id,
    term: String(i.term || "").trim(),
    definition: String(i.definition || "").trim() || undefined,
  }));
  if (opts?.keepEmpty) return normalized;
  return normalized.filter(isMiniGameItemValid);
}

export function itemWord(item: TMiniGameItem): string {
  return String(item.term || "").trim() || String(item.definition || "").trim();
}
