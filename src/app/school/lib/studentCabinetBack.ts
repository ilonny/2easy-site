const keyFor = (studentId: string | number) =>
  `2easy:studentCabinetBack:${studentId}`;

export type StudentCabinetBack = {
  teacherUserId: number | null;
  returnTo: string;
};

export const rememberStudentCabinetBack = (
  studentId: string | number,
  value: StudentCabinetBack,
) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(keyFor(studentId), JSON.stringify(value));
  } catch {
    // private mode
  }
};

export const readStudentCabinetBack = (
  studentId: string | number,
): StudentCabinetBack | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(keyFor(studentId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StudentCabinetBack;
    const teacherUserId = Number(parsed?.teacherUserId);
    return {
      teacherUserId:
        Number.isFinite(teacherUserId) && teacherUserId > 0
          ? teacherUserId
          : null,
      returnTo:
        typeof parsed?.returnTo === "string" && parsed.returnTo.startsWith("/")
          ? parsed.returnTo
          : "",
    };
  } catch {
    return null;
  }
};

export const teacherCabinetPath = (teacherUserId: number) =>
  `/school/staff/${teacherUserId}?returnTo=${encodeURIComponent(
    "/school?tab=members",
  )}`;

export const teacherIdFromReturnTo = (value: string | null | undefined) => {
  const match = String(value || "").match(/^\/school\/staff\/(\d+)(?:\?|$)/);
  return match ? Number(match[1]) : 0;
};
