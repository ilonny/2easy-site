"use client";

import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import {
  checkResponse,
  fetchDelete,
  fetchGet,
  fetchPatch,
  fetchPostMultipart,
} from "@/api";
import { toast } from "react-toastify";
import {
  DOW_ORDER,
  LESSON_DURATIONS,
  SchoolSettings,
  SchoolWorkingDay,
} from "../types";
import { timezoneOptions } from "../lib/timezones";
import { SchoolAvatarPicker } from "./SchoolAvatarPicker";

type TProps = {
  schoolId: number;
  canEdit: boolean;
  canEditAvatar?: boolean;
  avatar?: string | null;
  onSaved?: () => void;
};

const emptySettings = (): SchoolSettings => ({
  timezone: "Europe/Moscow",
  workingHours: { enabled: false, days: [] },
  defaultLessonMinutes: 60,
  languages: [],
  directions: [],
  contacts: {},
});

export const SettingsPanel: FC<TProps> = ({
  schoolId,
  canEdit,
  canEditAvatar,
  avatar,
  onSaved,
}) => {
  const [settings, setSettings] = useState<SchoolSettings>(emptySettings);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [langInput, setLangInput] = useState("");
  const [dirInput, setDirInput] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  type DayIntervals = {
    enabled: boolean;
    intervals: Array<{ start: string; end: string }>;
  };
  const emptyDayIntervals = (): Record<number, DayIntervals> => {
    const map: Record<number, DayIntervals> = {};
    for (const dow of DOW_ORDER) {
      map[dow] = {
        enabled: false,
        intervals: [{ start: "09:00", end: "18:00" }],
      };
    }
    return map;
  };
  const [dayHours, setDayHours] =
    useState<Record<number, DayIntervals>>(emptyDayIntervals);

  const applyHoursToLocal = (days: SchoolWorkingDay[]) => {
    const map = emptyDayIntervals();
    const byDow = new Map<number, Array<{ start: string; end: string }>>();
    for (const d of days) {
      const list = byDow.get(d.dow) || [];
      list.push({ start: d.start, end: d.end });
      byDow.set(d.dow, list);
    }
    for (const [dow, intervals] of byDow) {
      intervals.sort((a, b) => a.start.localeCompare(b.start));
      map[dow] = {
        enabled: true,
        intervals: intervals.length
          ? intervals
          : [{ start: "09:00", end: "18:00" }],
      };
    }
    setDayHours(map);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/settings`,
        isSecure: true,
        schoolId,
      });
      const data = await res.json();
      if (data?.success) {
        const raw = data.settings || {};
        const s: SchoolSettings = {
          ...emptySettings(),
          ...raw,
          workingHours: {
            ...emptySettings().workingHours,
            ...(raw.workingHours || {}),
          },
          languages: Array.isArray(raw.languages) ? raw.languages : [],
          directions: Array.isArray(raw.directions) ? raw.directions : [],
          contacts:
            raw.contacts && typeof raw.contacts === "object"
              ? raw.contacts
              : {},
        };
        setSettings(s);
        setName(data.name || "");
        applyHoursToLocal(s.workingHours?.days || []);
      } else {
        checkResponse(data);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  const collectDays = (): SchoolWorkingDay[] | null => {
    const days: SchoolWorkingDay[] = [];
    for (const dow of DOW_ORDER) {
      const row = dayHours[dow];
      if (!row?.enabled) continue;
      const sorted = [...row.intervals].sort((a, b) =>
        a.start.localeCompare(b.start),
      );
      for (let i = 0; i < sorted.length; i++) {
        const it = sorted[i];
        if (!it.start || !it.end || it.start >= it.end) return null;
        if (i > 0 && it.start < sorted[i - 1].end) return null;
        days.push({ dow, start: it.start, end: it.end });
      }
    }
    return days;
  };

  const save = async () => {
    if (!canEdit) return;
    const days = collectDays();
    if (days === null) {
      toast(i18n.t("school.hoursInvalidDay"), { type: "error" });
      return;
    }
    const payload: SchoolSettings = {
      ...settings,
      workingHours: {
        enabled: settings.workingHours.enabled && days.length > 0,
        days,
      },
    };
    setSaving(true);
    try {
      const res = await fetchPatch({
        path: `/school/${schoolId}/settings`,
        isSecure: true,
        schoolId,
        data: { name: name.trim() || undefined, ...payload },
      });
      const data = await res.json();
      if (data?.success) {
        if (avatarFile && canEditAvatar) {
          const formData = new FormData();
          formData.append("image", avatarFile);
          const avatarRes = await fetchPostMultipart({
            path: `/school/${schoolId}/avatar`,
            isSecure: true,
            schoolId,
            data: formData,
          });
          const avatarData = await avatarRes.json();
          if (avatarData?.success === false && avatarRes.status !== 404) {
            checkResponse(avatarData);
          } else {
            setAvatarFile(null);
          }
        }
        toast(i18n.t("school.settingsSaved"), { type: "success" });
        const saved = data.settings || payload;
        setSettings({ ...payload, ...saved });
        applyHoursToLocal(saved?.workingHours?.days || days);
        onSaved?.();
      } else {
        checkResponse(data);
      }
    } finally {
      setSaving(false);
    }
  };

  const addLang = () => {
    const v = langInput.trim();
    if (!v) return;
    if (settings.languages.includes(v)) {
      setLangInput("");
      return;
    }
    setSettings((s) => ({ ...s, languages: [...s.languages, v] }));
    setLangInput("");
  };

  const addDir = () => {
    const v = dirInput.trim();
    if (!v) return;
    if (settings.directions.includes(v)) {
      setDirInput("");
      return;
    }
    setSettings((s) => ({ ...s, directions: [...s.directions, v] }));
    setDirInput("");
  };

  if (loading) {
    return (
      <p className="text-sm text-brand-grayFont">
        <T k="school.loading" />
      </p>
    );
  }

  const zones = timezoneOptions();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-bold tracking-brand text-brand-black">
          <T k="school.settingsTitle" />
        </h2>
        <p className="mt-1 text-sm text-brand-grayFont">
          <T k="school.settingsHint" />
        </p>
      </div>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-brand-black">
          <T k="school.settingsProfile" />
        </h3>
        <Input
          label={<T k="school.nameLabel" />}
          value={name}
          isDisabled={!canEdit}
          onChange={(e) => setName(e.target.value)}
        />
        {canEditAvatar ? (
          <SchoolAvatarPicker
            name={name}
            avatar={avatar}
            file={avatarFile}
            disabled={!canEdit || saving}
            onFileChange={setAvatarFile}
            onRemove={async () => {
              const avatarRes = await fetchDelete({
                path: `/school/${schoolId}/avatar`,
                isSecure: true,
                schoolId,
              });
              const avatarData = await avatarRes.json();
              if (avatarData?.success === false && avatarRes.status !== 404) {
                checkResponse(avatarData);
                return;
              }
              onSaved?.();
            }}
          />
        ) : null}
        <Select
          label={<T k="school.timezoneLabel" />}
          selectedKeys={settings.timezone ? [settings.timezone] : []}
          isDisabled={!canEdit}
          onChange={(e) =>
            setSettings((s) => ({ ...s, timezone: e.target.value }))
          }
        >
          {zones.map((z) => (
            <SelectItem key={z} value={z}>
              {z}
            </SelectItem>
          ))}
        </Select>
        <Select
          label={<T k="school.defaultLessonDuration" />}
          selectedKeys={[String(settings.defaultLessonMinutes)]}
          isDisabled={!canEdit}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              defaultLessonMinutes: Number(e.target.value) || 60,
            }))
          }
        >
          {LESSON_DURATIONS.map((d) => (
            <SelectItem key={String(d)} value={String(d)}>
              {i18n.t("school.minutes", { n: d })}
            </SelectItem>
          ))}
        </Select>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-semibold text-brand-black">
            <T k="school.schoolHoursTitle" />
          </h3>
          <Checkbox
            isSelected={settings.workingHours.enabled}
            isDisabled={!canEdit}
            onValueChange={(v) =>
              setSettings((s) => ({
                ...s,
                workingHours: { ...s.workingHours, enabled: v },
              }))
            }
          >
            <T k="school.schoolHoursEnabled" />
          </Checkbox>
        </div>
        <p className="text-sm text-brand-grayFont">
          <T k="school.schoolHoursHint" />
        </p>
        {settings.workingHours.enabled
          ? DOW_ORDER.map((dow) => {
              const row = dayHours[dow];
              return (
                <div
                  key={dow}
                  className="flex flex-col gap-2 rounded-[12px] bg-brand-gray/40 px-3 py-2"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <Checkbox
                      isSelected={!!row?.enabled}
                      isDisabled={!canEdit}
                      onValueChange={(v) =>
                        setDayHours((prev) => ({
                          ...prev,
                          [dow]: {
                            enabled: v,
                            intervals: prev[dow]?.intervals?.length
                              ? prev[dow].intervals
                              : [{ start: "09:00", end: "18:00" }],
                          },
                        }))
                      }
                    >
                      <T k={`school.dow.${dow}`} />
                    </Checkbox>
                    {canEdit && row?.enabled ? (
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() =>
                          setDayHours((prev) => {
                            const cur = prev[dow];
                            const last =
                              cur.intervals[cur.intervals.length - 1];
                            const start =
                              last?.end && last.end < "23:00"
                                ? last.end
                                : "14:00";
                            const end =
                              start < "18:00"
                                ? "18:00"
                                : start < "21:00"
                                  ? "21:00"
                                  : "23:00";
                            return {
                              ...prev,
                              [dow]: {
                                ...cur,
                                intervals: [
                                  ...cur.intervals,
                                  { start, end },
                                ],
                              },
                            };
                          })
                        }
                      >
                        <T k="school.addInterval" />
                      </Button>
                    ) : null}
                  </div>
                  {row?.enabled
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
                              setDayHours((prev) => ({
                                ...prev,
                                [dow]: {
                                  ...prev[dow],
                                  intervals: prev[dow].intervals.map(
                                    (x, i) =>
                                      i === index
                                        ? { ...x, start: e.target.value }
                                        : x,
                                  ),
                                },
                              }))
                            }
                          />
                          <span>—</span>
                          <Input
                            type="time"
                            size="sm"
                            className="w-[120px]"
                            value={it.end}
                            isDisabled={!canEdit}
                            onChange={(e) =>
                              setDayHours((prev) => ({
                                ...prev,
                                [dow]: {
                                  ...prev[dow],
                                  intervals: prev[dow].intervals.map(
                                    (x, i) =>
                                      i === index
                                        ? { ...x, end: e.target.value }
                                        : x,
                                  ),
                                },
                              }))
                            }
                          />
                          {canEdit && row.intervals.length > 1 ? (
                            <Button
                              size="sm"
                              variant="light"
                              onPress={() =>
                                setDayHours((prev) => {
                                  const next = prev[dow].intervals.filter(
                                    (_, i) => i !== index,
                                  );
                                  return {
                                    ...prev,
                                    [dow]: next.length
                                      ? { ...prev[dow], intervals: next }
                                      : {
                                          enabled: false,
                                          intervals: [
                                            { start: "09:00", end: "18:00" },
                                          ],
                                        },
                                  };
                                })
                              }
                            >
                              <T k="school.removeInterval" />
                            </Button>
                          ) : null}
                        </div>
                      ))
                    : null}
                </div>
              );
            })
          : null}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-brand-black">
          <T k="school.languagesTitle" />
        </h3>
        <div className="flex flex-wrap gap-2">
          {settings.languages.map((l) => (
            <button
              key={l}
              type="button"
              disabled={!canEdit}
              className="rounded-full bg-brand-gray px-3 py-1 text-sm"
              onClick={() =>
                canEdit &&
                setSettings((s) => ({
                  ...s,
                  languages: s.languages.filter((x) => x !== l),
                }))
              }
            >
              {l} {canEdit ? "×" : ""}
            </button>
          ))}
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-[240px]"
              label={<T k="school.addLanguage" />}
              value={langInput}
              onChange={(e) => setLangInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLang();
                }
              }}
            />
            <Button variant="flat" onPress={addLang}>
              <T k="school.add" />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-brand-black">
          <T k="school.directionsTitle" />
        </h3>
        <p className="text-sm text-brand-grayFont">
          <T k="school.directionsHint" />
        </p>
        <div className="flex flex-wrap gap-2">
          {settings.directions.map((d) => (
            <button
              key={d}
              type="button"
              disabled={!canEdit}
              className="rounded-full bg-brand-gray px-3 py-1 text-sm"
              onClick={() =>
                canEdit &&
                setSettings((s) => ({
                  ...s,
                  directions: s.directions.filter((x) => x !== d),
                }))
              }
            >
              {d} {canEdit ? "×" : ""}
            </button>
          ))}
        </div>
        {canEdit ? (
          <div className="flex flex-wrap gap-2">
            <Input
              className="max-w-[280px]"
              label={<T k="school.addDirection" />}
              value={dirInput}
              onChange={(e) => setDirInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addDir();
                }
              }}
            />
            <Button variant="flat" onPress={addDir}>
              <T k="school.add" />
            </Button>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="font-semibold text-brand-black">
          <T k="school.contactsTitle" />
        </h3>
        <Input
          label={<T k="school.contactPhone" />}
          value={settings.contacts.phone || ""}
          isDisabled={!canEdit}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              contacts: { ...s.contacts, phone: e.target.value },
            }))
          }
        />
        <Input
          label={<T k="school.contactEmail" />}
          value={settings.contacts.email || ""}
          isDisabled={!canEdit}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              contacts: { ...s.contacts, email: e.target.value },
            }))
          }
        />
        <Input
          label={<T k="school.contactSocial" />}
          placeholder="https://…"
          value={settings.contacts.socials?.[0]?.url || ""}
          isDisabled={!canEdit}
          onChange={(e) =>
            setSettings((s) => ({
              ...s,
              contacts: {
                ...s.contacts,
                socials: e.target.value.trim()
                  ? [{ kind: "site", url: e.target.value.trim() }]
                  : [],
              },
            }))
          }
        />
      </section>

      {canEdit ? (
        <Button
          className={`${brandPrimaryBtnClassName} max-w-[220px]`}
          isLoading={saving}
          onPress={save}
        >
          <T k="school.saveSettings" />
        </Button>
      ) : (
        <p className="text-sm text-brand-grayFont">
          <T k="school.settingsReadOnly" />
        </p>
      )}
    </div>
  );
};
