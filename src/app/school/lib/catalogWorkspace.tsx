"use client";

import { createContext, useContext, type ReactNode } from "react";

export type CatalogWorkspaceValue = {
  workspaceScope?: "personal" | "school";
  schoolId?: number | null;
  teacherUserId?: number | null;
};

export const PERSONAL_CATALOG_WORKSPACE: CatalogWorkspaceValue = {
  workspaceScope: "personal",
};

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

export const catalogFetchParams = (workspace: CatalogWorkspaceValue) => ({
  workspaceScope: workspace.workspaceScope,
  schoolId: workspace.schoolId ?? undefined,
});

export const withCatalogQuery = (
  path: string,
  workspace: CatalogWorkspaceValue,
) => {
  if (!workspace.teacherUserId) return path;
  const join = path.includes("?") ? "&" : "?";
  return `${path}${join}teacher_user_id=${workspace.teacherUserId}`;
};
