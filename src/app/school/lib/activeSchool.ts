import {
  readFromLocalStorage,
  writeToLocalStorage,
} from "@/auth/utils";

const STORAGE_KEY = "activeSchoolId";

export const getActiveSchoolId = (): number | null => {
  try {
    const raw = readFromLocalStorage(STORAGE_KEY);
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
};

export const setActiveSchoolId = (schoolId: number | null) => {
  if (schoolId == null) {
    writeToLocalStorage(STORAGE_KEY, "");
    return;
  }
  writeToLocalStorage(STORAGE_KEY, String(schoolId));
};

/** Keep selection valid against current memberships; pick first if missing. */
export const resolveActiveSchoolId = (
  schoolIds: number[],
  preferred?: number | null,
): number | null => {
  if (!schoolIds.length) {
    setActiveSchoolId(null);
    return null;
  }
  const stored = preferred ?? getActiveSchoolId();
  if (stored && schoolIds.includes(stored)) {
    setActiveSchoolId(stored);
    return stored;
  }
  setActiveSchoolId(schoolIds[0]);
  return schoolIds[0];
};
