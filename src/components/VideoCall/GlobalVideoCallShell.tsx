"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Draggable from "react-draggable";
import CloseIcon from "@/assets/icons/close.svg";
import { toast } from "react-toastify";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useVideoCall } from "./VideoCallContext";

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

const JITSI_DOMAIN = "meet.2easyeng.com";
const MIN_W = 280;
const MIN_H = 200;
const MAX_W = 600;
const MAX_H = 500;
const DEFAULT_W = 360;
const DEFAULT_H = 380;
const MOBILE_BREAKPOINT = 640;
const DEFAULT_W_MOBILE = 320;
const DEFAULT_H_MOBILE = 300;

function getDefaultVideoSize(): { w: number; h: number } {
  if (typeof window === "undefined") return { w: DEFAULT_W, h: DEFAULT_H };
  if (window.innerWidth > MOBILE_BREAKPOINT) {
    return { w: DEFAULT_W, h: DEFAULT_H };
  }
  const w = Math.min(DEFAULT_W_MOBILE, Math.max(MIN_W, window.innerWidth - 16));
  const h = Math.min(
    DEFAULT_H_MOBILE,
    Math.max(MIN_H, Math.floor(window.innerHeight * 0.42))
  );
  return { w, h };
}

const ResizeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      d="M3 11V8M6 11V5M9 11V2M11 11H8M11 8H5M11 5H2"
      strokeLinecap="round"
    />
  </svg>
);

function loadJitsiScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
  const scriptUrl = `https://${JITSI_DOMAIN}/external_api.js`;
  if (document.querySelector(`script[src="${scriptUrl}"]`)) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptUrl;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script_load_failed"));
    document.body.appendChild(script);
  });
}

/**
 * App-scoped floating Jitsi window. Stays mounted across route changes
 * while VideoCallProvider.isOpen is true.
 */
export const GlobalVideoCallShell: FC = () => {
  const { isOpen, roomName, displayName, close } = useVideoCall();
  const [isReady, setIsReady] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [isResizing, setIsResizing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resizeStartRef = useRef({
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    posX: 0,
    posY: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const boundsRef = useRef<HTMLDivElement>(null);
  const displayNameRef = useRef(displayName);
  displayNameRef.current = displayName;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Place the window once when the call opens (not on every re-render).
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (!isOpen) {
      setIsReady(false);
      wasOpenRef.current = false;
      return;
    }
    if (wasOpenRef.current) return;
    wasOpenRef.current = true;
    const { w, h } = getDefaultVideoSize();
    setPosition({
      x: Math.max(0, window.innerWidth - w - 16),
      y: Math.max(0, window.innerHeight - h - 100),
    });
    setSize({ w, h });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    loadJitsiScript()
      .then(() => {
        if (!cancelled) setIsReady(true);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error(i18n.t("videoCall.loadError"));
        close();
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, close]);

  useEffect(() => {
    if (!isOpen || !isReady || !roomName) return;

    let cancelled = false;
    let api: JitsiApi | null = null;
    let raf = 0;
    let attempts = 0;

    const start = () => {
      const parent = containerRef.current;
      if (!parent || !window.JitsiMeetExternalAPI) {
        attempts += 1;
        if (!cancelled && attempts < 60) raf = requestAnimationFrame(start);
        return;
      }

      api = new window.JitsiMeetExternalAPI!(JITSI_DOMAIN, {
        roomName,
        width: "100%",
        height: "100%",
        parentNode: parent,
        userInfo: { displayName: displayNameRef.current },
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
      apiRef.current = api;
    };

    raf = requestAnimationFrame(start);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      if (api) {
        api.executeCommand?.("hangup");
        api.dispose();
        if (apiRef.current === api) apiRef.current = null;
      }
    };
  }, [isOpen, isReady, roomName]);

  const onClose = useCallback(() => {
    close();
  }, [close]);

  const beginResize = useCallback(
    (clientX: number, clientY: number) => {
      setIsResizing(true);
      resizeStartRef.current = {
        x: clientX,
        y: clientY,
        w: size.w,
        h: size.h,
        posX: position.x,
        posY: position.y,
      };
    },
    [size, position]
  );

  const onResizeStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if ("touches" in e && e.touches.length > 0) {
        beginResize(e.touches[0].clientX, e.touches[0].clientY);
      } else if ("clientX" in e) {
        beginResize(e.clientX, e.clientY);
      }
    },
    [beginResize]
  );

  useEffect(() => {
    if (!isResizing) return;
    const applyMove = (clientX: number, clientY: number) => {
      const isMobile =
        typeof window !== "undefined" && window.innerWidth <= MOBILE_BREAKPOINT;
      const capW = isMobile ? Math.min(MAX_W, window.innerWidth - 8) : MAX_W;
      const capH = isMobile
        ? Math.min(MAX_H, window.innerHeight - 48)
        : MAX_H;
      const dx = clientX - resizeStartRef.current.x;
      const dy = clientY - resizeStartRef.current.y;
      const newW = Math.min(
        capW,
        Math.max(MIN_W, resizeStartRef.current.w - dx)
      );
      const newH = Math.min(
        capH,
        Math.max(MIN_H, resizeStartRef.current.h - dy)
      );
      const actualDx = resizeStartRef.current.w - newW;
      const actualDy = resizeStartRef.current.h - newH;
      setSize({ w: newW, h: newH });
      setPosition({
        x: resizeStartRef.current.posX + actualDx,
        y: resizeStartRef.current.posY + actualDy,
      });
    };
    const onMouseMove = (e: MouseEvent) => applyMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault();
        applyMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onUp);
    document.body.style.cursor = "nw-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  if (!mounted || !isOpen) return null;

  const headerH = 40;

  const overlay = (
    <div
      ref={boundsRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          pointerEvents: "none",
          width: "100%",
          height: "100%",
        }}
      >
        <Draggable
          handle=".video-call-drag-handle"
          bounds="parent"
          position={position}
          onDrag={(_, data) => setPosition({ x: data.x, y: data.y })}
        >
          <div
            style={{
              position: "absolute",
              width: size.w,
              minHeight: size.h + headerH,
              backgroundColor: "#1a1a2e",
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 10px",
                backgroundColor: "rgba(0,0,0,0.35)",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                gap: 8,
              }}
            >
              <div
                onMouseDown={onResizeStart}
                onTouchStart={onResizeStart}
                title={i18n.t("videoCall.resize")}
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  cursor: "nw-resize",
                  touchAction: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 4,
                  color: "rgba(255,255,255,0.5)",
                  background: "rgba(255,255,255,0.08)",
                }}
              >
                <ResizeIcon />
              </div>
              <div
                className="video-call-drag-handle"
                style={{
                  flex: 1,
                  cursor: "grab",
                  minWidth: 0,
                  touchAction: "none",
                }}
              >
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>
                  <T k="videoCall.title" />
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                title={i18n.t("videoCall.close")}
                style={{
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  padding: 4,
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Image
                  src={CloseIcon}
                  alt={i18n.t("videoCall.close")}
                  width={16}
                  height={16}
                />
              </button>
            </div>
            <div
              style={{
                flex: 1,
                position: "relative",
                minHeight: size.h,
                height: size.h,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#0f0f1a",
              }}
            >
              <div
                ref={containerRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                }}
              >
                {!isReady && (
                  <span
                    style={{
                      position: "absolute",
                      color: "rgba(255,255,255,0.6)",
                      fontSize: 14,
                    }}
                  >
                    <T k="videoCall.loading" />
                  </span>
                )}
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
};
