"use client";

import { createContext, useContext, type ReactNode } from "react";

export type CatalogWorkspaceValue = {
  workspaceScope?: "personal" | "school";
  schoolId?: number | null;
  teacherUserId?: number | null;
  /** Student pickers (attach) can use school students while materials stay personal. */
  studentScope?: "personal" | "school";
};

/** Regular teacher catalog: no workspace headers (legacy / old API). */
export const PERSONAL_CATALOG_WORKSPACE: CatalogWorkspaceValue = {};

const CatalogWorkspaceContext = createContext<CatalogWorkspaceValue>({});

export const CatalogWorkspaceProvider = ({
  value,
  children,
}: {
  value: CatalogWorkspaceValue;
  children: ReactNode;
}) => (
  <CatalogWorkspaceContext.Provider value={value}>
    {children}
  </CatalogWorkspaceContext.Provider>
);

export const useCatalogWorkspace = () => useContext(CatalogWorkspaceContext);

export const catalogFetchParams = (workspace: CatalogWorkspaceValue) => {
  if (workspace.workspaceScope === "school") {
    return {
      workspaceScope: "school" as const,
      schoolId: workspace.schoolId ?? undefined,
      actingTeacherUserId: workspace.teacherUserId ?? undefined,
    };
  }
  // Personal catalog must not send X-School-Id (that would force school mode).
  if (
    workspace.workspaceScope === "personal" ||
    Number(workspace.teacherUserId) > 0
  ) {
    return {
      workspaceScope: "personal" as const,
      schoolId: undefined,
      actingTeacherUserId: workspace.teacherUserId ?? undefined,
    };
  }
  return {
    actingTeacherUserId: workspace.teacherUserId ?? undefined,
  };
};

export const studentListFetchParams = (workspace: CatalogWorkspaceValue) => {
  const schoolId = Number(workspace.schoolId);
  if (workspace.studentScope === "school" && schoolId > 0) {
    return catalogFetchParams({
      workspaceScope: "school",
      schoolId,
      teacherUserId: workspace.teacherUserId,
    });
  }
  return catalogFetchParams(workspace);
};

export const withCatalogQuery = (
  path: string,
  workspace: CatalogWorkspaceValue,
) => {
  if (!workspace.teacherUserId) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}teacher_user_id=${workspace.teacherUserId}`;
};

export const catalogWorkspaceFromSearchParams = (
  searchParams: { get: (key: string) => string | null } | null | undefined,
): CatalogWorkspaceValue => {
  if (!searchParams) return {};
  const teacherUserId = Number(searchParams.get("teacher_user_id") || 0);
  const schoolId = Number(searchParams.get("schoolId") || 0);
  const scope = String(searchParams.get("workspace") || "").toLowerCase();
  const value: CatalogWorkspaceValue = {};
  if (scope === "personal") {
    value.workspaceScope = "personal";
  } else if (scope === "school" || schoolId > 0) {
    value.workspaceScope = "school";
    if (schoolId > 0) value.schoolId = schoolId;
  }
  if (teacherUserId > 0) value.teacherUserId = teacherUserId;
  return value;
};

export const withWorkspacePath = (
  path: string,
  workspace?: CatalogWorkspaceValue | null,
) => {
  if (
    !workspace?.workspaceScope &&
    !workspace?.schoolId &&
    !workspace?.teacherUserId
  ) {
    return path;
  }
  const [base, qs] = path.split("?");
  const params = new URLSearchParams(qs || "");
  if (workspace.workspaceScope) {
    params.set("workspace", workspace.workspaceScope);
  }
  const schoolId = Number(workspace.schoolId);
  if (workspace.workspaceScope !== "personal" && schoolId > 0) {
    params.set("schoolId", String(schoolId));
  } else {
    params.delete("schoolId");
  }
  const teacherId = Number(workspace.teacherUserId);
  if (teacherId > 0) params.set("teacher_user_id", String(teacherId));
  const next = params.toString();
  return next ? `${base}?${next}` : base;
};

export const hasCatalogWorkspace = (workspace?: CatalogWorkspaceValue | null) =>
  Boolean(
    workspace?.workspaceScope ||
      Number(workspace?.schoolId) > 0 ||
      Number(workspace?.teacherUserId) > 0,
  );
