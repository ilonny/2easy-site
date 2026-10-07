import { useEffect } from "react";

const BASE_WIDTH = 1440;
const MAX_WIDTH = 1920;

// Above 1440px the landing is the 1440 layout scaled up, reaching 1920px at full HD.
export const useLandingZoom = () => {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      const width = Math.min(root.clientWidth, MAX_WIDTH);
      const zoom = Math.max(1, width / BASE_WIDTH);
      root.style.setProperty("--landing-zoom", zoom.toFixed(4));
    };
    update();
    root.classList.add("landing-zoom");
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      root.classList.remove("landing-zoom");
      root.style.removeProperty("--landing-zoom");
    };
  }, []);
};

/** getBoundingClientRect units per layout pixel of an element. */
export const getRenderScale = (element: HTMLElement) =>
  element.offsetHeight
    ? element.getBoundingClientRect().height / element.offsetHeight
    : 1;

/**
 * Screen pixels (innerHeight, scrollY) per getBoundingClientRect unit.
 * Browsers disagree on whether client rects inside a zoomed element are zoomed,
 * so it is derived from the actual zoom and the measured render scale.
 */
export const getClientScale = (element: HTMLElement) => {
  const zoom = parseFloat(getComputedStyle(document.body).zoom) || 1;
  return zoom / getRenderScale(element);
};
