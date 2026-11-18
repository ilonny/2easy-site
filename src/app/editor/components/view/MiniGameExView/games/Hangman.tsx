"use client";

import { Button } from "@nextui-org/react";
import { FC, useMemo } from "react";
import {
  itemWord,
  TMiniGameAnswerState,
  TMiniGameItem,
} from "../../../editor/MiniGame/types";
import { HangmanFigure } from "./HangmanFigure";
import styles from "../styles.module.css";

const ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const MAX_WRONG = 6;

type TProps = {
  items: TMiniGameItem[];
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: Partial<TMiniGameAnswerState>) => void;
};

function normalize(s: string) {
  return String(s || "")
    .toUpperCase()
    .replace(/[^A-ZА-ЯЁ0-9 ]/gi, "");
}

function emptyHangman(wordIndex: number) {
  return {
    wordIndex,
    revealedIndexes: [] as number[],
    missedLetters: [] as string[],
    guessed: [] as string[],
    wrong: 0,
    status: "playing" as const,
  };
}

/** Migrate legacy `guessed` (reveal-all) into per-index reveals. */
function resolveRevealed(
  word: string,
  hangman: TMiniGameAnswerState["hangman"] | undefined,
): number[] {
  if (Array.isArray(hangman?.revealedIndexes)) {
    return hangman!.revealedIndexes!;
  }
  const guessed = new Set(
    (hangman?.guessed || []).map((g) => g.toUpperCase()),
  );
  if (!guessed.size) return [];
  const out: number[] = [];
  word.split("").forEach((ch, idx) => {
    if (ch !== " " && guessed.has(ch)) out.push(idx);
  });
  return out;
}

export const HangmanGame: FC<TProps> = ({
  items,
  canInteract,
  state,
  onPatch,
}) => {
  const wordIndex = Math.min(
    Math.max(0, state.hangman?.wordIndex ?? 0),
    Math.max(0, items.length - 1),
  );
  const item = items[wordIndex];
  const word = normalize(item ? itemWord(item) : "");
  const revealed = useMemo(
    () => new Set(resolveRevealed(word, state.hangman)),
    [word, state.hangman],
  );
  const missed = useMemo(() => {
    const set = new Set(
      (state.hangman?.missedLetters || []).map((g) => g.toUpperCase()),
    );
    if (!state.hangman?.missedLetters?.length && state.hangman?.guessed?.length) {
      (state.hangman.guessed || []).forEach((g) => {
        const L = g.toUpperCase();
        if (!word.includes(L)) set.add(L);
      });
    }
    return set;
  }, [state.hangman, word]);
  const wrong = state.hangman?.wrong ?? missed.size;
  const status = state.hangman?.status ?? "playing";

  const playableIndexes = useMemo(() => {
    const idxs: number[] = [];
    word.split("").forEach((ch, idx) => {
      if (ch !== " ") idxs.push(idx);
    });
    return idxs;
  }, [word]);

  const display = useMemo(() => {
    return word.split("").map((ch, idx) => {
      if (ch === " ") return { key: `sp-${idx}`, ch: " ", revealed: true };
      return {
        key: `${idx}-${ch}`,
        ch,
        revealed: revealed.has(idx) || status === "lost",
      };
    });
  }, [word, revealed, status]);

  const remainingCount = (letter: string) => {
    const L = letter.toUpperCase();
    let left = 0;
    word.split("").forEach((ch, idx) => {
      if (ch === L && !revealed.has(idx)) left += 1;
    });
    return left;
  };

  const letterExhausted = (letter: string) => {
    const L = letter.toUpperCase();
    if (missed.has(L)) return true;
    // Letter already used — all its occurrences are revealed
    const total = word.split("").filter((ch) => ch === L).length;
    if (total === 0) return false;
    return remainingCount(L) === 0;
  };

  const clue =
    String(item?.definition || "").trim() &&
    String(item?.term || "").trim()
      ? item?.definition
      : undefined;

  const guess = (letter: string) => {
    if (!canInteract || status !== "playing") return;
    const L = letter.toUpperCase();
    if (letterExhausted(L)) return;

    const nextRevealed = Array.from(revealed);
    const nextMissed = Array.from(missed);
    let nextWrong = wrong;

    // Classic hangman: reveal every occurrence of the letter at once
    const hitIndexes: number[] = [];
    word.split("").forEach((ch, idx) => {
      if (ch === L && !revealed.has(idx)) hitIndexes.push(idx);
    });

    if (hitIndexes.length) {
      hitIndexes.forEach((idx) => nextRevealed.push(idx));
    } else {
      if (!missed.has(L)) nextMissed.push(L);
      nextWrong += 1;
    }

    const allDone = playableIndexes.every((i) => nextRevealed.includes(i));
    let nextStatus: "playing" | "won" | "lost" = "playing";
    if (allDone) nextStatus = "won";
    else if (nextWrong >= MAX_WRONG) nextStatus = "lost";

    const wonCount = (state.score || 0) + (nextStatus === "won" ? 1 : 0);

    onPatch({
      activeGame: "hangman",
      hangman: {
        wordIndex,
        revealedIndexes: nextRevealed,
        missedLetters: nextMissed,
        guessed: nextMissed, // keep something for older readers
        wrong: nextWrong,
        status: nextStatus,
      },
      score: wonCount,
      total: items.length,
      completed: false,
    });
  };

  const goToWord = (index: number, opts?: { resetScore?: boolean }) => {
    if (!canInteract || !items.length) return;
    const nextIndex = Math.min(Math.max(0, index), items.length - 1);
    onPatch({
      activeGame: "hangman",
      hangman: emptyHangman(nextIndex),
      ...(opts?.resetScore
        ? { score: 0, total: items.length, completed: false }
        : {}),
    });
  };

  const restartCurrent = () => {
    if (!canInteract) return;
    onPatch({
      activeGame: "hangman",
      hangman: emptyHangman(wordIndex),
    });
  };

  const restartAll = () => {
    if (!canInteract) return;
    goToWord(0, { resetScore: true });
  };

  return (
    <div>
      <div className={styles.score}>
        Слово {wordIndex + 1}/{items.length || 1} · Wins: {state.score || 0}/
        {items.length}
      </div>
      <div className={styles.hangmanLayout}>
        <HangmanFigure wrong={wrong} maxWrong={MAX_WRONG} />
        <div className={styles.hangmanMain}>
          {!!clue && (
            <div className={styles.hangmanClue}>Clue: {clue}</div>
          )}
          <div className={styles.hangmanWord}>
            {display.map((d) =>
              d.ch === " " ? (
                <span key={d.key} style={{ width: 16 }} />
              ) : (
                <span key={d.key} className={styles.hangmanLetter}>
                  {d.revealed ? d.ch : ""}
                </span>
              ),
            )}
          </div>
          {status !== "playing" && (
            <div className={styles.hangmanStatus}>
              {status === "won" ? "You won!" : `Lost — ${word}`}
            </div>
          )}
          <div className={styles.alphaGrid}>
            {ALPHA.map((L) => {
              const used = letterExhausted(L);
              return (
                <button
                  key={L}
                  type="button"
                  className={`${styles.alphaBtn} ${
                    used ? styles.alphaBtnUsed : ""
                  }`}
                  disabled={!canInteract || status !== "playing" || used}
                  onClick={() => guess(L)}
                >
                  {L}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className={styles.flashActions} style={{ marginTop: 16 }}>
        <Button
          variant="bordered"
          isDisabled={!canInteract || wordIndex <= 0}
          onPress={() => goToWord(wordIndex - 1)}
        >
          Назад
        </Button>
        <Button
          variant="flat"
          isDisabled={!canInteract}
          onPress={restartCurrent}
        >
          Заново
        </Button>
        <Button
          variant="light"
          isDisabled={!canInteract}
          onPress={restartAll}
        >
          С начала
        </Button>
        <Button
          color="primary"
          variant="flat"
          isDisabled={!canInteract || wordIndex >= items.length - 1}
          onPress={() => goToWord(wordIndex + 1)}
        >
          Далее
        </Button>
      </div>
    </div>
  );
};
