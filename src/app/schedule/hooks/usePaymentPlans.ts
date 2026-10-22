import { checkResponse, fetchDelete, fetchGet, fetchPatch, fetchPostJson } from "@/api";
import { useCallback, useState } from "react";
import type { PaymentPlan, PaymentStats, PaymentStatsGranularity } from "../types";
import type { ScheduleWorkspace } from "./useScheduleEvents";

export type LoadStatsParams = {
  from: string;
  to: string;
  granularity: PaymentStatsGranularity;
};

export const usePaymentPlans = (workspace?: ScheduleWorkspace) => {
  const workspaceScope = workspace?.workspaceScope;
  const schoolId = workspace?.schoolId;
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGet({
        path: "/schedule/payments/plans",
        isSecure: true,
        workspaceScope,
        schoolId,
      });
      const json = await res?.json();
      checkResponse(json);
      if (json?.success) setPlans(json.plans || []);
    } finally {
      setLoading(false);
    }
  }, [workspaceScope, schoolId]);

  const loadStats = useCallback(async (params?: LoadStatsParams) => {
    setStatsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (params?.from) qs.set("from", params.from);
      if (params?.to) qs.set("to", params.to);
      if (params?.granularity) qs.set("granularity", params.granularity);
      const suffix = qs.toString() ? `?${qs.toString()}` : "";
      const res = await fetchGet({
        path: `/schedule/payments/stats${suffix}`,
        isSecure: true,
        workspaceScope,
        schoolId,
      });
      const json = await res?.json();
      checkResponse(json);
      if (json?.success) setStats(json.stats);
    } finally {
      setStatsLoading(false);
    }
  }, [workspaceScope, schoolId]);

  const createPlan = useCallback(async (data: Record<string, unknown>) => {
    const res = await fetchPostJson({
      path: "/schedule/payments/plans",
      isSecure: true,
      data,
      workspaceScope,
      schoolId,
    });
    const json = await res?.json();
    checkResponse(json);
    return json;
  }, [workspaceScope, schoolId]);

  const updatePlan = useCallback(
    async (id: number, data: Record<string, unknown>) => {
      const res = await fetchPatch({
        path: `/schedule/payments/plans/${id}`,
        isSecure: true,
        data,
        workspaceScope,
        schoolId,
      });
      const json = await res?.json();
      checkResponse(json);
      return json;
    },
    [workspaceScope, schoolId],
  );

  const deletePlan = useCallback(async (id: number) => {
    const res = await fetchDelete({
      path: `/schedule/payments/plans/${id}`,
      isSecure: true,
      workspaceScope,
      schoolId,
    });
    const json = await res?.json();
    checkResponse(json);
    return json;
  }, [workspaceScope, schoolId]);

  const recordPayment = useCallback(
    async (id: number, data?: Record<string, unknown>) => {
      const res = await fetchPostJson({
        path: `/schedule/payments/plans/${id}/record`,
        isSecure: true,
        data: data || {},
        workspaceScope,
        schoolId,
      });
      const json = await res?.json();
      checkResponse(json);
      return json;
    },
    [workspaceScope, schoolId],
  );

  return {
    plans,
    stats,
    loading,
    statsLoading,
    loadPlans,
    loadStats,
    createPlan,
    updatePlan,
    deletePlan,
    recordPayment,
  };
};
