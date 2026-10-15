/**
 * Module-level video-call state. Survives React remounts of layout providers
 * during Next.js client navigations (useState in providers does not).
 */

type Listener = () => void;

const STORAGE_KEY = "2easy.videoCall.open";

let isOpen = false;
const listeners = new Set<Listener>();

function readStoredOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeStoredOpen(open: boolean) {
  if (typeof window === "undefined") return;
  try {
    if (open) sessionStorage.setItem(STORAGE_KEY, "1");
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

/** Hydrate from sessionStorage once on the client. */
export function hydrateVideoCallStore() {
  if (typeof window === "undefined") return;
  const stored = readStoredOpen();
  if (stored !== isOpen) {
    isOpen = stored;
    listeners.forEach((l) => l());
  }
}

export function getVideoCallOpen() {
  return isOpen;
}

export function setVideoCallOpen(open: boolean) {
  if (isOpen === open) return;
  isOpen = open;
  writeStoredOpen(open);
  listeners.forEach((l) => l());
}

export function subscribeVideoCall(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getVideoCallServerSnapshot() {
  return false;
}
