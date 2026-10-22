"use client";

import { Button, Checkbox, Input } from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { checkResponse, fetchGet, fetchPut } from "@/api";
import { toast } from "react-toastify";
import { DOW_ORDER, SchoolWorkingDay } from "../types";

type Interval = { start: string; end: string };

type DayRow = {
  enabled: boolean;
  intervals: Interval[];
};

type TProps = {
  schoolId: number;
  userId: number;
  title?: string;
  compact?: boolean;
};

const defaultInterval = (): Interval => ({ start: "09:00", end: "18:00" });

const emptyWeek = (): Record<number, DayRow> => {
  const map: Record<number, DayRow> = {};
  for (const dow of DOW_ORDER) {
    map[dow] = { enabled: false, intervals: [defaultInterval()] };
  }
  return map;
};

const hoursToWeek = (hours: SchoolWorkingDay[]): Record<number, DayRow> => {
  const map = emptyWeek();
  const byDow = new Map<number, Interval[]>();
  for (const h of hours) {
    const list = byDow.get(h.dow) || [];
    list.push({ start: h.start, end: h.end });
    byDow.set(h.dow, list);
  }
  for (const [dow, intervals] of byDow) {
    intervals.sort((a, b) => a.start.localeCompare(b.start));
    map[dow] = {
      enabled: true,
      intervals: intervals.length ? intervals : [defaultInterval()],
    };
  }
  return map;
};

const intervalsOverlapOrInvalid = (intervals: Interval[]) => {
  const sorted = [...intervals].sort((a, b) => a.start.localeCompare(b.start));
  for (let i = 0; i < sorted.length; i++) {
    const cur = sorted[i];
    if (!cur.start || !cur.end || cur.start >= cur.end) return true;
    if (i > 0 && cur.start < sorted[i - 1].end) return true;
  }
  return false;
};

export const WorkingHoursEditor: FC<TProps> = ({
  schoolId,
  userId,
  title,
  compact,
}) => {
  const [week, setWeek] = useState<Record<number, DayRow>>(emptyWeek);
  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/members/${userId}/hours`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
      });
      const data = await res.json();
      if (data?.success) {
        setWeek(hoursToWeek(data.hours || []));
        setCanEdit(!!data.can_edit);
      } else {
        checkResponse(data);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const setDay = (dow: number, patch: Partial<DayRow>) => {
    setWeek((prev) => ({
      ...prev,
      [dow]: { ...prev[dow], ...patch },
    }));
  };

  const setIntervalAt = (
    dow: number,
    index: number,
    patch: Partial<Interval>,
  ) => {
    setWeek((prev) => {
      const day = prev[dow];
      const intervals = day.intervals.map((it, i) =>
        i === index ? { ...it, ...patch } : it,
      );
      return { ...prev, [dow]: { ...day, intervals } };
    });
  };

  const addInterval = (dow: number) => {
    setWeek((prev) => {
      const day = prev[dow];
      const last = day.intervals[day.intervals.length - 1];
      const nextStart = last?.end && last.end < "23:00" ? last.end : "14:00";
      const nextEnd =
        nextStart < "18:00"
          ? "18:00"
          : nextStart < "21:00"
            ? "21:00"
            : "23:00";
      return {
        ...prev,
        [dow]: {
          ...day,
          enabled: true,
          intervals: [...day.intervals, { start: nextStart, end: nextEnd }],
        },
      };
    });
  };

  const removeInterval = (dow: number, index: number) => {
    setWeek((prev) => {
      const day = prev[dow];
      const intervals = day.intervals.filter((_, i) => i !== index);
      if (!intervals.length) {
        return {
          ...prev,
          [dow]: { enabled: false, intervals: [defaultInterval()] },
        };
      }
      return { ...prev, [dow]: { ...day, intervals } };
    });
  };

  const save = async () => {
    const hours: SchoolWorkingDay[] = [];
    for (const dow of DOW_ORDER) {
      const row = week[dow];
      if (!row?.enabled) continue;
      if (intervalsOverlapOrInvalid(row.intervals)) {
        toast(i18n.t("school.hoursInvalidDay"), { type: "error" });
        return;
      }
      for (const it of row.intervals) {
        hours.push({ dow, start: it.start, end: it.end });
      }
    }
    setSaving(true);
    try {
      const res = await fetchPut({
        path: `/school/${schoolId}/members/${userId}/hours`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
        data: { hours },
      });
      const data = await res.json();
      if (data?.success) {
        toast(i18n.t("school.hoursSaved"), { type: "success" });
        setWeek(hoursToWeek(data.hours || hours));
        window.dispatchEvent(
          new CustomEvent("schedule-events-invalidated", {
            detail: { schoolId, teacherUserId: userId },
          }),
        );
      } else {
        checkResponse(data);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-brand-grayFont">
        <T k="school.loading" />
      </p>
    );
  }

  return (
    <div className={compact ? "flex flex-col gap-3" : "flex flex-col gap-4"}>
      {title ? (
        <h3 className="text-base font-bold tracking-brand text-brand-black">
          {title}
        </h3>
      ) : (
        <h3 className="text-base font-bold tracking-brand text-brand-black">
          <T k="school.workingHoursTitle" />
        </h3>
      )}
      <p className="text-sm text-brand-grayFont">
        <T k="school.workingHoursHint" />
      </p>
      <div className="flex flex-col gap-3">
        {DOW_ORDER.map((dow) => {
          const row = week[dow];
          return (
            <div
              key={dow}
              className="flex flex-col gap-2 rounded-[12px] bg-brand-gray/40 px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Checkbox
                  isSelected={row.enabled}
                  isDisabled={!canEdit}
                  onValueChange={(v) =>
                    setDay(dow, {
                      enabled: v,
                      intervals: row.intervals.length
                        ? row.intervals
                        : [defaultInterval()],
                    })
                  }
                >
                  <T k={`school.dow.${dow}`} />
                </Checkbox>
                {canEdit && row.enabled ? (
                  <Button
                    size="sm"
                    variant="light"
                    onPress={() => addInterval(dow)}
                  >
                    <T k="school.addInterval" />
                  </Button>
                ) : null}
              </div>
              {row.enabled
                ? row.intervals.map((it, index) => (
                    <div
                      key={`${dow}-${index}`}
                      className="flex flex-wrap items-center gap-2 pl-1"
                    >
                      <Input
                        type="time"
                        size="sm"
                        className="w-[120px]"
                        value={it.start}
                        isDisabled={!canEdit}
                        onChange={(e) =>
                          setIntervalAt(dow, index, {
                            start: e.target.value,
                          })
                        }
                      />
                      <span className="text-brand-grayFont">—</span>
                      <Input
                        type="time"
                        size="sm"
                        className="w-[120px]"
                        value={it.end}
                        isDisabled={!canEdit}
                        onChange={(e) =>
                          setIntervalAt(dow, index, { end: e.target.value })
                        }
                      />
                      {canEdit && row.intervals.length > 1 ? (
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => removeInterval(dow, index)}
                        >
                          <T k="school.removeInterval" />
                        </Button>
                      ) : null}
                    </div>
                  ))
                : null}
            </div>
          );
        })}
      </div>
      {canEdit ? (
        <Button
          className={brandPrimaryBtnClassName}
          isLoading={saving}
          onPress={save}
        >
          <T k="school.saveHours" />
        </Button>
      ) : (
        <p className="text-xs text-brand-grayFont">
          <T k="school.hoursReadOnly" />
        </p>
      )}
    </div>
  );
};
