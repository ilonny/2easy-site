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
  const query = searchParams?.toString() ?? "";
  const value = useMemo(
    () => catalogWorkspaceFromSearchParams(new URLSearchParams(query)),
    [query],
  );
  return (
    <CatalogWorkspaceProvider value={value}>{children}</CatalogWorkspaceProvider>
  );
};
