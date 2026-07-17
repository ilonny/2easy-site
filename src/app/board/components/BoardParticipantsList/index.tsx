"use client";

import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { FC, ReactNode, useCallback, useMemo } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { T } from "@/i18n/T";
import { TBoardCursor, TBoardParticipant } from "../../types";
import {
  buildBoardParticipantsView,
  TBoardParticipantView,
} from "../../utils/boardParticipants";
import { getBoardCursorColor } from "../../utils/boardTeacherCursor";
import styles from "./styles.module.css";

const MAX_VISIBLE_STUDENT_AVATARS = 3;

type TProps = {
  api: ExcalidrawImperativeAPI | null;
  participants: TBoardParticipant[];
  cursors: TBoardCursor[];
  /** Teachers see everyone; students only see the teacher to follow. */
  variant?: "teacher" | "student";
};

const getInitials = (username: string) =>
  username
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("");

type TParticipantAvatarProps = {
  participant: TBoardParticipantView;
  onFocus: (participant: TBoardParticipantView) => void;
  className?: string;
  tooltip?: ReactNode;
};

const ParticipantAvatar: FC<TParticipantAvatarProps> = ({
  participant,
  onFocus,
  className,
  tooltip,
}) => {
  const canFocus = participant.x != null && participant.y != null;

  return (
    <ResponsiveTooltip content={tooltip || participant.username}>
      <button
        type="button"
        className={`${styles.avatar} ${!canFocus ? styles.avatarInactive : ""} ${className || ""}`}
        style={{
          backgroundColor: getBoardCursorColor(participant.isStudent),
        }}
        aria-label={
          typeof tooltip === "string"
            ? tooltip
            : participant.username
        }
        disabled={!canFocus}
        onClick={() => onFocus(participant)}
      >
        {getInitials(participant.username)}
      </button>
    </ResponsiveTooltip>
  );
};

type TTeacherBlockProps = {
  teacher: TBoardParticipantView;
  onFocus: (participant: TBoardParticipantView) => void;
  showLabel?: boolean;
  withDivider?: boolean;
};

const TeacherBlock: FC<TTeacherBlockProps> = ({
  teacher,
  onFocus,
  showLabel = true,
  withDivider = false,
}) => (
  <div
    className={`${styles.teacherBlock} ${withDivider ? styles.teacherBlockDivider : ""}`}
  >
    {showLabel ? (
      <span className={styles.teacherLabel}>
        <T k="boards.teacher" />
      </span>
    ) : null}
    <ParticipantAvatar
      participant={teacher}
      onFocus={onFocus}
      tooltip={<T k="boards.followTeacher" />}
    />
  </div>
);

export const BoardParticipantsList: FC<TProps> = ({
  api,
  participants,
  cursors,
  variant = "teacher",
}) => {
  const items = useMemo(
    () => buildBoardParticipantsView(participants, cursors),
    [participants, cursors],
  );

  const teacher = useMemo(
    () => items.find((item) => !item.isStudent),
    [items],
  );

  const { visibleStudents, overflowStudents } = useMemo(() => {
    const students = items.filter((item) => item.isStudent);
    return {
      visibleStudents: students.slice(0, MAX_VISIBLE_STUDENT_AVATARS),
      overflowStudents: students.slice(MAX_VISIBLE_STUDENT_AVATARS),
    };
  }, [items]);

  const focusParticipant = useCallback(
    (participant: TBoardParticipantView) => {
      if (!api || participant.x == null || participant.y == null) {
        return;
      }

      const appState = api.getAppState();
      const zoom = appState.zoom.value;
      api.updateScene({
        appState: {
          scrollX: appState.width / 2 / zoom - participant.x,
          scrollY: appState.height / 2 / zoom - participant.y,
        },
        captureUpdate: CaptureUpdateAction.NEVER,
      });
    },
    [api],
  );

  if (!api) {
    return null;
  }

  if (variant === "student") {
    if (!teacher) {
      return null;
    }

    return (
      <TeacherBlock teacher={teacher} onFocus={focusParticipant} />
    );
  }

  if (!items.length) {
    return null;
  }

  return (
    <div className={styles.wrap}>
      {teacher ? (
        <TeacherBlock
          teacher={teacher}
          onFocus={focusParticipant}
          showLabel
          withDivider={visibleStudents.length > 0 || overflowStudents.length > 0}
        />
      ) : null}
      {visibleStudents.length ? (
        <div className={styles.studentsGroup}>
          {visibleStudents.map((participant) => (
            <ParticipantAvatar
              key={participant.id}
              participant={participant}
              onFocus={focusParticipant}
            />
          ))}
        </div>
      ) : null}
      {overflowStudents.length ? (
        <Popover placement="bottom-end" offset={8}>
          <PopoverTrigger>
            <button
              type="button"
              className={`${styles.avatar} ${styles.more}`}
              aria-label={`+${overflowStudents.length}`}
            >
              +{overflowStudents.length}
            </button>
          </PopoverTrigger>
          <PopoverContent className={styles.popover}>
            <div className={styles.overflowList}>
              {overflowStudents.map((participant) => (
                <button
                  key={participant.id}
                  type="button"
                  className={styles.overflowItem}
                  disabled={participant.x == null || participant.y == null}
                  onClick={() => focusParticipant(participant)}
                >
                  <span
                    className={styles.dot}
                    style={{
                      backgroundColor: getBoardCursorColor(participant.isStudent),
                    }}
                  />
                  <span className={styles.overflowName}>{participant.username}</span>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
};
