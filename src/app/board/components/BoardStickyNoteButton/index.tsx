"use client";

import {
  insertStickyNote,
  STICKY_NOTE_COLORS,
  type TStickyNoteColor,
} from "@/app/board/utils/boardStickyNote";
import { StickyNoteIcon } from "@/components/icons/StickyNoteIcon";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import i18n from "@/i18n/config";
import { FC, useCallback, useState } from "react";
import { createPortal } from "react-dom";
import styles from "./styles.module.css";

type TProps = {
  api: ExcalidrawImperativeAPI | null;
  container: HTMLElement | null;
};

const getStickyNoteLabel = () => i18n.t("boards.addStickyNote", { lng: "en" });

export const BoardStickyNoteButton: FC<TProps> = ({ api, container }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handlePickColor = useCallback(
    (color: TStickyNoteColor) => {
      if (!api) {
        return;
      }
      setIsOpen(false);
      // Defer until the popover unmounts so the click cannot fall through to the canvas.
      window.setTimeout(() => {
        insertStickyNote(api, color);
      }, 0);
    },
    [api],
  );

  if (!container) {
    return null;
  }

  const label = getStickyNoteLabel();

  return createPortal(
    <>
      <span className={styles.divider} aria-hidden="true" />
      <span className={styles.stickySlot}>
        <Popover
          placement="bottom"
          offset={10}
          isOpen={isOpen}
          onOpenChange={setIsOpen}
        >
          <PopoverTrigger>
            <button
              type="button"
              className={styles.stickyTool}
              title={label}
              aria-label={label}
              disabled={!api}
              onMouseDown={(event) => event.preventDefault()}
            >
              <div className="ToolIcon__icon">
                <StickyNoteIcon />
              </div>
            </button>
          </PopoverTrigger>
          <PopoverContent className={styles.colorPopover}>
            <div
              className={styles.colorGrid}
              role="listbox"
              aria-label={label}
            >
              {STICKY_NOTE_COLORS.map((color) => (
                <button
                  key={color.background}
                  type="button"
                  role="option"
                  className={styles.colorSwatch}
                  style={{
                    backgroundColor: color.background,
                    borderColor: color.stroke,
                  }}
                  aria-label={color.background}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handlePickColor(color);
                  }}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </span>
    </>,
    container,
  );
};
