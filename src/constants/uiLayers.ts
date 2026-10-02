/**
 * Stacking layers for the site header vs overlays (modals, chat, menu).
 * Keep in sync with CSS in globals.css (--site-header-z, --site-header-desktop-z,
 * --overlay-above-header-z, --site-menu-z).
 *
 * These are real CSS classes (not Tailwind z-[N] strings) so they always apply.
 *
 * The header is fixed below lg and sticky from lg up; its height is published
 * as `--site-header-h` so sticky elements can sit right under it.
 */

/** Fixed site header on mobile (`Header` / `.site-header-bar`). */
export const SITE_HEADER_Z_CLASS = "site-header-bar";

/** Sticky CTAs that must sit just below the pinned header. */
export const BELOW_SITE_HEADER_STICKY_TOP_CLASS =
  "top-[calc(var(--site-header-h)+8px)]";

/** Height of the pinned site header in layout pixels. */
export const getSiteHeaderHeight = () =>
  parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue(
      "--site-header-h",
    ),
  ) || 0;

/**
 * NextUI modal wrappers that must paint above the mobile header.
 * Default NextUI modal is z-50; mobile header is 60.
 */
export const OVERLAY_ABOVE_HEADER_Z_CLASS = "site-overlay-layer";
