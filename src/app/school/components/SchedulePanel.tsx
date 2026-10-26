"use client";

import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Spinner } from "@nextui-org/react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import Link from "next/link";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { checkResponse, fetchGet } from "@/api";
import { SearchableSelect } from "@/components/SearchableSelect";
import { useScheduleEvents } from "@/app/schedule/hooks/useScheduleEvents";
import { useTeacherAvailability } from "@/app/schedule/hooks/useTeacherAvailability";
import { CalendarToolbar } from "@/app/schedule/components/CalendarToolbar";
import { MonthView } from "@/app/schedule/components/MonthView";
import { WeekView } from "@/app/schedule/components/WeekView";
import { DayView } from "@/app/schedule/components/DayView";
import { EventModal } from "@/app/schedule/components/EventModal";
import type { ScheduleEvent, ScheduleView } from "@/app/schedule/types";
import { rangeForView } from "@/app/schedule/utils/calendar";
import { isPlaceholderStudentName } from "@/app/schedule/components/eventUi";
import scheduleStyles from "@/app/schedule/styles.module.css";
import type { SchoolMember } from "../types";

dayjs.extend(isoWeek);
dayjs.locale("ru");

type TProps = {
  schoolId: number;
  members: SchoolMember[];
  timezone?: string;
  /** Roles with staff: see all teachers + filter. Plain teacher: own only. */
  canFilterTeachers: boolean;
};

const TEACHING_ROLES = new Set([
  "teacher",
  "head_teacher",
  "methodist",
  "academic_director",
  "super_admin",
]);

export const SchedulePanel: FC<TProps> = ({
  schoolId,
  members,
  timezone,
  canFilterTeachers,
}) => {
  const { profile } = useContext(AuthContext);
  const selfUserId = Number(profile?.id) || null;
  const [view, setView] = useState<ScheduleView>("week");
  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [teacherFilter, setTeacherFilter] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );

  const workspace = useMemo(
    () => ({ workspaceScope: "school" as const, schoolId }),
    [schoolId],
  );
  const { events, loading, loadEvents } = useScheduleEvents(workspace);
  const { availability, loadAvailability } =
    useTeacherAvailability(workspace);
  const [schoolStudents, setSchoolStudents] = useState<
    Array<{ id: number; name?: string; email?: string }>
  >([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchGet({
          path: `/school/${schoolId}/students`,
          isSecure: true,
          workspaceScope: "school",
          schoolId,
        });
        const data = await res.json();
        if (data?.success) {
          setSchoolStudents(data.students || []);
        } else {
          checkResponse(data);
        }
      } catch {
        setSchoolStudents([]);
      }
    })();
  }, [schoolId]);

  const teachers = useMemo(
    () =>
      members
        .filter(
          (m) =>
            m.status === "active" &&
            (m.roles || []).some((r) => TEACHING_ROLES.has(r)),
        )
        .sort((a, b) =>
          (a.user?.name || a.user?.login || "").localeCompare(
            b.user?.name || b.user?.login || "",
          ),
        ),
    [members],
  );

  // Default / repair selection: prefer a real teacher, not the first name in the list.
  useEffect(() => {
    if (!canFilterTeachers) return;
    if (!teachers.length) {
      if (teacherFilter) setTeacherFilter("");
      return;
    }
    const stillValid = teachers.some(
      (t) => String(t.user_id) === teacherFilter,
    );
    if (stillValid) return;
    const preferred =
      teachers.find((t) => (t.roles || []).includes("teacher")) ||
      teachers.find((t) => !(t.roles || []).includes("super_admin")) ||
      teachers[0];
    setTeacherFilter(String(preferred.user_id));
  }, [canFilterTeachers, teachers, teacherFilter]);

  const teacherById = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of members) {
      const label =
        [m.user?.name, m.user?.surname].filter(Boolean).join(" ") ||
        m.user?.login ||
        String(m.user_id);
      map.set(m.user_id, label);
    }
    return map;
  }, [members]);

  const studentNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of schoolStudents) {
      const id = Number(s.id);
      const name =
        String(s.name || "").trim() || String(s.email || "").trim();
      if (id > 0 && name && !isPlaceholderStudentName(name)) {
        map.set(id, name);
      }
    }
    for (const e of events) {
      const ids =
        Array.isArray(e.student_ids) && e.student_ids.length
          ? e.student_ids
          : e.student_id
            ? [e.student_id]
            : [];
      const names = e.student_names?.length
        ? e.student_names
        : e.student_name
          ? [e.student_name]
          : [];
      ids.forEach((id, i) => {
        if (map.has(Number(id))) return;
        const n = String(names[i] || "").trim();
        if (id > 0 && n && !isPlaceholderStudentName(n)) {
          map.set(Number(id), n);
        }
      });
    }
    return map;
  }, [schoolStudents, events]);

  const availabilityTeacherId = useMemo(() => {
    if (canFilterTeachers) {
      const tid = Number(teacherFilter);
      return Number.isFinite(tid) && tid > 0 ? tid : null;
    }
    return selfUserId && selfUserId > 0 ? selfUserId : null;
  }, [canFilterTeachers, teacherFilter, selfUserId]);

  const refreshRange = useCallback(async () => {
    const { from, to } = rangeForView(cursor, view);
    if (canFilterTeachers) {
      if (!availabilityTeacherId) return;
      await Promise.all([
        loadEvents(from, to, { teacherUserId: availabilityTeacherId }),
        loadAvailability(from, to, availabilityTeacherId),
      ]);
      return;
    }
    await Promise.all([
      loadEvents(from, to),
      availabilityTeacherId
        ? loadAvailability(from, to, availabilityTeacherId)
        : Promise.resolve(),
    ]);
  }, [
    cursor,
    view,
    loadEvents,
    loadAvailability,
    canFilterTeachers,
    availabilityTeacherId,
  ]);

  useEffect(() => {
    void refreshRange();
  }, [refreshRange, schoolId]);

  useEffect(() => {
    const onInvalidate = () => {
      void refreshRange();
    };
    window.addEventListener("schedule-events-invalidated", onInvalidate);
    return () =>
      window.removeEventListener("schedule-events-invalidated", onInvalidate);
  }, [refreshRange]);

  useEffect(() => {
    if (!availabilityTeacherId) return;
    const { from, to } = rangeForView(cursor, view);
    void loadAvailability(from, to, availabilityTeacherId);
  }, [availabilityTeacherId, cursor, view, loadAvailability]);

  const titleLabel = useMemo(() => {
    if (view === "month") return cursor.format("MMMM YYYY");
    if (view === "week") {
      const start = cursor.startOf("isoWeek");
      const end = cursor.endOf("isoWeek");
      return `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`;
    }
    return cursor.format("D MMMM YYYY");
  }, [cursor, view]);

  const shiftUnit =
    view === "month" ? "month" : view === "week" ? "week" : "day";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">
            <T k="school.scheduleTitle" />
          </h2>
          <p className="text-sm text-brand-grayFont">
            {canFilterTeachers ? (
              teacherFilter ? (
                <T
                  k="school.scheduleHintSelected"
                  values={{
                    name:
                      teacherById.get(Number(teacherFilter)) ||
                      i18n.t("school.scheduleFilterTeacher"),
                  }}
                />
              ) : (
                <T k="school.scheduleHintFiltered" />
              )
            ) : (
              <T k="school.scheduleHintOwn" />
            )}
          </p>
        </div>
        {canFilterTeachers && (
          <SearchableSelect
            label={<T k="school.scheduleFilterTeacher" />}
            placeholder={i18n.t("school.searchTeacher")}
            className="max-w-[280px]"
            selectedId={teacherFilter || null}
            onSelect={(id) => {
              if (id) setTeacherFilter(id);
            }}
            items={teachers.map((m) => ({
              id: String(m.user_id),
              label:
                [m.user?.name, m.user?.surname].filter(Boolean).join(" ") ||
                m.user?.login ||
                String(m.user_id),
              description: m.user?.login,
            }))}
          />
        )}
      </div>

      <div
        className={`${scheduleStyles.shell} !h-[min(72dvh,760px)] min-h-[520px] !gap-3`}
      >
        <section className={scheduleStyles.calendarPane}>
          <CalendarToolbar
            cursor={cursor}
            view={view}
            title={titleLabel}
            onViewChange={setView}
            onToday={() => setCursor(dayjs())}
            onPrev={() => setCursor((c) => c.subtract(1, shiftUnit))}
            onNext={() => setCursor((c) => c.add(1, shiftUnit))}
          />
          <div className={`${scheduleStyles.viewBody} min-h-[420px]`}>
            {loading && !events.length ? (
              <div className="flex h-full items-center justify-center py-16">
                <Spinner color="primary" />
              </div>
            ) : view === "month" ? (
              <MonthView
                cursor={cursor}
                events={events}
                detailed
                nameById={studentNameById}
                teacherById={teacherById}
                showTeacher={false}
                onDayClick={(day) => {
                  setCursor(day);
                  setView("day");
                }}
                onEventClick={setSelectedEvent}
              />
            ) : view === "week" ? (
              <WeekView
                cursor={cursor}
                events={events}
                detailed
                nameById={studentNameById}
                teacherById={teacherById}
                showTeacher={false}
                availability={availability}
                onSlotClick={(day) => {
                  setCursor(day);
                  setView("day");
                }}
                onEventClick={setSelectedEvent}
              />
            ) : (
              <DayView
                cursor={cursor}
                events={events}
                detailed
                nameById={studentNameById}
                teacherById={teacherById}
                showTeacher={false}
                availability={availability}
                onSlotClick={() => undefined}
                onEventClick={setSelectedEvent}
              />
            )}
          </div>
        </section>
      </div>

      <p className="text-sm text-brand-grayFont">
        <Link
          href="/schedule"
          className="text-brand-primary underline-offset-2 hover:underline"
        >
          <T k="school.scheduleOpenFull" />
        </Link>
      </p>

      <EventModal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        readOnly
        event={selectedEvent}
        defaults={{}}
        timeZone={timezone}
        students={schoolStudents}
        lessons={[]}
        defaultEmail=""
        onSave={async () => undefined}
        onDelete={async () => undefined}
        onEmail={async () => undefined}
      />
    </div>
  );
};
