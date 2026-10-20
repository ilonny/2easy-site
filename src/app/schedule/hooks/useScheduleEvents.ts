import { checkResponse, fetchDelete, fetchGet, fetchPatch, fetchPostJson } from "@/api";
import { useCallback, useState } from "react";
import type { ScheduleEvent } from "../types";

const isMissingTitle = (title?: string | null) => {
  const t = String(title || "").trim();
  return !t || /^Урок\s*#\d+$/i.test(t);
};

const enrichLessonTitles = async (events: ScheduleEvent[]) => {
  const missingIds = [
    ...new Set(
      events
        .filter(
          (e) =>
            e.type !== "payment" &&
            Number(e.lesson_id) > 0 &&
            isMissingTitle(e.lesson_title),
        )
        .map((e) => Number(e.lesson_id)),
    ),
  ];
  if (!missingIds.length) return events;

  // One catalog fetch instead of N× GET /lesson?id=
  const titles = new Map<number, string>();
  try {
    const res = await fetchGet({
      path: "/lessons",
      isSecure: true,
    });
    const json = await res?.json();
    const lessons = Array.isArray(json?.lessons) ? json.lessons : [];
    for (const row of lessons) {
      const id = Number(row?.id);
      const title = String(row?.title || "").trim();
      if (id > 0 && title) titles.set(id, title);
    }
  } catch {
    return events;
  }
  if (!titles.size) return events;

  return events.map((e) => {
    const lid = Number(e.lesson_id);
    if (!lid || !missingIds.includes(lid) || !titles.has(lid)) return e;
    const title = titles.get(lid);
    if (!title || isMissingTitle(title)) return e;
    return { ...e, lesson_title: title };
  });
};

export const useScheduleEvents = () => {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);

  const loadEvents = useCallback(
    async (
      from: string,
      to: string,
      opts?: {
        teacherUserId?: number | null;
        studentId?: number | null;
      },
    ) => {
      setLoading(true);
      try {
        const qs = new URLSearchParams({ from, to });
        const tid = Number(opts?.teacherUserId);
        if (Number.isFinite(tid) && tid > 0) {
          qs.set("teacher_user_id", String(tid));
        }
        const sid = Number(opts?.studentId);
        if (Number.isFinite(sid) && sid > 0) {
          qs.set("student_id", String(sid));
        }
        const res = await fetchGet({
          path: `/schedule/events?${qs.toString()}`,
          isSecure: true,
        });
        const json = await res?.json();
        checkResponse(json);
        if (json?.success) {
          const list = (json.events || []) as ScheduleEvent[];
          const enriched = await enrichLessonTitles(list);
          setEvents(enriched);
        }
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createEvent = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetchPostJson({
      path: "/schedule/events",
      isSecure: true,
      data,
    });
    const json = await res?.json();
    checkResponse(json);
    return json;
  }, []);

  const updateEvent = useCallback(
    async (id: number, data: Record<string, unknown>) => {
      const res = await fetchPatch({
        path: `/schedule/events/${id}`,
        isSecure: true,
        data,
      });
      const json = await res?.json();
      checkResponse(json);
      return json;
    },
    [],
  );

  const deleteEvent = useCallback(async (id: number, scope: string) => {
    const res = await fetchDelete({
      path: `/schedule/events/${id}?scope=${encodeURIComponent(scope)}`,
      isSecure: true,
    });
    const json = await res?.json();
    checkResponse(json);
    return json;
  }, []);

  const emailEvent = useCallback(async (id: number, email: string) => {
    const res = await fetchPostJson({
      path: `/schedule/events/${id}/email`,
      isSecure: true,
      data: { email },
    });
    const json = await res?.json();
    checkResponse(json);
    return json;
  }, []);

  return {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    emailEvent,
  };
};
