import i18n from "@/i18n/config";
import type { ScheduleEvent } from "../types";

export {
  colorForStudent,
  colorsForEvent,
  backgroundForColors,
  eventStudentIds,
} from "../types";

export const formatMoneySafe = (
  amount: number,
  currency = "RUB",
) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);

export const eventStudentLabel = (event: ScheduleEvent) =>
  (event.student_names?.filter(Boolean).join(", ") ||
    event.student_name ||
    "")
    .trim();

export const eventPlaceLabel = (event: ScheduleEvent) => {
  if (event.type === "payment") return "";
  if (event.location_type === "lesson") {
    return String(event.lesson_title || "").trim();
  }
  return String(event.location_text || "").trim();
};

const isGenericTitle = (title?: string | null) => {
  const t = String(title || "").trim();
  if (!t) return true;
  const generic = i18n.t("schedule.defaultLessonTitle");
  return t === generic || /^Занятие$/i.test(t) || /^Lesson$/i.test(t);
};

/** Primary/secondary lines for calendar event plaques. */
export const eventChipText = (
  event: ScheduleEvent,
  opts?: { detailed?: boolean; time?: string },
) => {
  const time = opts?.time || "";
  if (event.type === "payment") {
    const student = eventStudentLabel(event);
    const amount =
      event.amount != null
        ? formatMoneySafe(Number(event.amount), event.currency || "RUB")
        : "";
    const prefix = event.is_overdue
      ? i18n.t("schedule.paymentOverdueShort")
      : i18n.t("schedule.paymentMarker");
    const primary = student ? `${prefix}: ${student}` : prefix;
    const secondary = [
      time,
      amount,
      event.is_overdue ? i18n.t("schedule.askForPayment") : "",
    ]
      .filter(Boolean)
      .join(" · ");
    const titleAttr = [primary, secondary].filter(Boolean).join(" · ");
    return { primary, secondary, titleAttr };
  }

  const students = eventStudentLabel(event);
  const rawTitle = String(event.title || "").trim();
  const customTitle =
    isGenericTitle(rawTitle) ||
    (students && rawTitle.toLowerCase() === students.toLowerCase())
      ? ""
      : rawTitle;
  const place = eventPlaceLabel(event);
  const nameOrTitle =
    students || customTitle || i18n.t("schedule.defaultLessonTitle");

  if (!opts?.detailed) {
    const primary = [time, nameOrTitle].filter(Boolean).join(" ");
    return { primary, secondary: "", titleAttr: primary };
  }

  const primary = [time, nameOrTitle].filter(Boolean).join(" ");
  const secondary = [students ? customTitle : "", place]
    .filter(Boolean)
    .join(" · ");
  const titleAttr = [primary, secondary].filter(Boolean).join(" · ");
  return { primary, secondary, titleAttr };
};

/** Min plaque height so two text lines stay readable. */
export const eventMinHeight = (event: ScheduleEvent, hourHeight: number) => {
  if (event.type === "payment") return Math.max(52, Math.round(hourHeight * 0.85));
  return 34;
};
