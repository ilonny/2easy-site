"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, type ReactNode } from "react";
import {
  CatalogWorkspaceProvider,
  catalogWorkspaceFromSearchParams,
} from "./catalogWorkspace";

export const WorkspaceFromUrlProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const value = useMemo(
    () => catalogWorkspaceFromSearchParams(searchParams),
    [searchParams],
  );
  return (
    <CatalogWorkspaceProvider value={value}>{children}</CatalogWorkspaceProvider>
  );
};
