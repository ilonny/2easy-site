"use client";

/* eslint-disable @next/next/no-img-element */

import { Card } from "@nextui-org/react";
import { FC, memo, useMemo } from "react";
import { useParams } from "next/navigation";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import {
  TMiniGameData,
  validItems,
} from "../../editor/MiniGame/types";
import { FlashCardsGame } from "./games/FlashCards";
import { MatchingPairsGame } from "./games/MatchingPairs";
import { SpinWheelGame } from "./games/SpinWheel";
import { HangmanGame } from "./games/Hangman";
import { WordsearchGame } from "./games/Wordsearch";
import { useMiniGameAnswers } from "./useMiniGameAnswers";
import { useMiniGameLiveSync } from "./useMiniGameLiveSync";
import styles from "./styles.module.css";

const MiniGameExViewImpl: FC<{
  data: TMiniGameData;
  isPreview?: boolean;
}> = ({ data, isPreview = false, ...rest }) => {
  const isViewMode = !!(rest as any)?.isView;
  const isPresentationMode = !!(rest as any)?.isPresentationMode;
  const activeStudentId = (rest as any)?.activeStudentId;

  const lessonId = Number(useParams()?.id || 0);
  const exId = Number(data?.id || 0);
  const liveEnabled =
    !isPreview && isViewMode && Number.isFinite(lessonId) && lessonId > 0 && exId > 0;

  const activeGame = data?.activeGame || "flash-cards";
  const items = useMemo(
    () =>
      validItems(data?.items, {
        keepEmpty: activeGame === "flash-cards",
      }),
    [data?.items, activeGame],
  );

  const live = useMiniGameLiveSync({
    lessonId,
    exId,
    enabled: liveEnabled,
  });

  const answers = useMiniGameAnswers({
    data,
    isPreview,
    isView: isViewMode,
    isPresentationMode,
    activeStudentId,
    /** When live, answers are not the source of truth. */
    disablePersist: liveEnabled,
  });

  const canInteract = liveEnabled ? true : answers.canInteract;
  const state = liveEnabled ? live.state : answers.state;
  const version = liveEnabled ? live.version : answers.version;
  const patchState = liveEnabled ? live.patchState : answers.patchState;

  const image = (data as any)?.images?.[0];

  const game = (() => {
    switch (activeGame) {
      case "matching-pairs":
        return (
          <MatchingPairsGame
            items={items}
            shuffle={data.options?.shuffle !== false}
            canInteract={canInteract}
            state={state}
            onPatch={patchState}
          />
        );
      case "spin-wheel":
        return (
          <SpinWheelGame
            items={items}
            showDefinition={!!data.options?.showDefinitionOnWheel}
            canInteract={canInteract}
            state={state}
            onPatch={patchState}
          />
        );
      case "hangman":
        return (
          <HangmanGame
            items={items}
            canInteract={canInteract}
            state={state}
            onPatch={patchState}
          />
        );
      case "wordsearch":
        return (
          <WordsearchGame
            items={items}
            canInteract={canInteract}
            state={state}
            onPatch={patchState}
          />
        );
      case "flash-cards":
      default:
        return (
          <FlashCardsGame
            items={items}
            shuffle={data.options?.shuffle !== false}
            layout={
              data.options?.flashCardsLayout === "all" ? "all" : "one"
            }
            canInteract={canInteract}
            state={state}
            onPatch={patchState}
          />
        );
    }
  })();

  return (
    <div className={`${styles.root} exercise-view-shell`}>
      <div
        className={`py-4 sm:py-5 md:py-6 w-full max-w-[900px] mx-auto exercise-view-head`}
      >
        {!!data?.title && (
          <p
            className="exercise-view-title lg:text-[34px]"
            style={{
              color: (data as any)?.titleColor || "#3F28C6",
            }}
          >
            {data.title}
          </p>
        )}
        {!!data?.subtitle && (
          <p className="exercise-view-subtitle">{data.subtitle}</p>
        )}
        {!!data?.description && (
          <p className="exercise-view-desc text-[17px] lg:text-[18px]">
            {data.description}
          </p>
        )}
      </div>

      {!!image?.dataURL && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}

      <Card className={styles.card}>
        {items.length ? (
          game
        ) : (
          <p className="text-sm text-[#6b7280]">No words yet</p>
        )}
      </Card>
      <span className="hidden" aria-hidden>
        {version}
      </span>
    </div>
  );
};

export const MiniGameExView = memo(MiniGameExViewImpl);
