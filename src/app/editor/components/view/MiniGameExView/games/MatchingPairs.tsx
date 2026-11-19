"use client";

import { FC, useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  itemWord,
  TMiniGameAnswerState,
  TMiniGameItem,
  TMiniGamePatch,
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
  onPatch: (patch: TMiniGamePatch) => void;
};

export const MatchingPairsGame: FC<TProps> = ({
  items,
  shuffle,
  canInteract,
  state,
  onPatch,
}) => {
  const { t } = useTranslation();
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
    if (resolveTimerRef.current) {
      window.clearTimeout(resolveTimerRef.current);
    }
    resolveTimerRef.current = window.setTimeout(() => {
      resolveTimerRef.current = null;
      onPatch((prev) => {
        const open = prev.openIds || [];
        if (open[0] !== aId || open[1] !== bId) return prev;
        if (a && b && a.pairId === b.pairId && a.id !== b.id) {
          const nextMatched = Array.from(
            new Set([...(prev.matchedPairIds || []), a.pairId]),
          );
          return {
            ...prev,
            activeGame: "matching-pairs",
            matchedPairIds: nextMatched,
            openIds: [],
            score: nextMatched.length,
            total: items.length,
            completed: nextMatched.length >= items.length,
          };
        }
        return {
          ...prev,
          activeGame: "matching-pairs",
          openIds: [],
        };
      });
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

    onPatch((prev) => {
      const open = prev.openIds || [];
      if (open.length >= 2 || open.includes(tile.id)) return prev;
      if ((prev.matchedPairIds || []).includes(tile.pairId)) return prev;
      return {
        ...prev,
        activeGame: "matching-pairs",
        openIds: [...open, tile.id],
      };
    });
  };

  return (
    <div>
      <div className={styles.score}>
        {t("editor.miniGamePairs", {
          matched: matched.size,
          total: items.length,
        })}
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
