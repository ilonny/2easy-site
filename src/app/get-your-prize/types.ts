export type PrizeKind =
  | "discount"
  | "days"
  | "upgrade_discount"
  | "renew_discount";

export type PlanType = "month" | "3month" | "year";

export type RouletteSector = {
  id: string;
  label: string;
  shortLabel: string;
  kind: PrizeKind;
  plan: PlanType | null;
  percent: number | null;
  days: number | null;
  color: string;
  index: number;
};

export type RouletteSpin = {
  id: number;
  segment: string;
  prizeId: string;
  prizeKind: PrizeKind;
  promocode: string | null;
  status: string;
  appliedAt: string | null;
  expiresAt: string | null;
  meta: Record<string, unknown>;
  prize: {
    id: string;
    label: string;
    shortLabel: string;
    kind: PrizeKind;
    plan: PlanType | null;
    percent: number | null;
    days: number | null;
    color: string;
  } | null;
};

export type RouletteStatusResponse = {
  success: boolean;
  canSpin: boolean;
  segment: string;
  sectors: RouletteSector[];
  previewSectors: RouletteSector[];
  spin: RouletteSpin | null;
  subscription: {
    subscribe_type_id: number;
    plan: PlanType | null;
    dateEnd: string;
    unusedDays: number;
  } | null;
};
