/**
 * Stacking layers for the fixed mobile header vs overlays (modals, chat).
 * Keep in sync with CSS vars in globals.css (--site-header-z, --overlay-above-header-z).
 *
 * Desktop header is static — do not raise modal z-index site-wide on lg+.
 */

/** Fixed site header on mobile (`Header`). Desktop uses `lg:static lg:z-auto`. */
export const SITE_HEADER_Z_CLASS = "z-[60]";

/** Sticky CTAs that must sit just below the fixed header (min-h ~80px). */
export const BELOW_SITE_HEADER_STICKY_TOP_CLASS = "top-[88px]";

/**
 * NextUI modal wrappers that must paint above the mobile header.
 * Default NextUI modal is z-50; mobile header is z-60. Desktop stays z-50.
 */
export const OVERLAY_ABOVE_HEADER_Z_CLASS = "max-lg:z-[70]";
