"use client";

import { Button } from "@nextui-org/react";
import { FC, useEffect, useMemo } from "react";
import {
  TMiniGameAnswerState,
  TMiniGameItem,
} from "../../../editor/MiniGame/types";
import { hashSeed, shuffleWithSeed } from "../miniGameLiveUtils";
import styles from "../styles.module.css";

type TProps = {
  items: TMiniGameItem[];
  shuffle?: boolean;
  layout?: "one" | "all";
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: Partial<TMiniGameAnswerState>) => void;
};

export const FlashCardsGame: FC<TProps> = ({
  items,
  shuffle,
  layout = "one",
  canInteract,
  state,
  onPatch,
}) => {
  if (layout === "all") {
    return (
      <FlashCardsAll
        items={items}
        shuffle={shuffle}
        canInteract={canInteract}
        state={state}
        onPatch={onPatch}
      />
    );
  }

  return (
    <FlashCardsOne
      items={items}
      shuffle={shuffle}
      canInteract={canInteract}
      state={state}
      onPatch={onPatch}
    />
  );
};

function useSharedOrder(
  items: TMiniGameItem[],
  shuffle: boolean | undefined,
  state: TMiniGameAnswerState,
  onPatch: (patch: Partial<TMiniGameAnswerState>) => void,
  canInteract: boolean,
) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const defaultSeed = useMemo(() => hashSeed(ids.join("|")), [ids]);

  const order = useMemo(() => {
    if (state.order?.length) return state.order;
    const seed = state.layoutSeed ?? defaultSeed;
    return shuffle ? shuffleWithSeed(ids, seed) : ids;
  }, [defaultSeed, ids, shuffle, state.layoutSeed, state.order]);

  useEffect(() => {
    if (!canInteract || !items.length) return;
    if (state.order?.length && state.layoutSeed != null) return;
    onPatch({
      layoutSeed: state.layoutSeed ?? defaultSeed,
      order,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canInteract, defaultSeed, items.length]);

  return order;
}

const FlashCardsOne: FC<Omit<TProps, "layout">> = ({
  items,
  shuffle,
  canInteract,
  state,
  onPatch,
}) => {
  const order = useSharedOrder(items, shuffle, state, onPatch, canInteract);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const known = new Set(state.knownIds || []);
  const remaining = order.filter((id) => !known.has(id));
  const index = Math.min(
    Math.max(0, state.cardIndex || 0),
    Math.max(0, remaining.length - 1),
  );
  const currentId = remaining[index];
  const current = currentId ? byId.get(currentId) : undefined;
  const flipped = !!state.flipped;
  const frontText = String(current?.term || "");
  const backText = String(current?.definition || "");

  const restartAll = () => {
    if (!canInteract) return;
    const seed = (state.layoutSeed || 0) + 1;
    onPatch({
      activeGame: "flash-cards",
      knownIds: [],
      score: 0,
      total: items.length,
      completed: false,
      flipped: false,
      cardIndex: 0,
      layoutSeed: seed,
      order: shuffle ? shuffleWithSeed(items.map((i) => i.id), seed) : items.map((i) => i.id),
    });
  };

  const markKnown = (know: boolean) => {
    if (!canInteract || !current) return;
    if (know) {
      const nextKnown = Array.from(
        new Set([...(state.knownIds || []), current.id]),
      );
      onPatch({
        activeGame: "flash-cards",
        knownIds: nextKnown,
        score: nextKnown.length,
        total: items.length,
        completed: nextKnown.length >= items.length,
        flipped: false,
        cardIndex: 0,
      });
    } else {
      onPatch({
        flipped: false,
        cardIndex: remaining.length ? (index + 1) % remaining.length : 0,
      });
    }
  };

  if (!remaining.length) {
    return (
      <div className={styles.flashStage}>
        <div className={styles.score}>
          Done: {items.length}/{items.length}
        </div>
        <p className={styles.flashText}>Все карточки пройдены</p>
        {canInteract && (
          <Button color="primary" variant="flat" onPress={restartAll}>
            Начать заново
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={styles.flashStage}>
      <div className={styles.score}>
        Known: {known.size}/{items.length}
      </div>
      <div className={styles.flashScene}>
        <button
          type="button"
          className={`${styles.flashCard3d} ${
            flipped ? styles.flashCard3dFlipped : ""
          }`}
          disabled={!canInteract}
          aria-pressed={flipped}
          onClick={() => {
            if (!canInteract) return;
            onPatch({ flipped: !flipped });
          }}
        >
          <div className={`${styles.flashFace} ${styles.flashFaceFront}`}>
            <div className={styles.flashText}>{frontText || "\u00A0"}</div>
            <div className={styles.flashHint}>Нажмите, чтобы перевернуть</div>
          </div>
          <div className={`${styles.flashFace} ${styles.flashFaceBack}`}>
            <div className={styles.flashText}>{backText || "\u00A0"}</div>
            <div className={styles.flashHint}>Нажмите, чтобы перевернуть</div>
          </div>
        </button>
      </div>
      <div className={styles.flashActions}>
        <Button
          variant="bordered"
          isDisabled={!canInteract}
          onPress={() => markKnown(false)}
        >
          Again
        </Button>
        <Button
          color="primary"
          isDisabled={!canInteract}
          onPress={() => markKnown(true)}
        >
          Next
        </Button>
        <Button variant="light" isDisabled={!canInteract} onPress={restartAll}>
          Начать заново
        </Button>
      </div>
    </div>
  );
};

const FlashCardsAll: FC<Omit<TProps, "layout">> = ({
  items,
  shuffle,
  canInteract,
  state,
  onPatch,
}) => {
  const order = useSharedOrder(items, shuffle, state, onPatch, canInteract);
  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const flippedIds = new Set(state.flippedIds || []);

  const restartAll = () => {
    if (!canInteract) return;
    const seed = (state.layoutSeed || 0) + 1;
    onPatch({
      activeGame: "flash-cards",
      knownIds: [],
      flippedIds: [],
      score: 0,
      total: items.length,
      completed: false,
      layoutSeed: seed,
      order: shuffle ? shuffleWithSeed(items.map((i) => i.id), seed) : items.map((i) => i.id),
    });
  };

  const toggleFlip = (id: string) => {
    if (!canInteract) return;
    const next = new Set(flippedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    const viewed = Array.from(new Set([...(state.knownIds || []), id]));
    onPatch({
      activeGame: "flash-cards",
      flippedIds: Array.from(next),
      knownIds: viewed,
      score: viewed.length,
      total: items.length,
      completed: viewed.length >= items.length,
    });
  };

  return (
    <div className={styles.flashStage}>
      <div className={styles.score}>Cards: {items.length}</div>
      <div className={styles.flashAllGrid}>
        {order.map((id) => {
          const item = byId.get(id);
          if (!item) return null;
          const flipped = flippedIds.has(id);
          return (
            <div key={id} className={styles.flashAllScene}>
              <button
                type="button"
                className={`${styles.flashAllCard3d} ${
                  flipped ? styles.flashAllCard3dFlipped : ""
                }`}
                disabled={!canInteract}
                aria-pressed={flipped}
                onClick={() => toggleFlip(id)}
              >
                <div
                  className={`${styles.flashAllFace} ${styles.flashAllFaceFront}`}
                >
                  <div className={styles.flashAllText}>
                    {String(item.term || "") || "\u00A0"}
                  </div>
                </div>
                <div
                  className={`${styles.flashAllFace} ${styles.flashAllFaceBack}`}
                >
                  <div className={styles.flashAllText}>
                    {String(item.definition || "") || "\u00A0"}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {canInteract && (
        <div className={styles.flashActions}>
          <Button color="primary" variant="flat" onPress={restartAll}>
            Начать заново
          </Button>
        </div>
      )}
    </div>
  );
};
