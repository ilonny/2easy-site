const SCHOOL_PAID_TIERS = new Set(["S", "M", "L", "XL"]);

type SchoolMembership = {
  subscription?: {
    id?: number;
    tier?: string | null;
    dateEnd?: string | Date | null;
  } | null;
};

/**
 * School plan uses the same materials gate as a personal subscription:
 * TRIAL → free 2easy lessons only, paid tier → the full catalog.
 */
export const subscriptionFromSchoolMemberships = (
  schools: SchoolMembership[] | null | undefined,
) => {
  const now = Date.now();
  const active = (schools || [])
    .map((school) => school.subscription)
    .filter((sub) => {
      if (!sub?.dateEnd) return false;
      const end = new Date(sub.dateEnd).getTime();
      return Number.isFinite(end) && end >= now;
    });
  const paid = active.find((sub) =>
    SCHOOL_PAID_TIERS.has(String(sub?.tier || "").trim().toUpperCase()),
  );
  const trial = active.find(
    (sub) => String(sub?.tier || "").trim().toUpperCase() === "TRIAL",
  );
  const chosen = paid || trial;
  if (!chosen) return null;
  return {
    success: true as const,
    id: chosen.id,
    subscribe_type_id: paid ? 2 : 1,
    dateEnd: chosen.dateEnd,
    isSchoolSubscription: true,
    school_tier: chosen.tier,
    school_materials_mode: paid ? ("paid" as const) : ("trial" as const),
  };
};
