"use client";

import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Tab,
  Tabs,
  Textarea,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { fetchGet } from "@/api";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import type { EventFormValues, ScheduleEvent } from "../types";
import { colorForStudent, eventStudentIds } from "./eventUi";
import { formatMoney } from "../utils/calendar";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";

type StudentOption = { id: number; name?: string };
type LessonOption = { id: number; title?: string; user_id?: number };

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  readOnly?: boolean;
  event?: ScheduleEvent | null;
  defaults?: Partial<EventFormValues>;
  students: StudentOption[];
  lessons: LessonOption[];
  defaultEmail?: string;
  onSave: (payload: Record<string, unknown>, editingId?: number) => Promise<void>;
  onDelete?: (id: number, scope: string) => Promise<void>;
  onEmail?: (id: number, email: string) => Promise<void>;
  onRecordPayment?: (planId: number) => Promise<void>;
};

const emptyForm = (defaults?: Partial<EventFormValues>): EventFormValues => ({
  student_ids: defaults?.student_ids ?? [],
  title: defaults?.title ?? "",
  date: defaults?.date ?? dayjs().format("YYYY-MM-DD"),
  start_time: defaults?.start_time ?? "10:00",
  end_time: defaults?.end_time ?? "11:00",
  location_type: defaults?.location_type ?? "lesson",
  lesson_source: defaults?.lesson_source ?? "mine",
  lesson_id: defaults?.lesson_id ?? "",
  location_text: defaults?.location_text ?? "",
  notes: defaults?.notes ?? "",
  recurrence: defaults?.recurrence ?? "",
});

export const EventModal = ({
  isOpen,
  onClose,
  readOnly,
  event,
  defaults,
  students,
  lessons,
  defaultEmail,
  onSave,
  onDelete,
  onEmail,
  onRecordPayment,
}: TProps) => {
  const isPayment = event?.type === "payment";
  const isEdit = Boolean(event && !isPayment && typeof event.id === "number");
  const [form, setForm] = useState<EventFormValues>(emptyForm(defaults));
  const [email, setEmail] = useState(defaultEmail || "");
  const [scope, setScope] = useState<"this" | "this_and_future">("this");
  const [busy, setBusy] = useState(false);
  const [fetchedLessonTitle, setFetchedLessonTitle] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (event && event.type === "lesson") {
      const ids = eventStudentIds(event);
      const lesson = lessons.find((l) => l.id === event.lesson_id);
      setForm({
        student_ids: ids,
        title: event.title || "",
        date: dayjs(event.starts_at).format("YYYY-MM-DD"),
        start_time: dayjs(event.starts_at).format("HH:mm"),
        end_time: dayjs(event.ends_at).format("HH:mm"),
        location_type: event.location_type || "lesson",
        lesson_source: Number(lesson?.user_id) === 1 ? "2easy" : "mine",
        lesson_id: event.lesson_id || "",
        location_text: event.location_text || "",
        notes: event.notes || "",
        recurrence: "",
      });
    } else {
      setForm(emptyForm(defaults));
    }
    setEmail(defaultEmail || "");
    setScope("this");
    setFetchedLessonTitle("");
  }, [isOpen, event, defaults, defaultEmail, lessons]);

  const filteredLessons = useMemo(() => {
    if (form.lesson_source === "2easy") {
      return lessons.filter((l) => Number(l.user_id) === 1);
    }
    return lessons.filter((l) => Number(l.user_id) !== 1);
  }, [lessons, form.lesson_source]);

  const title = useMemo(() => {
    if (isPayment) {
      return event?.is_overdue
        ? i18n.t("schedule.paymentOverdue")
        : i18n.t("schedule.paymentMarker");
    }
    if (readOnly) return i18n.t("schedule.lessonDetails");
    return isEdit
      ? i18n.t("schedule.editLesson")
      : i18n.t("schedule.newLesson");
  }, [isPayment, readOnly, isEdit]);

  const lessonId = event?.lesson_id || form.lesson_id || null;
  const lessonTitle = useMemo(() => {
    if (fetchedLessonTitle) return fetchedLessonTitle;
    if (event?.lesson_title && !/^Урок\s*#\d+$/i.test(event.lesson_title)) {
      return event.lesson_title;
    }
    if (lessonId) {
      const found = lessons.find((l) => l.id === Number(lessonId));
      if (found?.title) return found.title;
    }
    return "";
  }, [event?.lesson_title, lessonId, lessons, fetchedLessonTitle]);

  useEffect(() => {
    if (!isOpen || !lessonId || lessonTitle) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchGet({
          path: `/lesson?id=${lessonId}`,
          isSecure: true,
        });
        const json = await res?.json();
        const t = String(json?.lesson?.title || "").trim();
        if (!cancelled && t) setFetchedLessonTitle(t);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, lessonId, lessonTitle]);

  const toggleStudent = (id: number) => {
    setForm((f) => {
      const has = f.student_ids.includes(id);
      return {
        ...f,
        student_ids: has
          ? f.student_ids.filter((x) => x !== id)
          : [...f.student_ids, id],
      };
    });
  };

  const handleSave = async () => {
    if (
      !form.student_ids.length ||
      !form.date ||
      !form.start_time ||
      !form.end_time
    ) {
      toast(i18n.t("schedule.fillRequired"), { type: "warning" });
      return;
    }
    if (form.location_type === "lesson" && !form.lesson_id) {
      toast(i18n.t("schedule.pickLesson"), { type: "warning" });
      return;
    }
    setBusy(true);
    try {
      const starts_at = dayjs(
        `${form.date}T${form.start_time}`,
      ).toISOString();
      const ends_at = dayjs(`${form.date}T${form.end_time}`).toISOString();
      await onSave(
        {
          student_ids: form.student_ids,
          student_id: form.student_ids[0],
          title: form.title || i18n.t("schedule.defaultLessonTitle"),
          starts_at,
          ends_at,
          location_type: form.location_type,
          lesson_id:
            form.location_type === "lesson"
              ? Number(form.lesson_id) || null
              : null,
          location_text:
            form.location_type === "text" ? form.location_text : null,
          notes: form.notes || null,
          recurrence: !isEdit && form.recurrence ? form.recurrence : null,
          scope: isEdit ? scope : undefined,
        },
        isEdit ? Number(event!.id) : undefined,
      );
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!event || typeof event.id !== "number" || !onDelete) return;
    setBusy(true);
    try {
      await onDelete(event.id, scope);
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const handleEmail = async () => {
    if (!event || typeof event.id !== "number" || !onEmail) return;
    if (!email.trim()) {
      toast(i18n.t("schedule.emailRequired"), { type: "warning" });
      return;
    }
    setBusy(true);
    try {
      await onEmail(event.id, email.trim());
      toast(i18n.t("schedule.emailSent"), { type: "success" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      scrollBehavior="inside"
      placement="center"
      classNames={{
        wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
        base: "mx-2 sm:mx-0 max-h-[min(90dvh,calc(100dvh-var(--site-header-h)-16px))] lg:max-h-[90vh]",
        header: "border-b border-[#e8e8ed] text-[17px] font-semibold",
        footer: "border-t border-[#e8e8ed]",
      }}
    >
      <ModalContent>
        <ModalHeader>{title}</ModalHeader>
        <ModalBody className="gap-4 py-4">
          {isPayment ? (
            <div className="space-y-3 text-sm">
              {event?.is_overdue ? (
                <div className="rounded-xl bg-[#FF3B30]/10 px-3 py-2 text-[#FF3B30]">
                  <div className="font-semibold">
                    <T k="schedule.paymentOverdue" />
                  </div>
                  <div className="text-xs opacity-90">
                    <T k="schedule.askForPayment" />
                  </div>
                </div>
              ) : null}
              <p>
                <T k="schedule.student" />:{" "}
                <b>{event?.student_name || event?.student_id}</b>
              </p>
              <p>
                <T k="schedule.amount" />:{" "}
                <b>
                  {formatMoney(
                    Number(event?.amount || 0),
                    event?.currency || "RUB",
                  )}
                </b>
              </p>
              <p>
                <T k="schedule.paymentDueDate" />:{" "}
                <b>
                  {dayjs(event?.due_date || event?.starts_at).format(
                    "DD.MM.YYYY",
                  )}
                </b>
              </p>
              {!readOnly && event?.plan_id && onRecordPayment && (
                <Button
                  color={event?.is_overdue ? "danger" : "primary"}
                  isLoading={busy}
                  onPress={async () => {
                    setBusy(true);
                    try {
                      await onRecordPayment(event.plan_id!);
                      onClose();
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <T k="schedule.markPaid" />
                </Button>
              )}
            </div>
          ) : readOnly ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
                  <T k="schedule.title" />
                </div>
                <div className="mt-1 text-[17px] font-semibold text-[#1d1d1f]">
                  {form.title || i18n.t("schedule.defaultLessonTitle")}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
                  <T k="schedule.date" />
                </div>
                <div className="mt-1 text-[15px] text-[#1d1d1f]">
                  {dayjs(form.date).format("D MMMM YYYY, dddd")}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
                  <T k="schedule.time" />
                </div>
                <div className="mt-1 text-[15px] text-[#1d1d1f]">
                  {form.start_time} – {form.end_time}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-[#86868b]">
                  <T k="schedule.location" />
                </div>
                <div className="mt-1 text-[15px] text-[#1d1d1f]">
                  {form.location_type === "lesson" && lessonId ? (
                    <Link
                      href={`/lessons/${lessonId}`}
                      className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
                    >
                      {lessonTitle || "…"}
                    </Link>
                  ) : form.location_type === "lesson" ? (
                    lessonTitle || "—"
                  ) : (
                    form.location_text || "—"
                  )}
                </div>
              </div>
              {typeof event?.id === "number" && onEmail && (
                <div className="flex flex-col gap-2 rounded-xl bg-[#f5f5f7] p-3">
                  <Input
                    label={i18n.t("schedule.emailTo")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    color="primary"
                    variant="flat"
                    isLoading={busy}
                    onPress={handleEmail}
                  >
                    <T k="schedule.sendToMyCalendar" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Input
                label={i18n.t("schedule.title")}
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />

              <div className="rounded-xl border border-[#e8e8ed] p-3">
                <div className="mb-2 text-sm font-medium text-[#1d1d1f]">
                  <T k="schedule.students" />
                  <span className="ml-1 text-xs font-normal text-[#86868b]">
                    <T k="schedule.studentsMultiHint" />
                  </span>
                </div>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                  {students.map((s) => {
                    const selected = form.student_ids.includes(s.id);
                    const color = colorForStudent(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleStudent(s.id)}
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                          selected
                            ? "border-transparent text-white"
                            : "border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
                        }`}
                        style={
                          selected ? { backgroundColor: color } : undefined
                        }
                      >
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: selected ? "#fff" : color,
                          }}
                        />
                        {s.name || `#${s.id}`}
                      </button>
                    );
                  })}
                </div>
                {!!form.student_ids.length && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {form.student_ids.map((id) => {
                      const s = students.find((x) => x.id === id);
                      return (
                        <Chip
                          key={id}
                          size="sm"
                          variant="flat"
                          onClose={() => toggleStudent(id)}
                          style={{
                            backgroundColor: `${colorForStudent(id)}22`,
                            color: colorForStudent(id),
                          }}
                        >
                          {s?.name || `#${id}`}
                        </Chip>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Input
                  type="date"
                  label={i18n.t("schedule.date")}
                  value={form.date}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, date: e.target.value }))
                  }
                />
                <Input
                  type="time"
                  label={i18n.t("schedule.start")}
                  value={form.start_time}
                  onChange={(e) => {
                    const start_time = e.target.value;
                    const end_time = start_time
                      ? dayjs(`2000-01-01T${start_time}`)
                          .add(1, "hour")
                          .format("HH:mm")
                      : form.end_time;
                    setForm((f) => ({ ...f, start_time, end_time }));
                  }}
                />
                <Input
                  type="time"
                  label={i18n.t("schedule.end")}
                  value={form.end_time}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, end_time: e.target.value }))
                  }
                />
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-[#1d1d1f]">
                  <T k="schedule.placeType" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["lesson", "schedule.placeLesson"],
                      ["text", "schedule.placeText"],
                    ] as const
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          location_type: key,
                          lesson_id: "",
                          location_text: "",
                        }))
                      }
                      className={`rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                        form.location_type === key
                          ? "border-[#007AFF] bg-[#eef5ff] text-[#007AFF]"
                          : "border-[#d2d2d7] bg-white text-[#1d1d1f] hover:bg-[#f5f5f7]"
                      }`}
                    >
                      <T k={label} />
                    </button>
                  ))}
                </div>
              </div>

              {form.location_type === "lesson" ? (
                <div className="rounded-xl border border-[#e8e8ed] p-3">
                  <div className="mb-2 text-sm font-medium text-[#1d1d1f]">
                    <T k="schedule.lessonSource" />
                  </div>
                  <Tabs
                    selectedKey={form.lesson_source}
                    onSelectionChange={(key) =>
                      setForm((f) => ({
                        ...f,
                        lesson_source: key === "2easy" ? "2easy" : "mine",
                        lesson_id: "",
                      }))
                    }
                    size="sm"
                    className="mb-3"
                  >
                    <Tab
                      key="mine"
                      title={i18n.t("schedule.lessonSourceMine")}
                    />
                    <Tab
                      key="2easy"
                      title={i18n.t("schedule.lessonSource2easy")}
                    />
                  </Tabs>
                  <Select
                    label={i18n.t("schedule.lesson")}
                    selectedKeys={
                      form.lesson_id ? [String(form.lesson_id)] : []
                    }
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lesson_id: e.target.value
                          ? Number(e.target.value)
                          : "",
                      }))
                    }
                  >
                    {filteredLessons.map((l) => (
                      <SelectItem key={String(l.id)} value={String(l.id)}>
                        {l.title || `#${l.id}`}
                      </SelectItem>
                    ))}
                  </Select>
                  {!filteredLessons.length && (
                    <p className="mt-2 text-xs text-[#86868b]">
                      <T k="schedule.noLessonsInSource" />
                    </p>
                  )}
                </div>
              ) : (
                <Input
                  label={i18n.t("schedule.location")}
                  placeholder="Zoom / адрес"
                  value={form.location_text}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, location_text: e.target.value }))
                  }
                />
              )}

              <Textarea
                label={i18n.t("schedule.notes")}
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
              {!isEdit && (
                <Select
                  label={i18n.t("schedule.repeat")}
                  selectedKeys={[form.recurrence || "none"]}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      recurrence:
                        e.target.value === "none"
                          ? ""
                          : (e.target.value as "daily" | "weekly"),
                    }))
                  }
                >
                  <SelectItem key="none" value="none">
                    {i18n.t("schedule.repeatNone")}
                  </SelectItem>
                  <SelectItem key="daily" value="daily">
                    {i18n.t("schedule.repeatDaily")}
                  </SelectItem>
                  <SelectItem key="weekly" value="weekly">
                    {i18n.t("schedule.repeatWeekly")}
                  </SelectItem>
                </Select>
              )}
              {isEdit && event?.series_id && (
                <Select
                  label={i18n.t("schedule.seriesScope")}
                  selectedKeys={[scope]}
                  onChange={(e) =>
                    setScope(
                      (e.target.value as "this" | "this_and_future") || "this",
                    )
                  }
                >
                  <SelectItem key="this" value="this">
                    {i18n.t("schedule.scopeThis")}
                  </SelectItem>
                  <SelectItem key="this_and_future" value="this_and_future">
                    {i18n.t("schedule.scopeFuture")}
                  </SelectItem>
                </Select>
              )}
              {isEdit && onEmail && (
                <div className="flex flex-col gap-2 rounded-lg bg-[#f5f5f7] p-3">
                  <Input
                    label={i18n.t("schedule.emailTo")}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <Button
                    variant="flat"
                    isLoading={busy}
                    onPress={handleEmail}
                  >
                    <T k="schedule.sendToMyCalendar" />
                  </Button>
                </div>
              )}
            </>
          )}
        </ModalBody>
        {!isPayment && !readOnly && (
          <ModalFooter className="justify-between">
            <div>
              {isEdit && onDelete && (
                <Button
                  color="danger"
                  variant="light"
                  isLoading={busy}
                  onPress={handleDelete}
                >
                  <T k="schedule.delete" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="light" onPress={onClose}>
                <T k="schedule.cancel" />
              </Button>
              <Button color="primary" isLoading={busy} onPress={handleSave}>
                <T k="schedule.save" />
              </Button>
            </div>
          </ModalFooter>
        )}
        {(isPayment || readOnly) && (
          <ModalFooter>
            <Button variant="light" onPress={onClose}>
              <T k="schedule.close" />
            </Button>
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  );
};
