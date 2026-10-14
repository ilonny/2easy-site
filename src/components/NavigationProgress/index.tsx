"use client";

import NextTopLoaderImport from "nextjs-toploader";

type LoaderComponent = (props: {
  color?: string;
  height?: number;
  showSpinner?: boolean;
  crawl?: boolean;
}) => JSX.Element | null;

/**
 * nextjs-toploader is CJS (`module.exports = { default: fn }`).
 * After bundling, the default import may be the function OR the module object —
 * using the wrong shape crashes React with "Element type is invalid".
 */
function resolveTopLoader(): LoaderComponent | null {
  const mod = NextTopLoaderImport as unknown as LoaderComponent & {
    default?: LoaderComponent;
  };
  if (typeof mod === "function") return mod;
  if (mod && typeof mod.default === "function") return mod.default;
  return null;
}

const TopLoader = resolveTopLoader();

/** Thin top progress bar for App Router client navigations. */
export function NavigationProgress() {
  if (!TopLoader) return null;
  return <TopLoader color="#20107D" height={3} showSpinner={false} crawl />;
}
