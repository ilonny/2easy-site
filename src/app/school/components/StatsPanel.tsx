"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Spinner } from "@nextui-org/react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { checkResponse, fetchGet } from "@/api";
import type { SchoolStats } from "../types";

type TProps = {
  schoolId: number;
};

const CHART = {
  blue: "#007AFF",
  green: "#34C759",
  orange: "#FF9500",
  violet: "#5856D6",
  pink: "#FF2D55",
  gray: "#8E8E93",
  teal: "#5AC8FA",
};

const LEVEL_LABEL: Record<number, string> = {
  1: "teacher",
  2: "manager",
  3: "head_teacher",
  4: "methodist",
  5: "academic_director",
  6: "super_admin",
};

const StatCard: FC<{
  label: React.ReactNode;
  value: string | number;
  hint?: React.ReactNode;
  accent?: string;
}> = ({ label, value, hint, accent = CHART.blue }) => (
  <div className="relative overflow-hidden rounded-[18px] bg-white px-4 py-4 ring-1 ring-black/5">
    <div
      className="absolute inset-y-0 left-0 w-1 rounded-l-[18px]"
      style={{ background: accent }}
    />
    <p className="pl-2 text-xs font-medium uppercase tracking-wide text-brand-grayFont">
      {label}
    </p>
    <p className="mt-1 pl-2 text-2xl font-semibold tabular-nums text-brand-dark">
      {value}
    </p>
    {hint ? (
      <p className="mt-1 pl-2 text-[11px] text-brand-grayFont">{hint}</p>
    ) : null}
  </div>
);

const ChartCard: FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  tall?: boolean;
}> = ({ title, subtitle, children, tall }) => (
  <div className="flex flex-col rounded-[18px] bg-white p-4 ring-1 ring-black/5">
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-brand-dark">{title}</h3>
      {subtitle ? (
        <p className="text-xs text-brand-grayFont">{subtitle}</p>
      ) : null}
    </div>
    <div className={tall ? "h-[300px] w-full" : "h-[240px] w-full"}>
      {children}
    </div>
  </div>
);

const money = (n: number) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(Math.round(n || 0));

export const StatsPanel: FC<TProps> = ({ schoolId }) => {
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/stats`,
        isSecure: true,
      });
      const data = await res.json();
      if (data?.success) {
        setStats(data.stats || null);
      } else {
        setStats(null);
        if (res.status !== 403) checkResponse(data);
      }
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    void load();
  }, [load]);

  const level = stats?.level || 1;

  const studentsPie = useMemo(() => {
    if (!stats) return [];
    return [
      {
        name: i18n.t("school.statStudentsActive"),
        value: stats.students_active,
        color: CHART.green,
      },
      {
        name: i18n.t("school.statStudentsArchived"),
        value: stats.students_archived,
        color: CHART.gray,
      },
    ].filter((x) => x.value > 0);
  }, [stats]);

  const staffPie = useMemo(() => {
    if (!stats || level < 2) return [];
    return [
      {
        name: i18n.t("school.statMembersActive"),
        value: stats.members_active,
        color: CHART.blue,
      },
      {
        name: i18n.t("school.statMembersArchived"),
        value: stats.members_archived,
        color: CHART.orange,
      },
    ].filter((x) => x.value > 0);
  }, [stats, level]);

  const levelKey = LEVEL_LABEL[level] || "teacher";
  const levelTitle = i18n.t(`school.roles.${levelKey}`);

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (!stats) {
    return (
      <p className="text-center text-brand-grayFont">
        <T k="school.statsEmpty" />
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-brand-dark">
            <T k="school.statsTitle" />
          </h2>
          <p className="text-sm text-brand-grayFont">
            {stats.scope === "self" ? (
              <T k="school.statsScopeSelf" />
            ) : (
              <T k="school.statsScopeSchool" />
            )}
          </p>
        </div>
        <div className="rounded-full bg-brand-gray/60 px-3 py-1 text-xs font-medium text-brand-grayFont">
          <T k="school.statsLevelHint" values={{ role: levelTitle }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard
          label={<T k="school.statStudentsActive" />}
          value={stats.students_active}
          accent={CHART.green}
        />
        <StatCard
          label={<T k="school.statEventsWeek" />}
          value={stats.events_this_week}
          accent={CHART.blue}
        />
        <StatCard
          label={<T k="school.statEventsMonth" />}
          value={stats.events_this_month}
          accent={CHART.violet}
        />
        {(level >= 5 || stats.scope === "self") && (
          <StatCard
            label={<T k="school.statPaymentsAmount" />}
            value={money(stats.payments_amount_this_month)}
            hint={
              <T
                k="school.statPaymentsCountHint"
                values={{ count: stats.payments_this_month }}
              />
            }
            accent={CHART.orange}
          />
        )}
        {level >= 2 && (
          <StatCard
            label={<T k="school.statMembersActive" />}
            value={stats.members_active}
            accent={CHART.teal}
          />
        )}
        {level >= 2 && (
          <StatCard
            label={<T k="school.statStudentsArchived" />}
            value={stats.students_archived}
            accent={CHART.gray}
          />
        )}
        {level >= 6 && stats.subscription && (
          <StatCard
            label={<T k="school.statSubFill" />}
            value={
              stats.subscription.fill_percent != null
                ? `${stats.subscription.fill_percent}%`
                : i18n.t("school.unlimited")
            }
            hint={
              stats.subscription.max_students != null
                ? `${stats.subscription.student_count} / ${stats.subscription.max_students}`
                : stats.subscription.tier
            }
            accent={CHART.pink}
          />
        )}
        {level >= 6 && stats.subscription?.days_left != null && (
          <StatCard
            label={<T k="school.statSubDaysLeft" />}
            value={stats.subscription.days_left}
            hint={stats.subscription.tier}
            accent={CHART.violet}
          />
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard
          title={<T k="school.chartLessons14d" />}
          subtitle={<T k="school.chartLessons14dHint" />}
          tall
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.lessons_by_day || []}>
              <defs>
                <linearGradient id="lessonsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.blue} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={CHART.blue} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="count"
                name={i18n.t("school.chartLessonsSeries")}
                stroke={CHART.blue}
                fill="url(#lessonsGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title={<T k="school.chartLessons8w" />}
          subtitle={<T k="school.chartLessons8wHint" />}
          tall
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.lessons_by_week || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="count"
                name={i18n.t("school.chartLessonsSeries")}
                fill={CHART.violet}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {level >= 2 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard title={<T k="school.chartStudentsSplit" />}>
            {studentsPie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentsPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {studentsPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-brand-grayFont">
                <T k="school.statsEmpty" />
              </p>
            )}
          </ChartCard>

          <ChartCard title={<T k="school.chartStaffSplit" />}>
            {staffPie.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={staffPie}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {staffPie.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="flex h-full items-center justify-center text-sm text-brand-grayFont">
                <T k="school.statsEmpty" />
              </p>
            )}
          </ChartCard>
        </div>
      )}

      {level >= 2 && !!stats.teachers_load?.length && (
        <ChartCard
          title={<T k="school.chartStudentsByTeacher" />}
          subtitle={<T k="school.chartStudentsByTeacherHint" />}
          tall
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...stats.teachers_load].sort(
                (a, b) => b.students_count - a.students_count,
              )}
              layout="vertical"
              margin={{ left: 8, right: 16 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar
                dataKey="students_count"
                name={i18n.t("school.statStudentsActive")}
                fill={CHART.green}
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {level >= 3 && !!stats.teachers_load?.length && (
        <ChartCard
          title={<T k="school.chartLoadByTeacher" />}
          subtitle={<T k="school.chartLoadByTeacherHint" />}
          tall
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={[...stats.teachers_load].sort(
                (a, b) => b.lessons_8w - a.lessons_8w,
              )}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="lessons_8w"
                name={i18n.t("school.chartLessons8wShort")}
                fill={CHART.blue}
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="students_count"
                name={i18n.t("school.statStudentsActive")}
                fill={CHART.teal}
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {level >= 4 && !!stats.lessons_by_weekday?.length && (
        <ChartCard
          title={<T k="school.chartWeekday" />}
          subtitle={<T k="school.chartWeekdayHint" />}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.lessons_by_weekday}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar
                dataKey="count"
                name={i18n.t("school.chartLessonsSeries")}
                fill={CHART.orange}
                radius={[6, 6, 0, 0]}
              >
                {stats.lessons_by_weekday.map((row) => (
                  <Cell
                    key={row.weekday}
                    fill={row.weekday >= 6 ? CHART.pink : CHART.orange}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {level >= 5 && (
        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title={<T k="school.chartPaymentsTrend" />}
            subtitle={<T k="school.chartPaymentsTrendHint" />}
            tall
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.payments_by_month || []}>
                <defs>
                  <linearGradient id="payGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART.green} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={CHART.green} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("ru-RU", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v))
                  }
                />
                <Tooltip
                  formatter={(value: number) => money(Number(value || 0))}
                />
                <Area
                  type="monotone"
                  dataKey="amount"
                  name={i18n.t("school.statPaymentsAmount")}
                  stroke={CHART.green}
                  fill="url(#payGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title={<T k="school.chartPaymentsByTeacher" />}
            subtitle={<T k="school.chartPaymentsByTeacherHint" />}
            tall
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...(stats.payments_by_teacher || [])].sort(
                  (a, b) => b.amount - a.amount,
                )}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) =>
                    new Intl.NumberFormat("ru-RU", {
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(Number(v))
                  }
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => money(Number(value || 0))}
                />
                <Bar
                  dataKey="amount"
                  name={i18n.t("school.statPaymentsAmount")}
                  fill={CHART.green}
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      {level < 6 && (
        <p className="text-center text-xs text-brand-grayFont">
          <T
            k="school.statsUnlockHint"
            values={{
              role: i18n.t(
                `school.roles.${
                  LEVEL_LABEL[Math.min(level + 1, 6)] || "manager"
                }`,
              ),
            }}
          />
        </p>
      )}
    </div>
  );
};
