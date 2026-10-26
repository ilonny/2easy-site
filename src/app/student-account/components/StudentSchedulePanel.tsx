"use client";

import { FC, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Button, Spinner } from "@nextui-org/react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import { T } from "@/i18n/T";
import { checkResponse, fetchGet } from "@/api";
import { AuthContext } from "@/auth";
import { useTeacherPlan } from "@/app/subscription/helpers";
import { brandPrimaryBtnClassName } from "@/components/brandUi";
import { useScheduleEvents } from "@/app/schedule/hooks/useScheduleEvents";
import { CalendarToolbar } from "@/app/schedule/components/CalendarToolbar";
import { MonthView } from "@/app/schedule/components/MonthView";
import { WeekView } from "@/app/schedule/components/WeekView";
import { DayView } from "@/app/schedule/components/DayView";
import { EventModal } from "@/app/schedule/components/EventModal";
import type { EventFormValues, ScheduleEvent, ScheduleView } from "@/app/schedule/types";
import { rangeForView } from "@/app/schedule/utils/calendar";
import scheduleStyles from "@/app/schedule/styles.module.css";

dayjs.extend(isoWeek);
dayjs.locale("ru");

type StudentInfo = {
  id: number;
  name?: string;
  email?: string;
  user_id?: string | number;
  school_id?: number | null;
};

type TProps = {
  studentId: number;
  student: StudentInfo;
  /** Teacher or school staff with access — can create/edit/delete */
  canEdit: boolean;
};

export const StudentSchedulePanel: FC<TProps> = ({
  studentId,
  student,
  canEdit,
}) => {
  const { profile } = useContext(AuthContext);
  const { hasSchool, loading: planLoading } = useTeacherPlan();
  const studentSchoolId =
    !planLoading && hasSchool ? Number(student.school_id) || 0 : 0;
  const [view, setView] = useState<ScheduleView>("week");
  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );
  const [defaults, setDefaults] = useState<Partial<EventFormValues>>({});
  const [schoolTimeZone, setSchoolTimeZone] = useState<string | undefined>();
  const [lessons, setLessons] = useState<
    Array<{ id: number; title?: string; user_id?: number }>
  >([]);

  const {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    emailEvent,
  } = useScheduleEvents(
    studentSchoolId
      ? { workspaceScope: "school", schoolId: studentSchoolId }
      : undefined,
  );

  const teacherUserId = Number(student.user_id) || null;
  const myUserId = Number(profile?.id) || null;
  /** Only when editing on behalf of another school teacher */
  const delegateTeacherId =
    teacherUserId &&
    myUserId &&
    teacherUserId > 0 &&
    myUserId > 0 &&
    teacherUserId !== myUserId
      ? teacherUserId
      : null;

  useEffect(() => {
    const schoolId = studentSchoolId;
    if (!canEdit || !schoolId) {
      setSchoolTimeZone(undefined);
      return;
    }
    let cancelled = false;
    void (async () => {
      const res = await fetchGet({
        path: `/school/${schoolId}/settings`,
        isSecure: true,
        schoolId,
      });
      const json = await res?.json();
      if (!cancelled && json?.success) {
        setSchoolTimeZone(json.settings?.timezone || undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canEdit, studentSchoolId]);

  const refreshRange = useCallback(async () => {
    const { from, to } = rangeForView(cursor, view);
    await loadEvents(from, to, {
      studentId,
    });
  }, [cursor, view, loadEvents, studentId]);

  useEffect(() => {
    void refreshRange();
  }, [refreshRange]);

  useEffect(() => {
    const onInvalidate = () => {
      void refreshRange();
    };
    window.addEventListener("schedule-events-invalidated", onInvalidate);
    return () =>
      window.removeEventListener("schedule-events-invalidated", onInvalidate);
  }, [refreshRange]);

  useEffect(() => {
    if (!canEdit) return;
    (async () => {
      const res = await fetchGet({
        path: "/lessons",
        isSecure: true,
        workspaceScope: studentSchoolId ? "school" : undefined,
        schoolId: studentSchoolId || undefined,
        actingTeacherUserId: delegateTeacherId,
      });
      const json = await res?.json();
      checkResponse(json);
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.lessons)
          ? json.lessons
          : [];
      setLessons(
        list
          .filter((l: { id?: number }) => l?.id)
          .map((l: { id: number; title?: string; user_id?: number }) => ({
            id: l.id,
            title: l.title,
            user_id: l.user_id,
          })),
      );
    })();
  }, [canEdit, delegateTeacherId, studentSchoolId]);

  const studentNameById = useMemo(() => {
    const map = new Map<number, string>();
    const name =
      String(student.name || "").trim() ||
      String(student.email || "").trim();
    if (name) map.set(studentId, name);
    return map;
  }, [student, studentId]);

  const studentsForModal = useMemo(
    () => [
      {
        id: studentId,
        name: student.name,
        email: student.email,
      },
    ],
    [studentId, student.name, student.email],
  );

  const openCreate = (day: Dayjs, hour?: number) => {
    if (!canEdit) return;
    const startHour = hour ?? Math.max(dayjs().hour(), 9);
    setSelectedEvent(null);
    setDefaults({
      date: day.format("YYYY-MM-DD"),
      start_time: `${String(startHour).padStart(2, "0")}:00`,
      end_time: `${String(startHour + 1).padStart(2, "0")}:00`,
      student_ids: [studentId],
      location_type: "lesson",
      lesson_source: "mine",
    });
    setModalOpen(true);
  };

  const openEvent = (event: ScheduleEvent) => {
    if (event.type === "payment") return;
    setSelectedEvent(event);
    setDefaults({});
    setModalOpen(true);
  };

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
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">
            <T k="students.scheduleTitle" />
          </h2>
          <p className="text-sm text-brand-grayFont">
            {canEdit ? (
              <T k="students.scheduleHintEdit" />
            ) : (
              <T k="students.scheduleHintView" />
            )}
          </p>
        </div>
        {canEdit ? (
          <Button
            className={brandPrimaryBtnClassName}
            size="sm"
            onPress={() => openCreate(cursor)}
          >
            <T k="students.addLesson" />
          </Button>
        ) : null}
      </div>

      <div className={`${scheduleStyles.shell} !h-[min(72dvh,760px)] min-h-[520px] !gap-3`}>
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
                showTeacher={false}
                onDayClick={(day) => {
                  setCursor(day);
                  setView("day");
                }}
                onEventClick={openEvent}
              />
            ) : view === "week" ? (
              <WeekView
                cursor={cursor}
                events={events}
                detailed
                nameById={studentNameById}
                showTeacher={false}
                onSlotClick={(day, hour) => {
                  if (canEdit) openCreate(day, hour);
                }}
                onEventClick={openEvent}
              />
            ) : (
              <DayView
                cursor={cursor}
                events={events}
                detailed
                nameById={studentNameById}
                showTeacher={false}
                onSlotClick={(day, hour) => {
                  if (canEdit) openCreate(day, hour);
                }}
                onEventClick={openEvent}
              />
            )}
          </div>
        </section>
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        readOnly={!canEdit}
        event={selectedEvent}
        defaults={defaults}
        timeZone={schoolTimeZone}
        students={studentsForModal}
        lessons={lessons}
        defaultEmail={student.email || ""}
        onSave={async (payload, editingId) => {
          if (!canEdit) return;
          const data: Record<string, unknown> = {
            ...payload,
            student_ids: [studentId],
          };
          // Pre-school / own students: omit teacher_user_id (server uses actor).
          // School staff cabinet: pass only when acting as another teacher.
          if (delegateTeacherId) {
            data.teacher_user_id = delegateTeacherId;
          }
          if (editingId) {
            await updateEvent(editingId, data);
          } else {
            await createEvent(data);
          }
          await refreshRange();
        }}
        onDelete={async (id, scope) => {
          if (!canEdit) return;
          await deleteEvent(id, scope);
          await refreshRange();
        }}
        onEmail={async (id, email) => {
          await emailEvent(id, email);
        }}
      />
    </div>
  );
};
