export const SCHOOL_TABS = [
  "stats",
  "schedule",
  "members",
  "students",
  "materials",
  "settings",
] as const;

export type SchoolTab = (typeof SCHOOL_TABS)[number];

const STORAGE_KEY = "2easy:school:lastTab";

export const isSchoolTab = (value: unknown): value is SchoolTab =>
  typeof value === "string" && (SCHOOL_TABS as readonly string[]).includes(value);

export const readLastSchoolTab = (): SchoolTab | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isSchoolTab(raw) ? raw : null;
  } catch {
    return null;
  }
};

export const writeLastSchoolTab = (tab: SchoolTab) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, tab);
  } catch {
    // private mode
  }
};

export const schoolHomePath = (tab?: SchoolTab | null) =>
  `/school?tab=${isSchoolTab(tab) ? tab : readLastSchoolTab() || "stats"}`;

export const tabFromSchoolPath = (path: string): SchoolTab | null => {
  try {
    const url = new URL(path, "https://2easy.local");
    if (url.pathname !== "/school") return null;
    const tab = url.searchParams.get("tab");
    return isSchoolTab(tab) ? tab : null;
  } catch {
    return null;
  }
};
