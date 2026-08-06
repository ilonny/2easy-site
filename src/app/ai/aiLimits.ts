import { checkResponse, fetchGet } from "@/api";
import i18n from "@/i18n/config";
import { toast } from "react-toastify";

export type TAiLimitCategory =
  | "generate_lesson"
  | "suggest_topic"
  | "refine_exercise";

export type TAiLimitStatus = {
  limit: number;
  used: number;
  remaining: number;
  yearMonth?: string;
};

export type TAiLimitsMap = Partial<Record<TAiLimitCategory, TAiLimitStatus>>;

export const AI_MONTHLY_LIMIT_CODE = "AI_MONTHLY_LIMIT_EXCEEDED";

export const formatAiAvailableLimit = (remaining: number | null | undefined) =>
  `${i18n.t("ai.availableLimit", {
    defaultValue: "Доступный лимит запросов:",
  })} ${remaining ?? "—"}`;

export const handleAiLimitError = (json: {
  success?: boolean;
  code?: string;
  limitExceeded?: boolean;
  message?: string;
  needSubscription?: boolean;
  needRedirect?: boolean | string;
  status?: number;
}): boolean => {
  if (
    json?.code === AI_MONTHLY_LIMIT_CODE ||
    json?.limitExceeded === true
  ) {
    toast(
      i18n.t("ai.monthlyLimitExceeded", {
        defaultValue: "Лимит в этом месяце превышен",
      }),
      { type: "error" },
    );
    return true;
  }
  checkResponse(json as Parameters<typeof checkResponse>[0]);
  return false;
};

export const fetchAiLimits = async (): Promise<TAiLimitsMap | null> => {
  try {
    const res = await fetchGet({ path: "/ai/meta", isSecure: true });
    const json = await res.json();
    if (!json?.success || !json?.limits) return null;
    return json.limits as TAiLimitsMap;
  } catch {
    return null;
  }
};

export const remainingFromResponse = (
  json: { aiLimit?: { remaining?: number; category?: string } },
  category: TAiLimitCategory,
): number | null => {
  if (
    json?.aiLimit &&
    (json.aiLimit.category === category || !json.aiLimit.category)
  ) {
    return Number(json.aiLimit.remaining);
  }
  return null;
};
