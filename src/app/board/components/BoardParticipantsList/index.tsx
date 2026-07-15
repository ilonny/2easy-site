"use client";

import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { FC } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { TBoardCursor } from "../../types";
import { getBoardCursorColor } from "../../utils/boardTeacherCursor";
import styles from "./styles.module.css";

const MAX_VISIBLE_AVATARS = 4;

type TProps = {
  api: ExcalidrawImperativeAPI | null;
  cursors: TBoardCursor[];
};

export const BoardParticipantsList: FC<TProps> = ({ api, cursors }) => {
  if (!api || !cursors.length) {
    return null;
  }

  const focusCursor = (cursor: TBoardCursor) => {
    const appState = api.getAppState();
    const zoom = appState.zoom.value;
    api.updateScene({
      appState: {
        scrollX: appState.width / 2 / zoom - cursor.x,
        scrollY: appState.height / 2 / zoom - cursor.y,
      },
      captureUpdate: CaptureUpdateAction.NEVER,
    });
  };

  const visible = cursors.slice(0, MAX_VISIBLE_AVATARS);
  const overflow = cursors.slice(MAX_VISIBLE_AVATARS);

  return (
    <div className={styles.wrap}>
      {visible.map((cursor) => (
        <ResponsiveTooltip key={cursor.id} content={cursor.username}>
          <button
            type="button"
            className={styles.avatar}
            style={{ backgroundColor: getBoardCursorColor(cursor.isStudent) }}
            aria-label={cursor.username}
            onClick={() => focusCursor(cursor)}
          >
            {cursor.username
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word.charAt(0))
              .join("")}
          </button>
        </ResponsiveTooltip>
      ))}
      {overflow.length ? (
        <Popover placement="bottom-end" offset={8}>
          <PopoverTrigger>
            <button
              type="button"
              className={`${styles.avatar} ${styles.more}`}
              aria-label={`+${overflow.length}`}
            >
              +{overflow.length}
            </button>
          </PopoverTrigger>
          <PopoverContent className={styles.popover}>
            <div className={styles.overflowList}>
              {overflow.map((cursor) => (
                <button
                  key={cursor.id}
                  type="button"
                  className={styles.overflowItem}
                  onClick={() => focusCursor(cursor)}
                >
                  <span
                    className={styles.dot}
                    style={{
                      backgroundColor: getBoardCursorColor(cursor.isStudent),
                    }}
                  />
                  <span className={styles.overflowName}>{cursor.username}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
};
