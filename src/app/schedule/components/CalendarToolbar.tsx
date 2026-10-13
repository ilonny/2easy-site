"use client";

import type { Dayjs } from "dayjs";
import type { ScheduleView } from "../types";
import styles from "../styles.module.css";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

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
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.toolbarRight}>
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
