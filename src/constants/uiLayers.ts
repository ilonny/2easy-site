/**
 * Stacking layers for the fixed mobile header vs overlays (modals, chat).
 * Keep in sync with CSS vars in globals.css (--site-header-z, --overlay-above-header-z).
 */

/** Fixed site header on mobile (`Header`). */
export const SITE_HEADER_Z_CLASS = "z-[60]";

/** Sticky CTAs that must sit just below the fixed header (min-h ~80px). */
export const BELOW_SITE_HEADER_STICKY_TOP_CLASS = "top-[88px]";

/**
 * NextUI modal wrappers / floating panels that must paint above the header.
 * Default NextUI modal is z-50; header is z-60.
 */
export const OVERLAY_ABOVE_HEADER_Z_CLASS = "z-[70]";
