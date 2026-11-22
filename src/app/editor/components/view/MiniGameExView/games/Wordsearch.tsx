"use client";

import { FC, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  TMiniGameAnswerState,
  TMiniGameItem,
  TMiniGamePatch,
} from "../../../editor/MiniGame/types";
import { buildWordsearchGrid, cellsKey } from "../wordsearchGrid";
import styles from "../styles.module.css";

type TProps = {
  items: TMiniGameItem[];
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: TMiniGamePatch) => void;
};

type Cell = { row: number; col: number };

function lineBetween(a: Cell, b: Cell): Cell[] | null {
  const dr = Math.sign(b.row - a.row);
  const dc = Math.sign(b.col - a.col);
  const rowDist = Math.abs(b.row - a.row);
  const colDist = Math.abs(b.col - a.col);
  if (rowDist !== 0 && colDist !== 0 && rowDist !== colDist) return null;
  const steps = Math.max(rowDist, colDist);
  const cells: Cell[] = [];
  for (let i = 0; i <= steps; i++) {
    cells.push({ row: a.row + dr * i, col: a.col + dc * i });
  }
  return cells;
}

export const WordsearchGame: FC<TProps> = ({
  items,
  canInteract,
  state,
  onPatch,
}) => {
  const { t } = useTranslation();
  const words = useMemo(
    () => items.map((i) => String(i.term || "").trim()).filter(Boolean),
    [items],
  );
  const built = useMemo(() => buildWordsearchGrid(words), [words]);
  const found = new Set((state.foundWords || []).map((w) => w.toUpperCase()));

  const start = state.drag?.start || null;
  const hover = state.drag?.hover || null;
  const dragThrottleRef = useRef(0);

  const selected = useMemo(() => {
    if (!start || !hover) return start ? [start] : [];
    return lineBetween(start, hover) || [start];
  }, [start, hover]);

  const selectedKey = cellsKey(selected);

  const foundCellKeys = useMemo(() => {
    const set = new Set<string>();
    built.placements.forEach((p) => {
      if (!found.has(p.word)) return;
      p.cells.forEach((c) => set.add(`${c.row},${c.col}`));
    });
    return set;
  }, [built.placements, found]);

  const publishDrag = (next: TMiniGameAnswerState["drag"]) => {
    const now = Date.now();
    if (next && now - dragThrottleRef.current < 80) return;
    dragThrottleRef.current = now;
    onPatch({
      activeGame: "wordsearch",
      drag: next,
    });
  };

  const finishSelection = (end: Cell) => {
    if (!canInteract || !start) {
      onPatch({ activeGame: "wordsearch", drag: null });
      return;
    }
    const path = lineBetween(start, end);
    if (!path || path.length < 2) {
      onPatch({ activeGame: "wordsearch", drag: null });
      return;
    }

    const letters = path.map((c) => built.grid[c.row][c.col]).join("");
    const reversed = letters.split("").reverse().join("");
    const match = built.placements.find(
      (p) =>
        !found.has(p.word) &&
        (p.word === letters ||
          p.word === reversed ||
          cellsKey(p.cells) === cellsKey(path) ||
          cellsKey([...p.cells].reverse()) === cellsKey(path)),
    );
    if (!match) {
      onPatch({ activeGame: "wordsearch", drag: null });
      return;
    }

    const word = match.word;
    onPatch((prev) => {
      const already = new Set(
        (prev.foundWords || []).map((item) => item.toUpperCase()),
      );
      if (already.has(word)) {
        return { ...prev, activeGame: "wordsearch", drag: null };
      }
      const nextFound = [...(prev.foundWords || []), word];
      return {
        ...prev,
        activeGame: "wordsearch",
        foundWords: nextFound,
        drag: null,
        score: nextFound.length,
        total: built.placements.length,
        completed: nextFound.length >= built.placements.length,
      };
    });
  };

  return (
    <div className={styles.wsLayout}>
      <div className={styles.score}>
        {t("editor.miniGameFound", {
          found: found.size,
          total: built.placements.length,
        })}
      </div>
      <div className={styles.wsWords}>
        {built.placements.map((p) => (
          <span
            key={p.word}
            className={`${styles.wsWordChip} ${
              found.has(p.word) ? styles.wsWordFound : ""
            }`}
          >
            {p.word}
          </span>
        ))}
      </div>
      <div
        className={styles.wsGrid}
        style={{ gridTemplateColumns: `repeat(${built.size}, auto)` }}
      >
        {built.grid.map((row, r) =>
          row.map((letter, c) => {
            const key = `${r},${c}`;
            const isSelected = selected.some(
              (cell) => cell.row === r && cell.col === c,
            );
            const isFound = foundCellKeys.has(key);
            return (
              <button
                key={key}
                type="button"
                className={`${styles.wsCell} ${
                  isFound
                    ? styles.wsCellFound
                    : isSelected
                      ? styles.wsCellSelected
                      : ""
                }`}
                disabled={!canInteract}
                onMouseDown={() => {
                  if (!canInteract) return;
                  const cell = { row: r, col: c };
                  dragThrottleRef.current = 0;
                  publishDrag({ start: cell, hover: cell });
                }}
                onMouseEnter={() => {
                  if (!start) return;
                  publishDrag({ start, hover: { row: r, col: c } });
                }}
                onMouseUp={() => finishSelection({ row: r, col: c })}
                onTouchStart={() => {
                  if (!canInteract) return;
                  const cell = { row: r, col: c };
                  dragThrottleRef.current = 0;
                  publishDrag({ start: cell, hover: cell });
                }}
                onTouchEnd={() => {
                  if (hover) finishSelection(hover);
                }}
              >
                {letter}
              </button>
            );
          }),
        )}
      </div>
      <span className="hidden" aria-hidden>
        {selectedKey}
      </span>
    </div>
  );
};
