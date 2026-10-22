"use client";

import type { Dayjs } from "dayjs";
import type { ScheduleView } from "../types";
import styles from "../styles.module.css";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { getLocalTimeZoneLabel } from "../utils/timezone";
import { Button, Input, Popover, PopoverContent, PopoverTrigger } from "@nextui-org/react";
import { useCalendarHours } from "../hooks/useCalendarHours";
import { useState } from "react";

type TProps = {
  cursor: Dayjs;
  view: ScheduleView;
  title: string;
  onViewChange: (view: ScheduleView) => void;
  onToday: () => void;
  onPrev: () => void;
  onNext: () => void;
};

export const CalendarToolbar = ({
  view,
  title,
  onViewChange,
  onToday,
  onPrev,
  onNext,
}: TProps) => {
  const views: ScheduleView[] = ["day", "week", "month"];
  const labels: Record<ScheduleView, string> = {
    day: i18n.t("schedule.viewDay"),
    week: i18n.t("schedule.viewWeek"),
    month: i18n.t("schedule.viewMonth"),
  };
  const tzLabel = getLocalTimeZoneLabel();
  const { hours, setHours } = useCalendarHours();
  const [draftStart, setDraftStart] = useState(hours.start);
  const [draftEnd, setDraftEnd] = useState(hours.end);

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <button type="button" className={styles.todayBtn} onClick={onToday}>
          <T k="schedule.today" />
        </button>
        <button type="button" className={styles.navBtn} onClick={onPrev} aria-label="prev">
          ‹
        </button>
        <button type="button" className={styles.navBtn} onClick={onNext} aria-label="next">
          ›
        </button>
        <div className="min-w-0">
          <h2 className={styles.title}>{title}</h2>
          <p className="mt-0.5 truncate text-[11px] font-medium text-[#86868b]">
            <T k="schedule.localTimezoneHint" values={{ tz: tzLabel }} />
          </p>
        </div>
      </div>
      <div className={styles.toolbarRight}>
        <Popover
          placement="bottom-end"
          onOpenChange={(open) => {
            if (open) {
              setDraftStart(hours.start);
              setDraftEnd(hours.end);
            }
          }}
        >
          <PopoverTrigger>
            <Button size="sm" variant="flat" className="min-w-0 rounded-[10px]">
              <T
                k="schedule.visibleHours"
                values={{
                  start: `${String(hours.start).padStart(2, "0")}:00`,
                  end: `${String(hours.end).padStart(2, "0")}:00`,
                }}
              />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[260px] p-4">
            <div className="flex w-full flex-col gap-3">
              <p className="text-sm font-semibold">
                <T k="schedule.visibleHoursTitle" />
              </p>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={22}
                  size="sm"
                  label={<T k="schedule.start" />}
                  value={String(draftStart)}
                  onValueChange={(value) => setDraftStart(Number(value))}
                />
                <Input
                  type="number"
                  min={1}
                  max={24}
                  size="sm"
                  label={<T k="schedule.end" />}
                  value={String(draftEnd)}
                  onValueChange={(value) => setDraftEnd(Number(value))}
                />
              </div>
              <Button
                size="sm"
                color="primary"
                isDisabled={
                  !Number.isFinite(draftStart) ||
                  !Number.isFinite(draftEnd) ||
                  draftStart < 0 ||
                  draftEnd > 24 ||
                  draftEnd <= draftStart
                }
                onPress={() =>
                  setHours({ start: draftStart, end: draftEnd })
                }
              >
                <T k="schedule.applyVisibleHours" />
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        <div className={styles.segment} role="tablist">
          {views.map((v) => (
            <button
              key={v}
              type="button"
              role="tab"
              aria-selected={view === v}
              className={`${styles.segmentBtn} ${
                view === v ? styles.segmentBtnActive : ""
              }`}
              onClick={() => onViewChange(v)}
            >
              {labels[v]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
