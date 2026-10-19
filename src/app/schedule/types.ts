export type ScheduleView = "month" | "week" | "day";

export type ScheduleEventType = "lesson" | "payment";

export type ScheduleEvent = {
  id: number | string;
  type: ScheduleEventType;
  teacher_user_id?: number;
  student_id: number;
  student_ids?: number[];
  student_name?: string | null;
  student_names?: string[] | null;
  title: string;
  starts_at: string;
  ends_at: string;
  location_type?: "lesson" | "text";
  lesson_id?: number | null;
  lesson_title?: string | null;
  location_text?: string | null;
  notes?: string | null;
  recurrence?: string | null;
  series_id?: string | null;
  plan_id?: number;
  amount?: number;
  currency?: string;
  plan_type?: string;
  frequency?: string;
  lessons_remaining?: number | null;
  due_date?: string | null;
  is_overdue?: boolean;
  is_payment_reminder?: boolean;
};

export type EventFormValues = {
  student_ids: number[];
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  location_type: "lesson" | "text";
  lesson_source: "mine" | "2easy";
  lesson_id: number | "";
  location_text: string;
  notes: string;
  recurrence: "" | "daily" | "weekly" | "biweekly" | "monthly";
};

export type PaymentPlan = {
  id: number;
  teacher_user_id: number;
  student_id: number;
  student_name?: string | null;
  student_email?: string | null;
  plan_type: "recurring" | "package";
  amount: number;
  currency: string;
  frequency?: string | null;
  next_payment_date?: string | null;
  lessons_total?: number | null;
  lessons_remaining?: number | null;
  is_active: number;
  notes?: string | null;
  anchor_event_id?: number | null;
  is_overdue?: boolean;
};

export type PaymentStatsGranularity = "day" | "week" | "month";

export type MoneyByCurrency = {
  currency: string;
  amount: number;
};

export type PaymentStats = {
  granularity?: PaymentStatsGranularity;
  from?: string;
  to?: string;
  currencies?: string[];
  /** Multi-currency totals (preferred). Legacy clients may still send a number. */
  actual_total: number | MoneyByCurrency[];
  actual_past?: number | MoneyByCurrency[];
  actual_today?: number | MoneyByCurrency[];
  projected_total: number | MoneyByCurrency[];
  expected_total?: number | MoneyByCurrency[];
  chart: Array<{
    period?: string;
    label?: string;
    month?: string;
    actual: number;
    projected: number;
    total?: number;
    by_currency?: Record<
      string,
      { actual: number; projected: number; total?: number }
    >;
  }>;
  by_student: Array<{
    student_id: number;
    student_name?: string | null;
    student_email?: string | null;
    actual: number;
    projected: number;
    amounts?: Array<{
      currency: string;
      actual: number;
      projected: number;
    }>;
  }>;
  upcoming?: Array<{
    date: string;
    amount: number;
    currency?: string;
    student_id: number;
    student_name?: string | null;
    student_email?: string | null;
    plan_id: number;
    plan_type: string;
  }>;
};

/** Soft Apple Calendar–like palette */
export const STUDENT_COLORS = [
  "#0A84FF",
  "#30D158",
  "#FF9F0A",
  "#BF5AF2",
  "#FF6482",
  "#64D2FF",
  "#FFD60A",
  "#5E5CE6",
  "#AC8E68",
  "#FF453A",
];

export const colorForStudent = (studentId: number) =>
  STUDENT_COLORS[Math.abs(studentId) % STUDENT_COLORS.length];

export const eventStudentIds = (event: ScheduleEvent): number[] => {
  if (Array.isArray(event.student_ids) && event.student_ids.length) {
    return event.student_ids;
  }
  return event.student_id ? [event.student_id] : [];
};

export const colorsForEvent = (event: ScheduleEvent): string[] => {
  if (event.type === "payment") {
    return [event.is_overdue ? "#FF3B30" : "#FF9F0A"];
  }
  const ids = eventStudentIds(event);
  if (!ids.length) return [STUDENT_COLORS[0]];
  return ids.map(colorForStudent);
};

export const backgroundForColors = (colors: string[]) => {
  if (colors.length <= 1) return colors[0] || STUDENT_COLORS[0];
  const stops = colors
    .map((c, i) => {
      const from = (i / colors.length) * 100;
      const to = ((i + 1) / colors.length) * 100;
      return `${c} ${from}%, ${c} ${to}%`;
    })
    .join(", ");
  return `linear-gradient(90deg, ${stops})`;
};
