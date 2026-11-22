"use client";

import { Button } from "@nextui-org/react";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TMiniGameAnswerState,
  TMiniGameItem,
  TMiniGamePatch,
} from "../../../editor/MiniGame/types";
import { hashSeed, shuffleWithSeed } from "../miniGameLiveUtils";
import styles from "../styles.module.css";

type TProps = {
  items: TMiniGameItem[];
  shuffle?: boolean;
  layout?: "one" | "all";
  canInteract: boolean;
  state: TMiniGameAnswerState;
  onPatch: (patch: TMiniGamePatch) => void;
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
) {
  const ids = useMemo(() => items.map((i) => i.id), [items]);
  const defaultSeed = useMemo(() => hashSeed(ids.join("|")), [ids]);

  return useMemo(() => {
    // Without shuffle always follow editor order (ignore stale synced order).
    if (!shuffle) return ids;
    if (state.order?.length) {
      const known = new Set(ids);
      const kept = state.order.filter((id) => known.has(id));
      const missing = ids.filter((id) => !kept.includes(id));
      return kept.length ? [...kept, ...missing] : ids;
    }
    const seed = state.layoutSeed ?? defaultSeed;
    return shuffleWithSeed(ids, seed);
  }, [defaultSeed, ids, shuffle, state.layoutSeed, state.order]);
}

const FlashCardsOne: FC<Omit<TProps, "layout">> = ({
  items,
  shuffle,
  canInteract,
  state,
  onPatch,
}) => {
  const { t } = useTranslation();
  const order = useSharedOrder(items, shuffle, state);
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
  const frontText = String(current?.term || "").trim();
  const backText = String(current?.definition || "").trim();
  const hasBack = !!backText;

  const [drawTick, setDrawTick] = useState(0);
  const prevCardId = useRef<string | undefined>(undefined);
  const [drawing, setDrawing] = useState(false);

  useEffect(() => {
    if (!currentId) return;
    if (prevCardId.current === undefined) {
      prevCardId.current = currentId;
      return;
    }
    if (prevCardId.current === currentId) return;
    prevCardId.current = currentId;
    setDrawing(true);
    setDrawTick((n) => n + 1);
    const timer = window.setTimeout(() => setDrawing(false), 480);
    return () => window.clearTimeout(timer);
  }, [currentId]);

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

  const goNext = () => {
    if (!canInteract || !current || drawing) return;
    onPatch((prev) => {
      const nextKnown = Array.from(
        new Set([...(prev.knownIds || []), current.id]),
      );
      const nextRemaining = order.filter((id) => !nextKnown.includes(id));
      // After removing current, the next card lands at the same index
      // (or wrap to 0 past the end).
      const nextIndex =
        nextRemaining.length === 0
          ? 0
          : index >= nextRemaining.length
            ? 0
            : index;
      return {
        ...prev,
        activeGame: "flash-cards",
        knownIds: nextKnown,
        score: nextKnown.length,
        total: items.length,
        completed: nextRemaining.length === 0,
        flipped: false,
        cardIndex: nextIndex,
      };
    });
  };

  const goBack = () => {
    if (!canInteract || drawing) return;
    const knownIds = state.knownIds || [];
    if (!knownIds.length) return;
    const prevId = knownIds[knownIds.length - 1];
    const nextKnown = knownIds.slice(0, -1);
    const nextRemaining = order.filter((id) => !nextKnown.includes(id));
    const nextIndex = Math.max(0, nextRemaining.indexOf(prevId));
    onPatch({
      activeGame: "flash-cards",
      knownIds: nextKnown,
      score: nextKnown.length,
      total: items.length,
      completed: false,
      flipped: false,
      cardIndex: nextIndex,
    });
  };

  if (!remaining.length) {
    return (
      <div className={styles.flashStage}>
        <p className={styles.flashText}>{t("editor.miniGameAllPassed")}</p>
        {canInteract && (
          <Button color="primary" variant="flat" onPress={restartAll}>
            {t("editor.miniGameRestart")}
          </Button>
        )}
      </div>
    );
  }

  const deckBehind = Math.max(0, remaining.length - 1);
  const deckLayers = Math.min(deckBehind, 4);
  const canGoNext = canInteract && !!current && !drawing;
  const canGoBack = canInteract && known.size > 0 && !drawing;
  const canDraw = canGoNext && deckBehind > 0;

  return (
    <div className={styles.flashStage}>
      <div className={styles.flashDeckRow}>
        <button
          type="button"
          className={`${styles.flashDeck} ${
            deckBehind === 0 ? styles.flashDeckEmpty : ""
          } ${canDraw ? styles.flashDeckClickable : ""}`}
          disabled={!canDraw}
          aria-label={t("editor.miniGameNext", { defaultValue: "Далее" })}
          onClick={goNext}
        >
          {Array.from({ length: Math.max(deckLayers, 1) }).map((_, i) => (
            <div
              key={i}
              className={styles.flashDeckLayer}
              style={{
                transform: `translate(${i * 3}px, ${i * 3}px)`,
                zIndex: i + 1,
              }}
            />
          ))}
        </button>
        <div className={styles.flashScene}>
          <div
            key={`${currentId}-${drawTick}`}
            className={`${styles.flashCardMotion} ${
              drawing ? styles.flashCardDrawIn : ""
            }`}
          >
            <button
              type="button"
              className={`${styles.flashCard3d} ${
                flipped ? styles.flashCard3dFlipped : ""
              } ${!canInteract ? styles.flashCard3dDimmed : ""}`}
              disabled={!canInteract || drawing}
              aria-pressed={flipped}
              onClick={() => {
                if (!canInteract || drawing) return;
                onPatch((prev) => ({ ...prev, flipped: !prev.flipped }));
              }}
            >
              <div className={`${styles.flashFace} ${styles.flashFaceFront}`}>
                {frontText ? (
                  <>
                    <div className={styles.flashText}>{frontText}</div>
                    <div className={styles.flashHint}>
                      {t("editor.miniGameFlipHint")}
                    </div>
                  </>
                ) : (
                  <div className={styles.flashFaceEmpty} aria-hidden />
                )}
              </div>
              <div
                className={`${styles.flashFace} ${styles.flashFaceBack} ${
                  !hasBack ? styles.flashFaceBlank : ""
                }`}
              >
                {hasBack ? (
                  <>
                    <div className={styles.flashText}>{backText}</div>
                    <div className={styles.flashHint}>
                      {t("editor.miniGameFlipHint")}
                    </div>
                  </>
                ) : (
                  <div className={styles.flashFaceEmpty} aria-hidden />
                )}
              </div>
            </button>
          </div>
        </div>
      </div>
      <div className={styles.flashActions}>
        <Button
          variant="bordered"
          isDisabled={!canGoBack}
          onPress={goBack}
        >
          {t("editor.miniGameAgain")}
        </Button>
        <Button
          color="primary"
          isDisabled={!canGoNext}
          onPress={goNext}
        >
          {t("editor.miniGameNext")}
        </Button>
        <Button
          variant="light"
          isDisabled={!canInteract || drawing}
          onPress={restartAll}
        >
          {t("editor.miniGameRestart")}
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
  const { t } = useTranslation();
  const order = useSharedOrder(items, shuffle, state);
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
    onPatch((prev) => {
      const next = new Set(prev.flippedIds || []);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      const viewed = Array.from(new Set([...(prev.knownIds || []), id]));
      return {
        ...prev,
        activeGame: "flash-cards",
        flippedIds: Array.from(next),
        knownIds: viewed,
        score: viewed.length,
        total: items.length,
        completed: viewed.length >= items.length,
      };
    });
  };

  return (
    <div className={styles.flashStage}>
      <div className={styles.score}>
        {t("editor.miniGameCardCount", { total: items.length })}
      </div>
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
                  className={`${styles.flashAllFace} ${styles.flashAllFaceBack} ${
                    !String(item.definition || "").trim()
                      ? styles.flashFaceBlank
                      : ""
                  }`}
                >
                  {String(item.definition || "").trim() ? (
                    <div className={styles.flashAllText}>
                      {String(item.definition || "")}
                    </div>
                  ) : (
                    <div className={styles.flashFaceEmpty} aria-hidden />
                  )}
                </div>
              </button>
            </div>
          );
        })}
      </div>
      {canInteract && (
        <div className={styles.flashActions}>
          <Button color="primary" variant="flat" onPress={restartAll}>
            {t("editor.miniGameRestart")}
          </Button>
        </div>
      )}
    </div>
  );
};
