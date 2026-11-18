"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import {
  itemWord,
  TMiniGameAnswerState,
  TMiniGameItem,
} from "../../../editor/MiniGame/types";
import { hashSeed, shuffleWithSeed } from "../miniGameLiveUtils";
import styles from "../styles.module.css";

type TTile = {
  id: string;
  pairId: string;
  text: string;
};

type TProps = {
  items: TMiniGameItem[];
  shuffle?: boolean;
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: Partial<TMiniGameAnswerState>) => void;
};

export const MatchingPairsGame: FC<TProps> = ({
  items,
  shuffle,
  canInteract,
  state,
  onPatch,
}) => {
  const resolveTimerRef = useRef<number | null>(null);

  const baseTiles = useMemo(() => {
    const tiles: TTile[] = [];
    items.forEach((item) => {
      const front = String(item.term || "").trim() || itemWord(item);
      const back =
        String(item.definition || "").trim() || itemWord(item);
      tiles.push({
        id: `${item.id}:term`,
        pairId: item.id,
        text: front,
      });
      tiles.push({
        id: `${item.id}:def`,
        pairId: item.id,
        text: back,
      });
    });
    return tiles;
  }, [items]);

  const defaultSeed = useMemo(
    () => hashSeed(baseTiles.map((t) => t.id).join("|")),
    [baseTiles],
  );

  const tiles = useMemo(() => {
    if (state.tileOrder?.length) {
      const byId = new Map(baseTiles.map((t) => [t.id, t]));
      return state.tileOrder
        .map((id) => byId.get(id))
        .filter(Boolean) as TTile[];
    }
    const seed = state.layoutSeed ?? defaultSeed;
    return shuffle ? shuffleWithSeed(baseTiles, seed) : baseTiles;
  }, [baseTiles, defaultSeed, shuffle, state.layoutSeed, state.tileOrder]);

  useEffect(() => {
    if (!canInteract || !baseTiles.length) return;
    if (state.tileOrder?.length && state.layoutSeed != null) return;
    const seed = state.layoutSeed ?? defaultSeed;
    const ordered = shuffle ? shuffleWithSeed(baseTiles, seed) : baseTiles;
    onPatch({
      layoutSeed: seed,
      tileOrder: ordered.map((t) => t.id),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInteract, defaultSeed, baseTiles.length]);

  const matched = new Set(state.matchedPairIds || []);
  const openIds = state.openIds || [];
  const locked = openIds.length >= 2;
  const openKey = openIds.join("|");

  // Every client resolves a two-card open locally so remotes don't stay stuck.
  useEffect(() => {
    if (openIds.length < 2) {
      if (resolveTimerRef.current) {
        window.clearTimeout(resolveTimerRef.current);
        resolveTimerRef.current = null;
      }
      return;
    }
    const [aId, bId] = openIds;
    const a = tiles.find((t) => t.id === aId);
    const b = tiles.find((t) => t.id === bId);
    const matchedSnapshot = state.matchedPairIds || [];
    if (resolveTimerRef.current) {
      window.clearTimeout(resolveTimerRef.current);
    }
    resolveTimerRef.current = window.setTimeout(() => {
      resolveTimerRef.current = null;
      if (a && b && a.pairId === b.pairId && a.id !== b.id) {
        const nextMatched = Array.from(
          new Set([...matchedSnapshot, a.pairId]),
        );
        onPatch({
          activeGame: "matching-pairs",
          matchedPairIds: nextMatched,
          openIds: [],
          score: nextMatched.length,
          total: items.length,
          completed: nextMatched.length >= items.length,
        });
      } else {
        onPatch({
          activeGame: "matching-pairs",
          openIds: [],
        });
      }
    }, 550);
    return () => {
      if (resolveTimerRef.current) {
        window.clearTimeout(resolveTimerRef.current);
        resolveTimerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openKey, tiles]);

  const onTile = (tile: TTile) => {
    if (!canInteract || locked) return;
    if (matched.has(tile.pairId)) return;
    if (openIds.includes(tile.id)) return;

    onPatch({
      activeGame: "matching-pairs",
      openIds: [...openIds, tile.id],
    });
  };

  return (
    <div>
      <div className={styles.score}>
        Pairs: {matched.size}/{items.length}
      </div>
      <div className={styles.memoryGrid}>
        {tiles.map((tile) => {
          const isMatched = matched.has(tile.pairId);
          const isOpen = isMatched || openIds.includes(tile.id);
          return (
            <button
              key={tile.id}
              type="button"
              disabled={!canInteract || isMatched}
              className={`${styles.memoryTile} ${
                isMatched
                  ? styles.memoryTileMatched
                  : isOpen
                    ? styles.memoryTileOpen
                    : ""
              }`}
              onClick={() => onTile(tile)}
            >
              {isOpen ? tile.text : "?"}
            </button>
          );
        })}
      </div>
    </div>
  );
};
