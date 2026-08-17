/**
 * Stacking layers for the fixed mobile header vs overlays (modals, chat, menu).
 * Keep in sync with CSS in globals.css (--site-header-z, --overlay-above-header-z, --site-menu-z).
 *
 * These are real CSS classes (not Tailwind z-[N] strings) so they always apply:
 * Tailwind does not scan src/constants, so z-[60] here would never be generated.
 *
 * Desktop header is static — overlay class only raises z-index below lg.
 */

/** Fixed site header on mobile (`Header` / `.site-header-bar`). */
export const SITE_HEADER_Z_CLASS = "site-header-bar";

/** Sticky CTAs that must sit just below the fixed header (min-h ~80px). */
export const BELOW_SITE_HEADER_STICKY_TOP_CLASS = "top-[88px]";

/**
 * NextUI modal wrappers that must paint above the mobile header.
 * Default NextUI modal is z-50; mobile header is 60.
 */
export const OVERLAY_ABOVE_HEADER_Z_CLASS = "site-overlay-layer";
