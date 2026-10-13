"use client";

import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/ru";
import { Button, Spinner, Tab, Tabs } from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useStudentList } from "@/app/student/hooks/useStudentList";
import { useScheduleEvents } from "./hooks/useScheduleEvents";
import { usePaymentPlans } from "./hooks/usePaymentPlans";
import { MonthView } from "./components/MonthView";
import { WeekView } from "./components/WeekView";
import { DayView } from "./components/DayView";
import { EventModal } from "./components/EventModal";
import { PaymentControlTab } from "./components/PaymentControlTab";
import { CalendarToolbar } from "./components/CalendarToolbar";
import { StudentSidebar } from "./components/StudentSidebar";
import type { EventFormValues, ScheduleEvent, ScheduleView } from "./types";
import { eventStudentIds } from "./types";
import { rangeForView } from "./utils/calendar";
import styles from "./styles.module.css";

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

  const { students, getStudents } = useStudentList();
  const {
    events,
    loading,
    loadEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    emailEvent,
  } = useScheduleEvents();
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
  } = usePaymentPlans();

  useEffect(() => {
    if (isMobile) setView((v) => (v === "week" ? "day" : v));
  }, [isMobile]);

  const refreshRange = useCallback(async () => {
    const { from, to } = rangeForView(cursor, view);
    await loadEvents(from, to);
  }, [cursor, view, loadEvents]);

  useEffect(() => {
    if (!teacherAllowed && isTeacher) return;
    refreshRange();
  }, [refreshRange, teacherAllowed, isTeacher]);

  useEffect(() => {
    if (isTeacher && teacherAllowed) getStudents();
  }, [isTeacher, teacherAllowed, getStudents]);

  useEffect(() => {
    if (!isTeacher || !teacherAllowed) return;
    (async () => {
      const res = await fetchGet({ path: "/lessons", isSecure: true });
      const json = await res?.json();
      checkResponse(json);
      const list = Array.isArray(json)
        ? json
        : Array.isArray(json?.lessons)
          ? json.lessons
          : [];
      setLessons(
        list
          .filter((l: any) => l?.id)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            user_id: l.user_id,
          })),
      );
    })();
  }, [isTeacher, teacherAllowed]);

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
      <main className={styles.page}>
        <ContentWrapper>
          <div className="flex h-[50vh] items-center justify-center">
            <Spinner color="primary" />
          </div>
        </ContentWrapper>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <ContentWrapper>
        <div className="h-4 sm:h-6" />
        <div className={styles.headerBlock}>
          <div>
            <h1 className={styles.pageTitle}>
              <T k="schedule.titlePage" />
            </h1>
            <p className={styles.pageSubtitle}>
              {isStudent ? (
                <T k="schedule.studentSubtitle" />
              ) : (
                <T k="schedule.teacherSubtitle" />
              )}
            </p>
          </div>
          {isTeacher && (
            <Tabs
              selectedKey={tab}
              onSelectionChange={(key) =>
                setTab(key === "payments" ? "payments" : "calendar")
              }
              size="sm"
              aria-label="schedule tabs"
              classNames={{
                tabList: "bg-[#f2f2f7] p-1 rounded-xl",
                cursor: "bg-white shadow-sm",
                tab: "text-sm font-medium",
              }}
            >
              <Tab key="calendar" title={i18n.t("schedule.tabCalendar")} />
              <Tab key="payments" title={i18n.t("schedule.tabPayments")} />
            </Tabs>
          )}
        </div>

        {tab === "payments" && isTeacher ? (
          <div className="pb-10">
            <PaymentControlTab
              plans={plans}
              stats={stats}
              loading={paymentsLoading}
              statsLoading={statsLoading}
              students={students}
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
                  color="primary"
                  onPress={() => openCreate(dayjs())}
                >
                  <T k="schedule.newLesson" />
                </Button>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => setSidebarOpen((v) => !v)}
                >
                  <T k="schedule.studentsFilter" />
                </Button>
              </div>
            )}

            <div className={styles.mainRow}>
              {isTeacher && (
                <StudentSidebar
                  students={students}
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
                      onSlotClick={openCreate}
                      onEventClick={openEvent}
                    />
                  ) : (
                    <DayView
                      cursor={cursor}
                      events={visibleEvents}
                      detailed={isTeacher}
                      onSlotClick={openCreate}
                      onEventClick={openEvent}
                    />
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </ContentWrapper>

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
        students={students}
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
    </main>
  );
}
