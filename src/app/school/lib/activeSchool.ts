import {
  readFromLocalStorage,
  writeToLocalStorage,
} from "@/auth/utils";

const STORAGE_KEY = "activeSchoolId";
const SCOPE_STORAGE_KEY = "activeWorkspaceScope";

export type WorkspaceContext =
  | { scope: "personal"; schoolId: null }
  | { scope: "school"; schoolId: number };

export const getActiveWorkspace = (): WorkspaceContext => {
  try {
    const scope = readFromLocalStorage(SCOPE_STORAGE_KEY);
    const schoolId = getActiveSchoolId();
    if (scope === "personal") return { scope: "personal", schoolId: null };
    if (schoolId) return { scope: "school", schoolId };
  } catch {
    // Fall through to the backwards-compatible personal default.
  }
  return { scope: "personal", schoolId: null };
};

export const setActiveWorkspace = (workspace: WorkspaceContext) => {
  writeToLocalStorage(SCOPE_STORAGE_KEY, workspace.scope);
  if (workspace.scope === "school") {
    writeToLocalStorage(STORAGE_KEY, String(workspace.schoolId));
  } else {
    writeToLocalStorage(STORAGE_KEY, "");
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("workspace-context-change", { detail: workspace }),
    );
  }
};

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
    setActiveWorkspace({ scope: "personal", schoolId: null });
    return;
  }
  setActiveWorkspace({ scope: "school", schoolId });
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
