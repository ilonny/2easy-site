"use client";

import {
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { checkResponse, fetchGet } from "@/api";
import type {
  PaymentPlan,
  PaymentStats,
  PaymentStatsGranularity,
  ScheduleEvent,
} from "../types";
import { eventStudentIds } from "../types";
import { formatMoney, formatMoneyList } from "../utils/calendar";
import {
  DEFAULT_PAYMENT_CURRENCY,
  PAYMENT_CURRENCIES,
  PAYMENT_CURRENCY_LABELS,
  type PaymentCurrency,
} from "../utils/currencies";
import type { LoadStatsParams } from "../hooks/usePaymentPlans";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";

type AnchorOption = {
  id: number;
  label: string;
  ends_at: string;
};

dayjs.extend(isoWeek);

type StudentOption = { id: number; name?: string; email?: string };

type TProps = {
  plans: PaymentPlan[];
  stats: PaymentStats | null;
  loading?: boolean;
  statsLoading?: boolean;
  students: StudentOption[];
  onRefreshPlans: () => Promise<void>;
  onLoadStats: (params: LoadStatsParams) => Promise<void>;
  onCreate: (data: Record<string, unknown>) => Promise<void>;
  onUpdate: (id: number, data: Record<string, unknown>) => Promise<void>;
  onRecord: (id: number) => Promise<void>;
  onDeactivate: (id: number) => Promise<void>;
};

type PlanForm = {
  student_id: number | "";
  plan_type: "recurring" | "package";
  amount: string;
  currency: PaymentCurrency;
  frequency: "weekly" | "biweekly" | "monthly";
  next_payment_date: string;
  lessons_total: string;
  lessons_remaining: string;
  notes: string;
  anchor_event_id: number | "";
};

const emptyPlanForm = (): PlanForm => ({
  student_id: "",
  plan_type: "recurring",
  amount: "",
  currency: DEFAULT_PAYMENT_CURRENCY,
  frequency: "monthly",
  next_payment_date: dayjs().add(7, "day").format("YYYY-MM-DD"),
  lessons_total: "8",
  lessons_remaining: "8",
  notes: "",
  anchor_event_id: "",
});

const formFromPlan = (plan: PaymentPlan): PlanForm => {
  const raw = String(plan.currency || DEFAULT_PAYMENT_CURRENCY)
    .trim()
    .toUpperCase();
  const currency = (
    PAYMENT_CURRENCIES.includes(raw as PaymentCurrency)
      ? raw
      : DEFAULT_PAYMENT_CURRENCY
  ) as PaymentCurrency;
  return {
    student_id: plan.student_id,
    plan_type: plan.plan_type,
    amount: String(plan.amount ?? ""),
    currency,
    frequency: (plan.frequency as PlanForm["frequency"]) || "monthly",
    next_payment_date: plan.next_payment_date
      ? dayjs(plan.next_payment_date).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
    lessons_total: String(plan.lessons_total ?? 8),
    lessons_remaining: String(
      plan.lessons_remaining ?? plan.lessons_total ?? 8,
    ),
    notes: plan.notes || "",
    anchor_event_id: plan.anchor_event_id || "",
  };
};

const formatStudentAmounts = (
  amounts:
    | Array<{ currency: string; actual: number; projected: number }>
    | undefined,
  actual: number,
  projected: number,
) => {
  if (amounts?.length) {
    return {
      earned: amounts
        .map((a) => formatMoney(a.actual, a.currency))
        .join(" · "),
      projected: amounts
        .map((a) => formatMoney(a.projected, a.currency))
        .join(" · "),
    };
  }
  return {
    earned: formatMoney(actual),
    projected: formatMoney(projected),
  };
};

const defaultRange = (granularity: PaymentStatsGranularity) => {
  const now = dayjs();
  if (granularity === "day") {
    return {
      from: now.subtract(14, "day").format("YYYY-MM-DD"),
      to: now.add(30, "day").format("YYYY-MM-DD"),
    };
  }
  if (granularity === "week") {
    return {
      from: now.startOf("isoWeek").subtract(4, "week").format("YYYY-MM-DD"),
      to: now.endOf("isoWeek").add(8, "week").format("YYYY-MM-DD"),
    };
  }
  return {
    from: now.startOf("month").subtract(5, "month").format("YYYY-MM-DD"),
    to: now.endOf("month").add(6, "month").format("YYYY-MM-DD"),
  };
};

const formatPeriodLabel = (
  period: string,
  granularity: PaymentStatsGranularity,
) => {
  if (granularity === "month") {
    const d = dayjs(`${period}-01`);
    return d.isValid() ? d.format("MMM YY") : period;
  }
  if (granularity === "week") {
    const d = dayjs(period);
    return d.isValid() ? d.format("D MMM") : period;
  }
  const d = dayjs(period);
  return d.isValid() ? d.format("D MMM") : period;
};

const studentLabel = (s: {
  student_name?: string | null;
  student_email?: string | null;
  student_id?: number | null;
  name?: string;
  email?: string;
  id?: number;
}) => {
  const name =
    String(s.student_name || s.name || "").trim() ||
    (s.student_id || s.id ? `Ученик #${s.student_id || s.id}` : "Ученик");
  const email = String(s.student_email || s.email || "").trim();
  return email ? `${name} · ${email}` : name;
};

const frequencyLabel = (frequency?: string | null) => {
  const key = String(frequency || "")
    .trim()
    .toLowerCase();
  if (key === "weekly") return i18n.t("schedule.freqWeekly");
  if (key === "biweekly") return i18n.t("schedule.freqBiweekly");
  if (key === "monthly") return i18n.t("schedule.freqMonthly");
  return frequency || "—";
};

export const PaymentControlTab = ({
  plans,
  stats,
  loading,
  statsLoading,
  students,
  onRefreshPlans,
  onLoadStats,
  onCreate,
  onUpdate,
  onRecord,
  onDeactivate,
}: TProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentPlan | null>(null);
  const [form, setForm] = useState<PlanForm>(emptyPlanForm());
  const [busy, setBusy] = useState(false);
  const [anchorOptions, setAnchorOptions] = useState<AnchorOption[]>([]);
  const [anchorsLoading, setAnchorsLoading] = useState(false);
  const [granularity, setGranularity] =
    useState<PaymentStatsGranularity>("month");
  const initial = defaultRange("month");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [chartCurrency, setChartCurrency] = useState<string>(
    DEFAULT_PAYMENT_CURRENCY,
  );

  const reloadStats = async (
    g = granularity,
    f = from,
    t = to,
  ) => {
    await onLoadStats({ from: f, to: t, granularity: g });
  };

  useEffect(() => {
    onRefreshPlans();
  }, [onRefreshPlans]);

  useEffect(() => {
    reloadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open || !form.student_id) {
      setAnchorOptions([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setAnchorsLoading(true);
      try {
        const rangeFrom = dayjs().subtract(14, "day").toISOString();
        const rangeTo = dayjs().add(6, "month").toISOString();
        const res = await fetchGet({
          path: `/schedule/events?from=${encodeURIComponent(rangeFrom)}&to=${encodeURIComponent(rangeTo)}`,
          isSecure: true,
        });
        const json = await res?.json();
        checkResponse(json);
        if (cancelled || !json?.success) return;
        const list = (json.events || []) as ScheduleEvent[];
        const studentId = Number(form.student_id);
        const options = list
          .filter((e) => e.type !== "payment")
          .filter((e) => eventStudentIds(e).includes(studentId))
          .map((e) => {
            const when = dayjs(e.starts_at);
            const title =
              String(e.title || "").trim() ||
              i18n.t("schedule.defaultLessonTitle");
            return {
              id: Number(e.id),
              ends_at: e.ends_at,
              label: `${when.format("DD.MM.YYYY HH:mm")} · ${title}`,
            };
          })
          .filter((o) => Number.isFinite(o.id) && o.id > 0)
          .sort((a, b) => dayjs(a.ends_at).valueOf() - dayjs(b.ends_at).valueOf());
        setAnchorOptions(options);
      } catch {
        if (!cancelled) setAnchorOptions([]);
      } finally {
        if (!cancelled) setAnchorsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, form.student_id]);

  const studentById = useMemo(() => {
    const map = new Map<number, { name?: string; email?: string }>();
    for (const s of students) {
      map.set(Number(s.id), { name: s.name, email: s.email });
    }
    return map;
  }, [students]);

  const resolveStudent = (
    studentId: number,
    name?: string | null,
    email?: string | null,
  ) => {
    const local = studentById.get(Number(studentId));
    return {
      name:
        String(name || local?.name || "").trim() ||
        `Ученик #${studentId}`,
      email: String(email || local?.email || "").trim() || null,
    };
  };

  const applyGranularity = (g: PaymentStatsGranularity) => {
    const range = defaultRange(g);
    setGranularity(g);
    setFrom(range.from);
    setTo(range.to);
    reloadStats(g, range.from, range.to);
  };

  const applyPreset = (preset: string) => {
    const now = dayjs();
    let nextFrom = from;
    let nextTo = to;
    if (preset === "past3m") {
      nextFrom = now.subtract(3, "month").startOf("month").format("YYYY-MM-DD");
      nextTo = now.format("YYYY-MM-DD");
    } else if (preset === "next3m") {
      nextFrom = now.format("YYYY-MM-DD");
      nextTo = now.add(3, "month").endOf("month").format("YYYY-MM-DD");
    } else if (preset === "year") {
      nextFrom = now.startOf("year").format("YYYY-MM-DD");
      nextTo = now.endOf("year").format("YYYY-MM-DD");
    }
    setFrom(nextFrom);
    setTo(nextTo);
    reloadStats(granularity, nextFrom, nextTo);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPlanForm());
    setOpen(true);
  };

  const openEdit = (plan: PaymentPlan) => {
    setEditing(plan);
    setForm(formFromPlan(plan));
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
    setEditing(null);
    setForm(emptyPlanForm());
  };

  const submit = async () => {
    if (!form.student_id || !form.amount) {
      toast(i18n.t("schedule.fillRequired"), { type: "warning" });
      return;
    }
    setBusy(true);
    try {
      const payload = {
        student_id: Number(form.student_id),
        plan_type: form.plan_type,
        amount: Number(form.amount),
        currency: form.currency,
        frequency: form.plan_type === "recurring" ? form.frequency : null,
        next_payment_date: form.next_payment_date || null,
        lessons_total:
          form.plan_type === "package" ? Number(form.lessons_total) : null,
        lessons_remaining:
          form.plan_type === "package"
            ? Number(form.lessons_remaining)
            : null,
        notes: form.notes || null,
        anchor_event_id: form.anchor_event_id
          ? Number(form.anchor_event_id)
          : null,
      };
      if (editing) await onUpdate(editing.id, payload);
      else await onCreate(payload);
      closeModal();
      await onRefreshPlans();
      await reloadStats();
    } finally {
      setBusy(false);
    }
  };

  const activePlans = plans.filter((p) => p.is_active);

  const statsCurrencies = useMemo(() => {
    const fromStats = (stats?.currencies || []).map((c) =>
      String(c).toUpperCase(),
    );
    if (fromStats.length) return fromStats;
    const fromPlans = [
      ...new Set(
        activePlans.map((p) =>
          String(p.currency || DEFAULT_PAYMENT_CURRENCY).toUpperCase(),
        ),
      ),
    ];
    return fromPlans.length ? fromPlans : [DEFAULT_PAYMENT_CURRENCY];
  }, [stats?.currencies, activePlans]);

  useEffect(() => {
    if (!statsCurrencies.includes(chartCurrency)) {
      setChartCurrency(statsCurrencies[0] || DEFAULT_PAYMENT_CURRENCY);
    }
  }, [statsCurrencies, chartCurrency]);

  const chartData = useMemo(() => {
    const rows = stats?.chart || [];
    const pickAmounts = (row: (typeof rows)[number]) => {
      const byCur = row.by_currency?.[chartCurrency];
      if (byCur) {
        return {
          actual: Number(byCur.actual || 0),
          projected: Number(byCur.projected || 0),
          total: Number(
            byCur.total != null
              ? byCur.total
              : Number(byCur.actual || 0) + Number(byCur.projected || 0),
          ),
        };
      }
      // Legacy: single-currency charts without by_currency
      if (statsCurrencies.length <= 1) {
        return {
          actual: Number(row.actual || 0),
          projected: Number(row.projected || 0),
          total: Number(
            row.total != null
              ? row.total
              : Number(row.actual || 0) + Number(row.projected || 0),
          ),
        };
      }
      return { actual: 0, projected: 0, total: 0 };
    };

    if (!rows.length) {
      // still draw an empty axis across the selected range
      const empty: Array<{
        period: string;
        label: string;
        actual: number;
        projected: number;
        total: number;
      }> = [];
      let cursor = dayjs(from);
      const end = dayjs(to);
      let guard = 0;
      const max =
        granularity === "day" ? 120 : granularity === "week" ? 60 : 36;
      while ((cursor.isBefore(end) || cursor.isSame(end, "day")) && guard < max) {
        const period =
          granularity === "month"
            ? cursor.format("YYYY-MM")
            : granularity === "week"
              ? cursor.startOf("isoWeek").format("YYYY-MM-DD")
              : cursor.format("YYYY-MM-DD");
        if (!empty.some((r) => r.period === period)) {
          empty.push({
            period,
            label: formatPeriodLabel(period, granularity),
            actual: 0,
            projected: 0,
            total: 0,
          });
        }
        cursor =
          granularity === "day"
            ? cursor.add(1, "day")
            : granularity === "week"
              ? cursor.add(1, "week")
              : cursor.add(1, "month");
        guard += 1;
      }
      return empty;
    }
    return rows.map((row) => {
      const period = row.period || row.month || "";
      const amounts = pickAmounts(row);
      return {
        period,
        label: formatPeriodLabel(period, granularity),
        ...amounts,
      };
    });
  }, [stats?.chart, from, to, granularity, chartCurrency, statsCurrencies]);

  const yMax = Math.max(
    1000,
    ...chartData.map((r) => Math.max(r.actual, r.projected, r.total)),
  );

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#d2d2d7] bg-white px-4 py-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-[#1d1d1f]">
            <T k="schedule.paymentsTitle" />
          </h2>
          <p className="text-sm text-[#86868b]">
            <T k="schedule.paymentsSubtitle" />
          </p>
        </div>
        <Button color="primary" className="font-semibold" onPress={openCreate}>
          <T k="schedule.addPlan" />
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="text-sm text-[#86868b]">
              <T k="schedule.earnedPast" />
            </div>
            <div className="text-xl font-bold leading-snug text-[#1d1d1f] sm:text-2xl">
              {formatMoneyList(
                stats?.actual_past ?? stats?.actual_total ?? 0,
              )}
            </div>
          </CardBody>
        </Card>
        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="text-sm text-[#86868b]">
              <T k="schedule.earnedToday" />
            </div>
            <div className="text-xl font-bold leading-snug text-[#1d1d1f] sm:text-2xl">
              {formatMoneyList(stats?.actual_today ?? 0)}
            </div>
          </CardBody>
        </Card>
        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="text-sm text-[#86868b]">
              <T k="schedule.projected" />
            </div>
            <div className="text-xl font-bold leading-snug text-[#007AFF] sm:text-2xl">
              {formatMoneyList(stats?.projected_total || 0)}
            </div>
          </CardBody>
        </Card>
        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="text-sm text-[#86868b]">
              <T k="schedule.expectedTotal" />
            </div>
            <div className="text-xl font-bold leading-snug text-[#34C759] sm:text-2xl">
              {formatMoneyList(stats?.expected_total ?? [])}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card shadow="none" className="border border-[#d2d2d7]">
        <CardBody className="gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-[#1d1d1f]">
                <T k="schedule.statsChart" />
              </div>
              <p className="text-xs text-[#86868b]">
                <T k="schedule.statsChartHint" />
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {statsCurrencies.length > 1 ? (
                <Tabs
                  size="sm"
                  selectedKey={chartCurrency}
                  onSelectionChange={(key) =>
                    setChartCurrency(String(key || DEFAULT_PAYMENT_CURRENCY))
                  }
                  classNames={{
                    tabList: "bg-[#f2f2f7] p-1 rounded-xl",
                    cursor: "bg-white shadow-sm",
                  }}
                >
                  {statsCurrencies.map((code) => (
                    <Tab key={code} title={code} />
                  ))}
                </Tabs>
              ) : null}
              <Tabs
                size="sm"
                selectedKey={granularity}
                onSelectionChange={(key) =>
                  applyGranularity(
                    key === "day" || key === "week" ? key : "month",
                  )
                }
                classNames={{
                  tabList: "bg-[#f2f2f7] p-1 rounded-xl",
                  cursor: "bg-white shadow-sm",
                }}
              >
                <Tab key="day" title={i18n.t("schedule.viewDay")} />
                <Tab key="week" title={i18n.t("schedule.viewWeek")} />
                <Tab key="month" title={i18n.t("schedule.viewMonth")} />
              </Tabs>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <Input
              type="date"
              size="sm"
              label={i18n.t("schedule.dateFrom")}
              value={from}
              className="w-[160px]"
              onChange={(e) => setFrom(e.target.value)}
            />
            <Input
              type="date"
              size="sm"
              label={i18n.t("schedule.dateTo")}
              value={to}
              className="w-[160px]"
              onChange={(e) => setTo(e.target.value)}
            />
            <Button
              size="sm"
              color="primary"
              variant="flat"
              onPress={() => reloadStats()}
            >
              <T k="schedule.applyRange" />
            </Button>
            <Button size="sm" variant="light" onPress={() => applyPreset("past3m")}>
              <T k="schedule.presetPast3m" />
            </Button>
            <Button size="sm" variant="light" onPress={() => applyPreset("next3m")}>
              <T k="schedule.presetNext3m" />
            </Button>
            <Button size="sm" variant="light" onPress={() => applyPreset("year")}>
              <T k="schedule.presetYear" />
            </Button>
          </div>

          <div className="h-[340px] w-full">
            {statsLoading ? (
              <div className="flex h-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    interval="preserveStartEnd"
                    minTickGap={16}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    domain={[0, Math.ceil(yMax * 1.15)]}
                    tickFormatter={(v) =>
                      new Intl.NumberFormat("ru-RU", {
                        notation: "compact",
                        maximumFractionDigits: 1,
                      }).format(Number(v))
                    }
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      formatMoney(Number(value || 0), chartCurrency),
                      name,
                    ]}
                  />
                  <Legend />
                  <Bar
                    dataKey="actual"
                    name={i18n.t("schedule.earned")}
                    fill="#34C759"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="projected"
                    name={i18n.t("schedule.projected")}
                    fill="#007AFF"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="mb-3 text-sm font-semibold text-[#1d1d1f]">
              <T k="schedule.byStudent" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="text-[#86868b]">
                  <tr>
                    <th className="pb-2 font-semibold">
                      <T k="schedule.student" />
                    </th>
                    <th className="pb-2 font-semibold">
                      <T k="schedule.earned" />
                    </th>
                    <th className="pb-2 font-semibold">
                      <T k="schedule.projected" />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {(stats?.by_student || []).map((row) => {
                    const s = resolveStudent(
                      row.student_id,
                      row.student_name,
                      row.student_email,
                    );
                    const money = formatStudentAmounts(
                      row.amounts,
                      row.actual,
                      row.projected,
                    );
                    return (
                    <tr key={row.student_id} className="border-t border-[#f0f0f5]">
                      <td className="py-2 font-medium">
                        <div>{s.name}</div>
                        {s.email ? (
                          <div className="text-xs font-normal text-[#86868b]">
                            {s.email}
                          </div>
                        ) : null}
                      </td>
                      <td className="py-2">{money.earned}</td>
                      <td className="py-2 text-[#007AFF]">
                        {money.projected}
                      </td>
                    </tr>
                    );
                  })}
                  {!stats?.by_student?.length && (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-[#86868b]">
                        <T k="schedule.noStatsYet" />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        <Card shadow="none" className="border border-[#d2d2d7]">
          <CardBody>
            <div className="mb-3 text-sm font-semibold text-[#1d1d1f]">
              <T k="schedule.upcomingPayments" />
            </div>
            <div className="flex max-h-[280px] flex-col gap-2 overflow-y-auto">
              {(stats?.upcoming || []).map((item, idx) => {
                const s = resolveStudent(
                  item.student_id,
                  item.student_name,
                  item.student_email,
                );
                return (
                <div
                  key={`${item.plan_id}-${item.date}-${idx}`}
                  className="flex items-center justify-between rounded-xl bg-[#f5f5f7] px-3 py-2 text-sm"
                >
                  <div>
                    <div className="font-medium text-[#1d1d1f]">{s.name}</div>
                    <div className="text-xs text-[#86868b]">
                      {s.email ? `${s.email} · ` : ""}
                      {dayjs(item.date).format("D MMM YYYY")}
                      {" · "}
                      {item.plan_type === "package"
                        ? i18n.t("schedule.planPackage")
                        : i18n.t("schedule.planRecurring")}
                    </div>
                  </div>
                  <div className="font-semibold text-[#007AFF]">
                    {formatMoney(
                      item.amount,
                      item.currency || DEFAULT_PAYMENT_CURRENCY,
                    )}
                  </div>
                </div>
                );
              })}
              {!stats?.upcoming?.length && (
                <div className="py-6 text-center text-sm text-[#86868b]">
                  <T k="schedule.noUpcoming" />
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#d2d2d7] bg-white">
        {loading ? (
          <div className="flex justify-center p-8">
            <Spinner />
          </div>
        ) : (
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[#e8e8ed] bg-[#f5f5f7] text-[#86868b]">
              <tr>
                <th className="px-4 py-3 font-semibold">
                  <T k="schedule.student" />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <T k="schedule.planType" />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <T k="schedule.amount" />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <T k="schedule.nextPayment" />
                </th>
                <th className="px-4 py-3 font-semibold">
                  <T k="schedule.details" />
                </th>
                <th className="px-4 py-3 font-semibold" />
              </tr>
            </thead>
            <tbody>
              {activePlans.map((plan) => {
                const s = resolveStudent(
                  plan.student_id,
                  plan.student_name,
                  plan.student_email,
                );
                return (
                <tr key={plan.id} className="border-b border-[#e8e8ed]">
                  <td className="px-4 py-3 font-medium">
                    <div>{s.name}</div>
                    {s.email ? (
                      <div className="text-xs font-normal text-[#86868b]">
                        {s.email}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    {plan.plan_type === "recurring"
                      ? i18n.t("schedule.planRecurring")
                      : i18n.t("schedule.planPackage")}
                  </td>
                  <td className="px-4 py-3">
                    {formatMoney(plan.amount, plan.currency)}
                  </td>
                  <td className="px-4 py-3">
                    {plan.next_payment_date ? (
                      <div className="flex flex-col gap-1">
                        <span
                          className={
                            plan.is_overdue
                              ? "font-semibold text-[#FF3B30]"
                              : undefined
                          }
                        >
                          {dayjs(plan.next_payment_date).format("DD.MM.YYYY")}
                        </span>
                        {plan.is_overdue ? (
                          <span className="inline-flex w-fit rounded-md bg-[#FF3B30]/10 px-1.5 py-0.5 text-[11px] font-medium text-[#FF3B30]">
                            <T k="schedule.overdueBadge" />
                          </span>
                        ) : null}
                        {plan.anchor_event_id ? (
                          <span className="text-[11px] text-[#86868b]">
                            <T k="schedule.linkedToLesson" />
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#86868b]">
                    {plan.plan_type === "recurring"
                      ? frequencyLabel(plan.frequency)
                      : `${plan.lessons_remaining ?? 0}/${plan.lessons_total ?? 0}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => openEdit(plan)}
                      >
                        <T k="schedule.edit" />
                      </Button>
                      <Button
                        size="sm"
                        color="primary"
                        variant="flat"
                        onPress={async () => {
                          await onRecord(plan.id);
                          await onRefreshPlans();
                          await reloadStats();
                        }}
                      >
                        <T k="schedule.markPaid" />
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={async () => {
                          await onDeactivate(plan.id);
                          await onRefreshPlans();
                          await reloadStats();
                        }}
                      >
                        <T k="schedule.deactivate" />
                      </Button>
                    </div>
                  </td>
                </tr>
                );
              })}
              {!activePlans.length && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-[#86868b]"
                  >
                    <T k="schedule.noPlans" />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={open}
        onClose={closeModal}
        size="lg"
        scrollBehavior="inside"
        classNames={{
          wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
          base: "mx-2 sm:mx-0 max-h-[min(90dvh,calc(100dvh-var(--site-header-h)-16px))] lg:max-h-[90vh]",
        }}
      >
        <ModalContent>
          <ModalHeader>
            {editing ? (
              <T k="schedule.editPlan" />
            ) : (
              <T k="schedule.addPlan" />
            )}
          </ModalHeader>
          <ModalBody className="gap-3">
            <Select
              label={i18n.t("schedule.student")}
              selectedKeys={form.student_id ? [String(form.student_id)] : []}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  student_id: e.target.value ? Number(e.target.value) : "",
                  anchor_event_id: "",
                }))
              }
            >
              {students.map((s) => (
                <SelectItem key={String(s.id)} value={String(s.id)}>
                  {studentLabel(s)}
                </SelectItem>
              ))}
            </Select>
            <div className="space-y-1.5">
              <p className="text-[11px] leading-snug text-[#86868b]">
                <T k="schedule.planTypeHints" />
              </p>
              <Select
                label={i18n.t("schedule.planType")}
                selectedKeys={[form.plan_type]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    plan_type:
                      (e.target.value as "recurring" | "package") ||
                      "recurring",
                  }))
                }
              >
                <SelectItem key="recurring" value="recurring">
                  {i18n.t("schedule.planRecurring")}
                </SelectItem>
                <SelectItem key="package" value="package">
                  {i18n.t("schedule.planPackage")}
                </SelectItem>
              </Select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                type="number"
                label={i18n.t("schedule.amount")}
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
              <Select
                label={i18n.t("schedule.currency")}
                selectedKeys={[form.currency]}
                onChange={(e) => {
                  const raw = String(e.target.value || "")
                    .trim()
                    .toUpperCase();
                  const next = (
                    PAYMENT_CURRENCIES.includes(raw as PaymentCurrency)
                      ? raw
                      : DEFAULT_PAYMENT_CURRENCY
                  ) as PaymentCurrency;
                  setForm((f) => ({ ...f, currency: next }));
                }}
              >
                {PAYMENT_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {PAYMENT_CURRENCY_LABELS[code]}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {form.plan_type === "recurring" ? (
              <Select
                label={i18n.t("schedule.frequency")}
                selectedKeys={[form.frequency]}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    frequency:
                      (e.target.value as PlanForm["frequency"]) || "monthly",
                  }))
                }
              >
                <SelectItem key="weekly" value="weekly">
                  {i18n.t("schedule.freqWeekly")}
                </SelectItem>
                <SelectItem key="biweekly" value="biweekly">
                  {i18n.t("schedule.freqBiweekly")}
                </SelectItem>
                <SelectItem key="monthly" value="monthly">
                  {i18n.t("schedule.freqMonthly")}
                </SelectItem>
              </Select>
            ) : (
              <>
                <Input
                  type="number"
                  label={i18n.t("schedule.lessonsInPackage")}
                  value={form.lessons_total}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      lessons_total: e.target.value,
                      lessons_remaining: editing
                        ? f.lessons_remaining
                        : e.target.value,
                    }))
                  }
                />
                {editing ? (
                  <Input
                    type="number"
                    label={i18n.t("schedule.lessonsRemaining")}
                    value={form.lessons_remaining}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        lessons_remaining: e.target.value,
                      }))
                    }
                  />
                ) : null}
              </>
            )}
            <div className="space-y-1.5">
              <p className="text-[11px] leading-snug text-[#86868b]">
                <T k="schedule.linkToLessonHint" />
              </p>
              <Select
                label={i18n.t("schedule.linkToLesson")}
                isLoading={anchorsLoading}
                isDisabled={!form.student_id}
                selectedKeys={
                  form.anchor_event_id
                    ? [String(form.anchor_event_id)]
                    : ["none"]
                }
                onChange={(e) => {
                  const raw = e.target.value;
                  if (!raw || raw === "none") {
                    setForm((f) => ({ ...f, anchor_event_id: "" }));
                    return;
                  }
                  const id = Number(raw);
                  const opt = anchorOptions.find((o) => o.id === id);
                  setForm((f) => ({
                    ...f,
                    anchor_event_id: id,
                    next_payment_date: opt
                      ? dayjs(opt.ends_at).format("YYYY-MM-DD")
                      : f.next_payment_date,
                  }));
                }}
              >
                <SelectItem key="none" value="none">
                  {i18n.t("schedule.linkToLessonNone")}
                </SelectItem>
                {anchorOptions.map((o) => (
                  <SelectItem key={String(o.id)} value={String(o.id)}>
                    {o.label}
                  </SelectItem>
                ))}
              </Select>
              {form.student_id &&
              !anchorsLoading &&
              anchorOptions.length === 0 ? (
                <p className="text-[11px] text-[#86868b]">
                  <T k="schedule.linkToLessonEmpty" />
                </p>
              ) : null}
            </div>
            <Input
              type="date"
              label={i18n.t("schedule.nextPayment")}
              value={form.next_payment_date}
              isDisabled={Boolean(form.anchor_event_id)}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  next_payment_date: e.target.value,
                }))
              }
            />
            <Input
              label={i18n.t("schedule.notes")}
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={closeModal}>
              <T k="schedule.cancel" />
            </Button>
            <Button color="primary" isLoading={busy} onPress={submit}>
              <T k="schedule.save" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
};
