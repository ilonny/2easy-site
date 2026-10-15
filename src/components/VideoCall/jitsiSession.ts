/**
 * Singleton Jitsi session — owned outside React so soft navigations /
 * provider remounts do not hang up the call.
 */

type JitsiApi = {
  dispose: () => void;
  executeCommand?: (cmd: string) => void;
  getIFrame?: () => HTMLIFrameElement;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (
      domain: string,
      options: Record<string, unknown>
    ) => JitsiApi;
  }
}

export const JITSI_DOMAIN = "meet.2easyeng.com";

type Session = {
  api: JitsiApi;
  roomName: string;
  host: HTMLDivElement;
};

let session: Session | null = null;
let scriptPromise: Promise<void> | null = null;

export function loadJitsiScript(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("no_window"));
  }
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  const scriptUrl = `https://${JITSI_DOMAIN}/external_api.js`;
  const existing = document.querySelector(`script[src="${scriptUrl}"]`);
  if (existing) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.JitsiMeetExternalAPI) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("script_load_failed"))
      );
    });
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("script_load_failed"));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

function ensureHost(): HTMLDivElement {
  const id = "2easy-jitsi-persistent-host";
  let host = document.getElementById(id) as HTMLDivElement | null;
  if (!host) {
    host = document.createElement("div");
    host.id = id;
    host.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;";
    // Park off-screen until a React shell mounts and reparents it.
    host.style.position = "fixed";
    host.style.left = "-9999px";
    host.style.top = "0";
    host.style.width = "1px";
    host.style.height = "1px";
    host.style.overflow = "hidden";
    document.body.appendChild(host);
  }
  return host;
}

export function getJitsiSession() {
  return session;
}

export function attachJitsiHost(container: HTMLElement) {
  const host = session?.host ?? ensureHost();
  if (host.parentElement !== container) {
    host.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;";
    container.appendChild(host);
  }
  return host;
}

export function parkJitsiHost() {
  if (!session?.host) return;
  const host = session.host;
  host.style.position = "fixed";
  host.style.left = "-9999px";
  host.style.top = "0";
  host.style.width = "1px";
  host.style.height = "1px";
  host.style.overflow = "hidden";
  if (host.parentElement !== document.body) {
    document.body.appendChild(host);
  }
}

export async function ensureJitsiSession(opts: {
  roomName: string;
  displayName: string;
}): Promise<JitsiApi> {
  await loadJitsiScript();
  if (!window.JitsiMeetExternalAPI) {
    throw new Error("jitsi_api_missing");
  }

  if (session && session.roomName === opts.roomName) {
    return session.api;
  }

  // Room changed — tear down previous conference.
  if (session) {
    hangupJitsiSession();
  }

  const host = ensureHost();
  // Clear leftover iframe nodes from a prior dispose race.
  host.replaceChildren();

  const api = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
    roomName: opts.roomName,
    width: "100%",
    height: "100%",
    parentNode: host,
    userInfo: { displayName: opts.displayName },
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      prejoinPageEnabled: false,
      enableLobby: false,
      disableDeepLinking: true,
      p2p: { enabled: false },
    },
    interfaceConfigOverwrite: {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      TOOLBAR_ALWAYS_VISIBLE: false,
      MOBILE_APP_PROMO: false,
    },
    onApiReady: (readyApi: JitsiApi) => {
      const iframe = readyApi.getIFrame?.();
      if (iframe) {
        iframe.setAttribute(
          "allow",
          "camera; microphone; fullscreen; display-capture"
        );
        iframe.setAttribute("allowfullscreen", "true");
        iframe.setAttribute("webkitallowfullscreen", "true");
        iframe.setAttribute("playsinline", "true");
        iframe.style.width = "100%";
        iframe.style.height = "100%";
      }
    },
  });

  session = { api, roomName: opts.roomName, host };
  return api;
}

/** Explicit hangup — only call from user close / logout. */
export function hangupJitsiSession() {
  const current = session;
  session = null;
  if (!current) return;
  try {
    current.api.executeCommand?.("hangup");
  } catch {
    /* ignore */
  }
  try {
    current.api.dispose();
  } catch {
    /* ignore */
  }
  try {
    current.host.replaceChildren();
    if (current.host.parentElement) {
      current.host.parentElement.removeChild(current.host);
    }
  } catch {
    /* ignore */
  }
}
