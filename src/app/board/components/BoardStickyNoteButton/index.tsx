"use client";

import { insertStickyNote } from "@/app/board/utils/boardStickyNote";
import { StickyNoteIcon } from "@/components/icons/StickyNoteIcon";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import i18n from "@/i18n/config";
import { FC } from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

type TProps = {
  api: ExcalidrawImperativeAPI | null;
  container: HTMLElement | null;
};

export const BoardStickyNoteButton: FC<TProps> = ({ api, container }) => {
  if (!container) {
    return null;
  }

  return createPortal(
    <>
      <span className={styles.divider} aria-hidden="true" />
      <button
        type="button"
        className={styles.stickyTool}
        title={i18n.t("boards.addStickyNote", { lng: "en" })}
        aria-label={i18n.t("boards.addStickyNote", { lng: "en" })}
        disabled={!api}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          if (api) {
            insertStickyNote(api);
          }
        }}
      >
        <div className="ToolIcon__icon">
          <StickyNoteIcon />
        </div>
      </button>
    </>,
    container,
  );
};
