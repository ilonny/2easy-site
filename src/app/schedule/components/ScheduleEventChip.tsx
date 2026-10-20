"use client";

import dayjs from "dayjs";
import type { ScheduleEvent } from "../types";
import { backgroundForColors, colorsForEvent } from "../types";
import { eventChipText } from "./eventUi";

type TProps = {
  event: ScheduleEvent;
  compact?: boolean;
  detailed?: boolean;
  nameById?: Map<number, string>;
  teacherById?: Map<number, string>;
  showTeacher?: boolean;
  onClick?: (event: ScheduleEvent) => void;
};

export const ScheduleEventChip = ({
  event,
  compact,
  detailed,
  nameById,
  teacherById,
  showTeacher,
  onClick,
}: TProps) => {
  const colors = colorsForEvent(event);
  const time = dayjs(event.starts_at).format("HH:mm");
  const { primary, secondary, titleAttr } = eventChipText(event, {
    detailed,
    time,
    nameById,
    teacherById,
    showTeacher,
  });

  const overdue = event.type === "payment" && event.is_overdue;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(event);
      }}
      className={`w-full truncate rounded-[5px] px-1 text-left text-[11px] leading-tight text-white ${
        compact ? "py-0.5" : "py-1"
      } ${overdue ? "ring-1 ring-white/70" : ""}`}
      style={{ background: backgroundForColors(colors) }}
      title={titleAttr}
    >
      {compact ? (
        <span className="block truncate">
          {primary}
          {detailed && secondary ? ` · ${secondary}` : ""}
        </span>
      ) : (
        <>
          <div className="truncate font-semibold">{primary}</div>
          {detailed && secondary ? (
            <div className="truncate opacity-90">{secondary}</div>
          ) : null}
        </>
      )}
    </button>
  );
};
