"use client";

import { insertStickyNote } from "@/app/board/utils/boardStickyNote";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { StickyNoteIcon } from "@/components/icons/StickyNoteIcon";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { FC } from "react";
import styles from "./styles.module.css";

type TProps = {
  api: ExcalidrawImperativeAPI | null;
};

export const BoardStickyNoteButton: FC<TProps> = ({ api }) => {
  return (
    <div className={styles.wrap}>
      <ResponsiveTooltip content={<T k="boards.addStickyNote" />}>
        <button
          type="button"
          className={styles.toolButton}
          aria-label={i18n.t("boards.addStickyNote")}
          disabled={!api}
          onClick={() => {
            if (api) {
              insertStickyNote(api);
            }
          }}
        >
          <StickyNoteIcon className={styles.icon} />
        </button>
      </ResponsiveTooltip>
    </div>
  );
};
