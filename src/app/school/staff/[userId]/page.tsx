"use client";

import { CatalogPageShell } from "@/components";
import { withLogin } from "@/auth/hooks/withLogin";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  checkResponse,
  fetchGet,
  fetchPostJson,
} from "@/api";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
} from "@nextui-org/react";
import dayjs, { Dayjs } from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "dayjs/locale/ru";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useSchool } from "../../hooks/useSchool";
import { WorkingHoursEditor } from "../../components/WorkingHoursEditor";
import {
  brandModalClassNames,
  brandPrimaryBtnClassName,
} from "@/components/brandUi";
import { useScheduleEvents } from "@/app/schedule/hooks/useScheduleEvents";
import { CalendarToolbar } from "@/app/schedule/components/CalendarToolbar";
import { MonthView } from "@/app/schedule/components/MonthView";
import { WeekView } from "@/app/schedule/components/WeekView";
import { DayView } from "@/app/schedule/components/DayView";
import { EventModal } from "@/app/schedule/components/EventModal";
import type { EventFormValues, ScheduleEvent, ScheduleView } from "@/app/schedule/types";
import { rangeForView } from "@/app/schedule/utils/calendar";
import scheduleStyles from "@/app/schedule/styles.module.css";
import { RoleBadges } from "../../components/RoleBadges";
import { SchoolMaterialsPanel } from "../../components/SchoolMaterialsPanel";
import { useSchoolBack } from "../../hooks/useSchoolBack";

dayjs.extend(isoWeek);
dayjs.locale("ru");

type CabinetStudent = {
  id: number;
  name?: string;
  email?: string;
  tag?: string;
};

type CabinetData = {
  self?: boolean;
  member: {
    id: number;
    user_id: number;
    roles: string[];
    user: {
      id: number;
      login: string;
      name?: string;
      surname?: string;
      phone?: string;
    } | null;
  };
  students: CabinetStudent[];
  stats: {
    students_count: number;
    events_upcoming: number;
    payments_this_month: number;
    payments_amount_this_month: number;
  };
};

export default function StaffCabinetPage() {
  withLogin();
  const params = useParams();
  const goBack = useSchoolBack("/school?tab=members");
  const userId = Number(params?.userId);
  const { loading: schoolLoading, school } = useSchool();
  const [cabinet, setCabinet] = useState<CabinetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [view, setView] = useState<ScheduleView>("week");
  const [cursor, setCursor] = useState<Dayjs>(dayjs());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(
    null,
  );
  const [defaults, setDefaults] = useState<Partial<EventFormValues>>({});
  const [lessons, setLessons] = useState<
    Array<{ id: number; title?: string; user_id?: number }>
  >([]);

  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [studentTag, setStudentTag] = useState("");
  const [savingStudent, setSavingStudent] = useState(false);

  const {
    events,
    loading: eventsLoading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    emailEvent,
  } = useScheduleEvents(
    school?.id
      ? { workspaceScope: "school", schoolId: school.id }
      : undefined,
  );

  const loadCabinet = useCallback(async () => {
    if (!school?.id || !userId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGet({
        path: `/school/${school.id}/members/by-user/${userId}/cabinet`,
        isSecure: true,
        schoolId: school.id,
      });
      const data = await res.json();
      if (data?.success) {
        setCabinet(data.cabinet || null);
      } else {
        setError(data?.message || i18n.t("school.cabinetForbidden"));
        checkResponse(data);
      }
    } catch {
      setError(i18n.t("school.cabinetForbidden"));
    } finally {
      setLoading(false);
    }
  }, [school?.id, userId]);

  useEffect(() => {
    void loadCabinet();
  }, [loadCabinet]);

  const refreshRange = useCallback(async () => {
    if (!userId) return;
    const { from, to } = rangeForView(cursor, view);
    await loadEvents(from, to, { teacherUserId: userId });
  }, [cursor, view, loadEvents, userId]);

  useEffect(() => {
    if (!cabinet) return;
    void refreshRange();
  }, [cabinet, refreshRange]);

  useEffect(() => {
    if (!cabinet) return;
    (async () => {
      const res = await fetchGet({
        path: "/lessons",
        isSecure: true,
        workspaceScope: "school",
        schoolId: school?.id,
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
  }, [cabinet, school?.id]);

  const students = cabinet?.students || [];

  const studentNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of students) {
      const name = String(s.name || "").trim() || String(s.email || "").trim();
      if (s.id > 0 && name) map.set(s.id, name);
    }
    return map;
  }, [students]);

  const openCreate = (day: Dayjs, hour?: number) => {
    const startHour = hour ?? Math.max(dayjs().hour(), 9);
    setSelectedEvent(null);
    setDefaults({
      date: day.format("YYYY-MM-DD"),
      start_time: `${String(startHour).padStart(2, "0")}:00`,
      end_time: `${String(startHour + 1).padStart(2, "0")}:00`,
      student_ids: [],
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

  const createStudent = async () => {
    if (!school?.id || !studentName.trim()) {
      toast(i18n.t("school.studentNameRequired"), { type: "error" });
      return;
    }
    setSavingStudent(true);
    try {
      const res = await fetchPostJson({
        path: `/school/${school.id}/students`,
        isSecure: true,
        schoolId: school.id,
        data: {
          name: studentName.trim(),
          email: studentEmail.trim() || undefined,
          tag: studentTag.trim() || undefined,
          teacher_user_id: userId,
        },
      });
      const data = await res.json();
      if (data?.success) {
        toast(
          data.password
            ? i18n.t("school.studentCreatedWithPassword", {
                password: data.password,
              })
            : i18n.t("school.studentCreated"),
          { type: "success" },
        );
        setAddStudentOpen(false);
        setStudentName("");
        setStudentEmail("");
        setStudentTag("");
        await loadCabinet();
      } else {
        checkResponse(data);
      }
    } finally {
      setSavingStudent(false);
    }
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

  const displayName =
    [cabinet?.member?.user?.name, cabinet?.member?.user?.surname]
      .filter(Boolean)
      .join(" ") ||
    cabinet?.member?.user?.login ||
    String(userId);

  const rolesLabel = (cabinet?.member?.roles || [])
    .map((r) => i18n.t(`school.roles.${r}`))
    .join(", ");

  if (schoolLoading || loading) {
    return (
      <CatalogPageShell title={<T k="school.cabinetTitle" />}>
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      </CatalogPageShell>
    );
  }

  if (error || !cabinet) {
    return (
      <CatalogPageShell title={<T k="school.cabinetTitle" />}>
        <div className="mx-auto flex w-full max-w-[560px] flex-col items-center gap-4 text-center">
          <p className="text-brand-grayFont">
            {error || <T k="school.cabinetForbidden" />}
          </p>
          <Button
            onPress={goBack}
            className={brandPrimaryBtnClassName}
            variant="flat"
          >
            <T k="school.backToSchool" />
          </Button>
        </div>
      </CatalogPageShell>
    );
  }

  const visibleEvents = events.filter((e) => e.type !== "payment");

  return (
    <CatalogPageShell
      title={displayName}
      subtitle={
        <T
          k="school.cabinetSubtitle"
          values={{ roles: rolesLabel || "—" }}
        />
      }
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3">
          <Button onPress={goBack} variant="light" size="sm">
            <T k="school.backToSchool" />
          </Button>
          <RoleBadges roles={cabinet.member.roles} />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-[16px] bg-brand-gray/40 px-4 py-4 ring-1 ring-black/5">
            <p className="text-xs text-brand-grayFont">
              <T k="school.statStudentsActive" />
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {cabinet.stats.students_count}
            </p>
          </div>
          <div className="rounded-[16px] bg-brand-gray/40 px-4 py-4 ring-1 ring-black/5">
            <p className="text-xs text-brand-grayFont">
              <T k="school.cabinetEventsUpcoming" />
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {cabinet.stats.events_upcoming}
            </p>
          </div>
          <div className="rounded-[16px] bg-brand-gray/40 px-4 py-4 ring-1 ring-black/5">
            <p className="text-xs text-brand-grayFont">
              <T k="school.statPaymentsMonth" />
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {cabinet.stats.payments_this_month}
            </p>
          </div>
          <div className="rounded-[16px] bg-brand-gray/40 px-4 py-4 ring-1 ring-black/5">
            <p className="text-xs text-brand-grayFont">
              <T k="school.statPaymentsAmount" />
            </p>
            <p className="mt-1 text-2xl font-semibold">
              {Math.round(cabinet.stats.payments_amount_this_month || 0)}
            </p>
          </div>
        </div>

        {school?.id && userId ? (
          <section className="rounded-[16px] bg-white p-4 ring-1 ring-black/5 sm:p-6">
            <WorkingHoursEditor schoolId={school.id} userId={userId} />
          </section>
        ) : null}

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              <T k="school.cabinetStudents" />
            </h2>
            <Button
              className={brandPrimaryBtnClassName}
              size="sm"
              onPress={() => setAddStudentOpen(true)}
            >
              <T k="school.addStudent" />
            </Button>
          </div>
          <div className="overflow-hidden rounded-[16px] ring-1 ring-black/5">
            <table className="w-full text-left text-sm">
              <thead className="bg-brand-gray text-brand-grayFont">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    <T k="school.colName" />
                  </th>
                  <th className="px-4 py-3 font-medium">
                    <T k="school.colEmail" />
                  </th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-t border-black/5">
                    <td className="px-4 py-3">{s.name || "—"}</td>
                    <td className="px-4 py-3">{s.email || "—"}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/student-account/${s.id}?workspace=school&schoolId=${school.id}&returnTo=${encodeURIComponent(
                          `/school/staff/${userId}?returnTo=${encodeURIComponent(
                            "/school?tab=members",
                          )}`,
                        )}`}
                        className="font-medium text-brand-violet hover:underline"
                      >
                        <T k="school.openCabinet" />
                      </Link>
                    </td>
                  </tr>
                ))}
                {!students.length && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-6 text-center text-brand-grayFont"
                    >
                      <T k="school.noStudents" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">
              <T k="school.cabinetSchedule" />
            </h2>
            <Button
              className={brandPrimaryBtnClassName}
              size="sm"
              onPress={() => openCreate(dayjs())}
            >
              <T k="schedule.newLesson" />
            </Button>
          </div>

          <div
            className={`${scheduleStyles.shell} !h-auto min-h-[520px] !gap-3`}
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
                {eventsLoading ? (
                  <div className="flex h-full items-center justify-center py-16">
                    <Spinner color="primary" />
                  </div>
                ) : view === "month" ? (
                  <MonthView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed
                    nameById={studentNameById}
                    onDayClick={(day) => openCreate(day)}
                    onEventClick={openEvent}
                  />
                ) : view === "week" ? (
                  <WeekView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed
                    nameById={studentNameById}
                    onSlotClick={openCreate}
                    onEventClick={openEvent}
                  />
                ) : (
                  <DayView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed
                    nameById={studentNameById}
                    onSlotClick={openCreate}
                    onEventClick={openEvent}
                  />
                )}
              </div>
            </section>
          </div>
        </section>

        {!cabinet.self ? (
          <SchoolMaterialsPanel
            schoolId={school.id}
            teacherUserId={userId}
            canManage
            personalOnly
          />
        ) : null}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
        defaults={defaults}
        students={students}
        lessons={lessons}
        defaultEmail={cabinet.member.user?.login || ""}
        onSave={async (payload, editingId) => {
          const data = { ...payload, teacher_user_id: userId };
          if (editingId) {
            await updateEvent(editingId, data);
          } else {
            await createEvent(data);
          }
          await refreshRange();
          await loadCabinet();
        }}
        onDelete={async (id, scope) => {
          await deleteEvent(id, scope);
          await refreshRange();
          await loadCabinet();
        }}
        onEmail={async (id, email) => {
          await emailEvent(id, email);
        }}
      />

      <Modal
        size="lg"
        isOpen={addStudentOpen}
        onClose={() => setAddStudentOpen(false)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <T k="school.addStudent" />
          </ModalHeader>
          <ModalBody className="flex flex-col gap-4 pb-6">
            <Input
              label={<T k="school.studentName" />}
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentEmail" />}
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              radius="lg"
            />
            <Input
              label={<T k="school.studentTag" />}
              value={studentTag}
              onChange={(e) => setStudentTag(e.target.value)}
              radius="lg"
            />
            <Button
              className={brandPrimaryBtnClassName}
              isLoading={savingStudent}
              onPress={createStudent}
            >
              <T k="school.saveStudent" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </CatalogPageShell>
  );
}
