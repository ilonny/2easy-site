/**
 * Optional allowlist for AI support chat.
 * Empty NEXT_PUBLIC_SUPPORT_ALLOWLIST_USER_IDS → all authenticated teachers.
 */
export const getSupportAllowlistUserIds = (): number[] => {
  const raw = String(
    process.env.NEXT_PUBLIC_SUPPORT_ALLOWLIST_USER_IDS || "",
  ).trim();
  if (!raw) return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
};

/** True when this teacher should use the in-house AI support widget. */
export const isAiSupportEnabledForUser = (
  userId?: number | string | null,
): boolean => {
  if (userId == null || userId === "") return false;
  const id = Number(userId);
  if (!Number.isFinite(id) || id <= 0) return false;
  const allow = getSupportAllowlistUserIds();
  if (!allow.length) return true;
  return allow.includes(id);
};

/** @deprecated use isAiSupportEnabledForUser */
export const isAiSupportPilotUser = isAiSupportEnabledForUser;

/** Resolve teacher user id from profile (`id` or legacy `user_id`). */
export const getSupportUserId = (profile?: {
  id?: number | string | null;
  user_id?: number | string | null;
} | null): number | null => {
  const raw = profile?.id ?? profile?.user_id;
  if (raw == null || raw === "") return null;
  const id = Number(raw);
  return Number.isFinite(id) && id > 0 ? id : null;
};
