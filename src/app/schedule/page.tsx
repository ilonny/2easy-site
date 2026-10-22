"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { Button, Spinner } from "@nextui-org/react";
import Link from "next/link";
import { BrandPill, CatalogPageShell } from "@/components";
import { SearchableSelect } from "@/components/SearchableSelect";
import { AuthContext } from "@/auth";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  getActiveWorkspace,
  setActiveWorkspace,
  type WorkspaceContext,
} from "@/app/school/lib/activeSchool";
import type { SchoolInfo, SchoolMember } from "@/app/school/types";
import { useScheduleEvents } from "./hooks/useScheduleEvents";
import { usePaymentPlans } from "./hooks/usePaymentPlans";
import { useTeacherAvailability } from "./hooks/useTeacherAvailability";
import { MonthView } from "./components/MonthView";
import { WeekView } from "./components/WeekView";
import { DayView } from "./components/DayView";
import { EventModal } from "./components/EventModal";
import { PaymentControlTab } from "./components/PaymentControlTab";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { StudentSidebar } from "./components/StudentSidebar";
import type {
  EventFormValues,
  ScheduleEvent,
  ScheduleView,
  SelectedScheduleRange,
} from "./types";
import { rangeKey } from "./components/availabilityUi";
import { eventStudentIds } from "./types";
import { rangeForView } from "./utils/calendar";
import styles from "./styles.module.css";

const TEACHING_ROLES = new Set([
  "teacher",
  "head_teacher",
  "methodist",
  "academic_director",
  "super_admin",
]);

dayjs.locale("ru");

const useIsMobile = () => {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);
  return mobile;
};

export default function SchedulePage() {
  withLogin();
  const { profile } = useContext(AuthContext);
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const isStudent = Boolean(profile?.isStudent);
  const isTeacher =
    !isStudent && (profile?.role_id === 1 || profile?.role_id === 2);
  const isMobile = useIsMobile();
  const teacherAllowed = !isTeacher || hasSubscription;

  useEffect(() => {
    if (isTeacher) checkSubscription();
  }, [isTeacher, checkSubscription]);

  const [tab, setTab] = useState<"calendar" | "payments">("calendar");
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
  const [filterStudentId, setFilterStudentId] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [canFilterTeachers, setCanFilterTeachers] = useState(false);
  const [schoolMembers, setSchoolMembers] = useState<SchoolMember[]>([]);
  const [schoolStudents, setSchoolStudents] = useState<
    Array<{ id: number; name?: string; email?: string }>
  >([]);
  const [personalStudents, setPersonalStudents] = useState<
    Array<{ id: number; name?: string; email?: string }>
  >([]);
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [schoolsLoaded, setSchoolsLoaded] = useState(false);
  const [workspace, setWorkspace] =
    useState<WorkspaceContext>(getActiveWorkspace);
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedRanges, setSelectedRanges] = useState<
    Map<string, SelectedScheduleRange>
  >(new Map());

  const scheduleWorkspace = useMemo(
    () =>
      isStudent
        ? undefined
        : {
            workspaceScope: workspace.scope,
            schoolId: workspace.scope === "school" ? workspace.schoolId : null,
          },
    [isStudent, workspace],
  );
  const {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    emailEvent,
  } = useScheduleEvents(scheduleWorkspace);
  const {
    plans,
    stats,
    loading: paymentsLoading,
    loadPlans,
    loadStats,
    createPlan,
    updatePlan,
    deletePlan,
    recordPayment,
    statsLoading,
  } = usePaymentPlans(scheduleWorkspace);
  const {
    availability,
    loading: availabilitySaving,
    loadAvailability,
    markInactive,
  } = useTeacherAvailability(scheduleWorkspace);

  useEffect(() => {
    if (isMobile) setView((v) => (v === "week" ? "day" : v));
  }, [isMobile]);

  const refreshRange = useCallback(async () => {
    const { from, to } = rangeForView(cursor, view);
    const tid =
      canFilterTeachers && teacherFilter !== "all"
        ? Number(teacherFilter)
        : null;
    await loadEvents(from, to, { teacherUserId: tid });
  }, [cursor, view, loadEvents, canFilterTeachers, teacherFilter]);

  useEffect(() => {
    if (!teacherAllowed && isTeacher) return;
    refreshRange();
  }, [refreshRange, teacherAllowed, isTeacher]);

  useEffect(() => {
    const onInvalidate = () => {
      void refreshRange();
    };
    window.addEventListener("schedule-events-invalidated", onInvalidate);
    return () =>
      window.removeEventListener("schedule-events-invalidated", onInvalidate);
  }, [refreshRange]);

  const availabilityTeacherId =
    canFilterTeachers && teacherFilter !== "all"
      ? Number(teacherFilter)
      : workspace.scope === "school"
        ? Number(profile?.id) || null
        : null;
  const showAvailability =
    workspace.scope === "school" &&
    (!canFilterTeachers || teacherFilter !== "all") &&
    Number.isFinite(availabilityTeacherId);

  useEffect(() => {
    if (!isTeacher || !teacherAllowed || !showAvailability) return;
    const { from, to } = rangeForView(cursor, view);
    void loadAvailability(from, to, availabilityTeacherId);
  }, [
    isTeacher,
    teacherAllowed,
    showAvailability,
    cursor,
    view,
    availabilityTeacherId,
    loadAvailability,
  ]);

  useEffect(() => {
    setSelectionMode(false);
    setSelectedRanges(new Map());
  }, [workspace, teacherFilter]);

  useEffect(() => {
    if (!isTeacher || !teacherAllowed) return;
    (async () => {
      try {
        const meRes = await fetchGet({
          path: "/school/me",
          isSecure: true,
          workspaceScope: "personal",
        });
        const me = await meRes?.json();
        setSchools(me?.success && Array.isArray(me.schools) ? me.schools : []);
      } finally {
        setSchoolsLoaded(true);
      }
    })();
  }, [isTeacher, teacherAllowed]);

  useEffect(() => {
    if (!isTeacher || !teacherAllowed || !schoolsLoaded) return;
    (async () => {
      try {
        if (workspace.scope === "personal") {
          const stuRes = await fetchGet({
            path: "/student",
            isSecure: true,
            workspaceScope: "personal",
          });
          const stu = await stuRes?.json();
          setPersonalStudents(Array.isArray(stu) ? stu : stu?.students || []);
          setCanFilterTeachers(false);
          setSchoolMembers([]);
          setSchoolStudents([]);
          setTeacherFilter("all");
          return;
        }
        const school = schools.find((s) => s.id === workspace.schoolId);
        if (!school) {
          const personal: WorkspaceContext = {
            scope: "personal",
            schoolId: null,
          };
          setActiveWorkspace(personal);
          setWorkspace(personal);
          return;
        }
        const canFilter = Boolean(school?.access?.canSeeAllSchedule);
        setCanFilterTeachers(canFilter);
        const stuRes = await fetchGet({
          path: `/school/${school.id}/students`,
          isSecure: true,
          workspaceScope: "school",
          schoolId: school.id,
        });
        const stu = await stuRes?.json();
        if (stu?.success) setSchoolStudents(stu.students || []);
        else setSchoolStudents([]);
        setPersonalStudents([]);

        if (canFilter) {
          const memRes = await fetchGet({
            path: `/school/${school.id}/members`,
            isSecure: true,
            workspaceScope: "school",
            schoolId: school.id,
          });
          const mem = await memRes?.json();
          if (mem?.success) setSchoolMembers(mem.members || []);
          else setSchoolMembers([]);
        } else {
          setSchoolMembers([]);
        }
      } catch {
        setCanFilterTeachers(false);
      }
    })();
  }, [isTeacher, teacherAllowed, schoolsLoaded, schools, workspace]);

  const schoolTeachers = useMemo(
    () =>
      schoolMembers.filter(
        (m) =>
          m.status === "active" &&
          (m.roles || []).some((r) => TEACHING_ROLES.has(r)),
      ),
    [schoolMembers],
  );

  const teacherById = useMemo(() => {
    const map = new Map<number, string>();
    for (const m of schoolMembers) {
      map.set(
        m.user_id,
        [m.user?.name, m.user?.surname].filter(Boolean).join(" ") ||
          m.user?.login ||
          String(m.user_id),
      );
    }
    return map;
  }, [schoolMembers]);

  const showTeacherOnChips =
    canFilterTeachers && teacherFilter === "all";

  useEffect(() => {
    if (!isTeacher || !teacherAllowed) return;
    (async () => {
      const res = await fetchGet({
        path: "/lessons",
        isSecure: true,
        workspaceScope: scheduleWorkspace?.workspaceScope,
        schoolId: scheduleWorkspace?.schoolId,
      });
      const json = await res?.json();
      checkResponse(json);
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.lessons)
          ? json.lessons
          : [];
      const typedList = list as Array<{
        id?: number;
        title?: string;
        user_id?: number;
      }>;
      setLessons(
        typedList
          .filter((lesson) => lesson?.id)
          .map((lesson) => ({
            id: Number(lesson.id),
            title: lesson.title,
            user_id: lesson.user_id,
          })),
      );
    })();
  }, [
    isTeacher,
    teacherAllowed,
    scheduleWorkspace?.workspaceScope,
    scheduleWorkspace?.schoolId,
  ]);

  /** Never merge personal and school rosters: the selected workspace owns the list. */
  const scheduleStudents = useMemo(() => {
    const map = new Map<
      number,
      { id: number; name?: string; email?: string }
    >();
    const add = (row: { id?: number; name?: string; email?: string }) => {
      const id = Number(row?.id);
      if (!Number.isFinite(id) || id <= 0) return;
      if (map.has(id)) return;
      map.set(id, { id, name: row.name, email: row.email });
    };
    const source = workspace.scope === "school" ? schoolStudents : personalStudents;
    for (const s of source as Array<{
      id?: number;
      name?: string;
      email?: string;
    }>) {
      add(s);
    }
    return Array.from(map.values());
  }, [workspace.scope, personalStudents, schoolStudents]);

  const studentNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const s of scheduleStudents) {
      const label =
        String(s.name || "").trim() || String(s.email || "").trim();
      if (label) map.set(s.id, label);
    }
    return map;
  }, [scheduleStudents]);

  const visibleEvents = useMemo(() => {
    if (!filterStudentId) return events;
    return events.filter((e) =>
      eventStudentIds(e).includes(filterStudentId),
    );
  }, [events, filterStudentId]);

  const openCreate = (day: Dayjs, hour?: number) => {
    if (!isTeacher) return;
    const startHour = hour ?? Math.max(dayjs().hour(), 9);
    setSelectedEvent(null);
    setDefaults({
      date: day.format("YYYY-MM-DD"),
      start_time: `${String(startHour).padStart(2, "0")}:00`,
      end_time: `${String(startHour + 1).padStart(2, "0")}:00`,
      student_ids: filterStudentId ? [filterStudentId] : [],
      location_type: "lesson",
      lesson_source: "mine",
    });
    setModalOpen(true);
    setSidebarOpen(false);
  };

  const openEvent = (event: ScheduleEvent) => {
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

  if (isTeacher && !teacherAllowed) {
    return (
      <CatalogPageShell title={<T k="schedule.titlePage" />}>
        <div className="flex h-[50vh] items-center justify-center">
          <Spinner color="primary" />
        </div>
      </CatalogPageShell>
    );
  }

  return (
    <CatalogPageShell
      className={styles.page}
      title={<T k="schedule.titlePage" />}
      subtitle={
        isStudent ? (
          <T k="schedule.studentSubtitle" />
        ) : (
          <T k="schedule.teacherSubtitle" />
        )
      }
    >
      {isTeacher && schoolsLoaded && schools.length > 0 && (
        <div
          className="flex flex-wrap justify-center gap-1.5 min-[1200px]:gap-3"
          role="tablist"
          aria-label={i18n.t("schedule.switchSchedule")}
        >
          <BrandPill
            active={workspace.scope === "personal"}
            onClick={() => {
              const next: WorkspaceContext = {
                scope: "personal",
                schoolId: null,
              };
              setActiveWorkspace(next);
              setWorkspace(next);
              setFilterStudentId(null);
              setTeacherFilter("all");
            }}
          >
            <T k="schedule.personalSchedule" />
          </BrandPill>
          {schools.map((item) => (
            <BrandPill
              key={item.id}
              active={
                workspace.scope === "school" && workspace.schoolId === item.id
              }
              onClick={() => {
                const next: WorkspaceContext = {
                  scope: "school",
                  schoolId: item.id,
                };
                setActiveWorkspace(next);
                setWorkspace(next);
                setFilterStudentId(null);
                setTeacherFilter("all");
              }}
            >
              {item.name}
            </BrandPill>
          ))}
        </div>
      )}

      {isTeacher && (
        <div className={styles.tabRow} role="tablist" aria-label="schedule tabs">
          <BrandPill
            active={tab === "calendar"}
            onClick={() => setTab("calendar")}
          >
            <T k="schedule.tabCalendar" />
          </BrandPill>
          <BrandPill
            active={tab === "payments"}
            onClick={() => setTab("payments")}
          >
            <T k="schedule.tabPayments" />
          </BrandPill>
        </div>
      )}

      {tab === "payments" && isTeacher ? (
        <div className="pb-4">
          <PaymentControlTab
            plans={plans}
            stats={stats}
            loading={paymentsLoading}
            statsLoading={statsLoading}
            students={scheduleStudents}
            onRefreshPlans={loadPlans}
            onLoadStats={loadStats}
            onCreate={async (data) => {
              await createPlan(data);
            }}
            onUpdate={async (id, data) => {
              await updatePlan(id, data);
              await refreshRange();
            }}
            onRecord={async (id) => {
              await recordPayment(id);
              await refreshRange();
            }}
            onDeactivate={async (id) => {
              await deletePlan(id);
              await refreshRange();
            }}
          />
        </div>
      ) : (
        <div className={styles.shell}>
          {isTeacher && (
            <div className={styles.mobileBar}>
              <Button
                size="sm"
                className="rounded-[14px] bg-brand-violet text-xs font-bold tracking-brand text-white"
                onPress={() => openCreate(dayjs())}
              >
                <T k="schedule.newLesson" />
              </Button>
              <Button
                size="sm"
                variant="flat"
                className="rounded-[14px] bg-brand-gray text-xs font-bold tracking-brand text-brand-black"
                onPress={() => setSidebarOpen((v) => !v)}
              >
                <T k="schedule.studentsFilter" />
              </Button>
            </div>
          )}

          <div className={styles.mainRow}>
            {isTeacher && (
              <StudentSidebar
                students={scheduleStudents}
                filterStudentId={filterStudentId}
                onFilter={setFilterStudentId}
                onCreate={() => openCreate(dayjs())}
                canCreate
                open={sidebarOpen}
              />
            )}

            <section className={styles.calendarPane}>
              <CalendarToolbar
                cursor={cursor}
                view={view}
                title={titleLabel}
                onViewChange={setView}
                onToday={() => setCursor(dayjs())}
                onPrev={() => setCursor((c) => c.subtract(1, shiftUnit))}
                onNext={() => setCursor((c) => c.add(1, shiftUnit))}
              />
              {canFilterTeachers && (
                <div className="border-b border-[#e8e8ed] px-3 py-2">
                  <SearchableSelect
                    size="sm"
                    label={i18n.t("school.scheduleFilterTeacher")}
                    placeholder={i18n.t("school.searchTeacher")}
                    className="max-w-[280px]"
                    selectedId={teacherFilter}
                    onSelect={(id) => setTeacherFilter(id || "all")}
                    items={[
                      {
                        id: "all",
                        label: i18n.t("school.scheduleAllTeachers"),
                      },
                      ...schoolTeachers.map((m) => ({
                        id: String(m.user_id),
                        label:
                          [m.user?.name, m.user?.surname]
                            .filter(Boolean)
                            .join(" ") ||
                          m.user?.login ||
                          String(m.user_id),
                        description: m.user?.login,
                      })),
                    ]}
                  />
                </div>
              )}
              {isTeacher && showAvailability && availability.supported && (
                <div className="flex flex-wrap items-center gap-2 border-b border-[#e8e8ed] px-3 py-2">
                  <Button
                    size="sm"
                    variant={selectionMode ? "solid" : "flat"}
                    color={selectionMode ? "primary" : "default"}
                    onPress={() => {
                      setSelectionMode((value) => !value);
                      setSelectedRanges(new Map());
                    }}
                  >
                    <T k="schedule.selectUnavailable" />
                  </Button>
                  {selectionMode && (
                    <>
                      <span className="text-xs text-brand-grayFont">
                        <T
                          k="schedule.selectedIntervals"
                          values={{ count: selectedRanges.size }}
                        />
                      </span>
                      <Button
                        size="sm"
                        color="primary"
                        isLoading={availabilitySaving}
                        isDisabled={!selectedRanges.size}
                        onPress={async () => {
                          const json = await markInactive(
                            Array.from(selectedRanges.values()),
                            availabilityTeacherId,
                          );
                          checkResponse(json);
                          if (json?.success) {
                            setSelectedRanges(new Map());
                            setSelectionMode(false);
                            const { from, to } = rangeForView(cursor, view);
                            await loadAvailability(
                              from,
                              to,
                              availabilityTeacherId,
                            );
                          }
                        }}
                      >
                        <T k="schedule.markInactive" />
                      </Button>
                    </>
                  )}
                  {workspace.scope === "school" && (
                    <Link
                      href={
                        availabilityTeacherId
                          ? `/school/staff/${availabilityTeacherId}?returnTo=${encodeURIComponent("/schedule")}`
                          : "/school?tab=members"
                      }
                      className="text-xs font-medium text-brand-violet hover:underline"
                    >
                      <T k="schedule.weeklyHoursLink" />
                    </Link>
                  )}
                </div>
              )}
              <div className={styles.viewBody}>
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <Spinner color="primary" />
                  </div>
                ) : view === "month" ? (
                  <MonthView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed={isTeacher}
                    nameById={studentNameById}
                    teacherById={teacherById}
                    showTeacher={showTeacherOnChips}
                    onDayClick={(day) => {
                      setCursor(day);
                      if (isTeacher) openCreate(day);
                      else setView("day");
                    }}
                    onEventClick={openEvent}
                  />
                ) : view === "week" ? (
                  <WeekView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed={isTeacher}
                    nameById={studentNameById}
                    teacherById={teacherById}
                    showTeacher={showTeacherOnChips}
                    availability={
                      showAvailability ? availability : undefined
                    }
                    selectionMode={selectionMode}
                    selectedRangeKeys={new Set(selectedRanges.keys())}
                    onRangeToggle={(range, selected) =>
                      setSelectedRanges((current) => {
                        const next = new Map(current);
                        const key = rangeKey(range);
                        if (selected) next.set(key, range);
                        else next.delete(key);
                        return next;
                      })
                    }
                    onSlotClick={openCreate}
                    onEventClick={openEvent}
                  />
                ) : (
                  <DayView
                    cursor={cursor}
                    events={visibleEvents}
                    detailed={isTeacher}
                    nameById={studentNameById}
                    teacherById={teacherById}
                    showTeacher={showTeacherOnChips}
                    availability={
                      showAvailability ? availability : undefined
                    }
                    selectionMode={selectionMode}
                    selectedRangeKeys={new Set(selectedRanges.keys())}
                    onRangeToggle={(range, selected) =>
                      setSelectedRanges((current) => {
                        const next = new Map(current);
                        const key = rangeKey(range);
                        if (selected) next.set(key, range);
                        else next.delete(key);
                        return next;
                      })
                    }
                    onSlotClick={openCreate}
                    onEventClick={openEvent}
                  />
                )}
              </div>
            </section>
          </div>
        </div>
      )}

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
          aria-label="close"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        readOnly={!isTeacher}
        event={selectedEvent}
        defaults={defaults}
        students={scheduleStudents}
        lessons={lessons}
        defaultEmail={profile?.login || profile?.email || ""}
        onSave={async (payload, editingId) => {
          if (editingId) {
            await updateEvent(editingId, payload);
          } else {
            await createEvent(payload);
          }
          await refreshRange();
        }}
        onDelete={async (id, scope) => {
          await deleteEvent(id, scope);
          await refreshRange();
        }}
        onEmail={async (id, email) => {
          await emailEvent(id, email);
        }}
        onRecordPayment={async (planId) => {
          await recordPayment(planId);
          await refreshRange();
          await loadPlans();
        }}
      />
    </CatalogPageShell>
  );
}
