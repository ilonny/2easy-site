/** Temporary AI allowlist — only these teacher accounts see/use AI features */
export const AI_ALLOWED_USER_IDS = [18, 3332, 9, 14, 1177] as const;

export const canUseAi = (profile?: {
  id?: number | string | null;
  user_id?: number | string | null;
} | null): boolean => {
  const id = Number(profile?.id ?? profile?.user_id);
  return (
    Number.isFinite(id) &&
    (AI_ALLOWED_USER_IDS as readonly number[]).includes(id)
  );
};
