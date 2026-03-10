"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Draggable from "react-draggable";
import CloseIcon from "@/assets/icons/close.svg";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { toast } from "react-toastify";

type JitsiApi = {
  dispose: () => void;
  executeCommand?: (cmd: string) => void;
};

declare global {
  interface Window {
    JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => JitsiApi;
  }
}

type TProps = {
  lessonId: string | string[];
};

const JITSI_DOMAIN = "meet.evolix.org";
const MIN_W = 280;
const MIN_H = 200;
const MAX_W = 600;
const MAX_H = 500;
const DEFAULT_W = 360;
const DEFAULT_H = 380;

const VideoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const ResizeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 11V8M6 11V5M9 11V2M11 11H8M11 8H5M11 5H2" strokeLinecap="round" />
  </svg>
);

export const VideoCall: FC<TProps> = ({ lessonId }) => {
  const { profile } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, posX: 0, posY: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<JitsiApi | null>(null);
  const boundsRef = useRef<HTMLDivElement>(null);

  const roomId = Array.isArray(lessonId) ? lessonId[0] : lessonId;
  const roomName = `2easy-lesson-${roomId}`;
  const displayName =
    [profile?.name, profile?.surname].filter(Boolean).join(" ") || profile?.login || "Участник";

  const loadScript = useCallback((): Promise<void> => {
    if (typeof window === "undefined") return Promise.reject(new Error("no_window"));
    const scriptUrl = `https://${JITSI_DOMAIN}/external_api.js`;
    if (document.querySelector(`script[src="${scriptUrl}"]`)) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = scriptUrl;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("script_load_failed"));
      document.body.appendChild(script);
    });
  }, []);

  const onOpen = useCallback(() => {
    if (!roomId) return;
    setPosition({
      x: typeof window !== "undefined" ? Math.max(0, window.innerWidth - DEFAULT_W - 40) : 100,
      y: typeof window !== "undefined" ? Math.max(0, window.innerHeight - DEFAULT_H - 120) : 100,
    });
    setSize({ w: DEFAULT_W, h: DEFAULT_H });
    setIsOpen(true);
  }, [roomId]);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    loadScript()
      .then(() => setIsReady(true))
      .catch(() => {
        toast.error("Не удалось загрузить видеосвязь");
        setIsOpen(false);
      });
  }, [isOpen, loadScript]);

  useEffect(() => {
    if (!isReady || !containerRef.current || !window.JitsiMeetExternalAPI) return;

    const options = {
      roomName,
      width: "100%",
      height: "100%",
      parentNode: containerRef.current,
      userInfo: { displayName },
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        prejoinPageEnabled: false,
        enableLobby: false,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_ALWAYS_VISIBLE: false,
      },
    };

    const api = new window.JitsiMeetExternalAPI!(JITSI_DOMAIN, options);
    apiRef.current = api;

    return () => {
      api.dispose();
      apiRef.current = null;
    };
  }, [isReady, roomName, displayName]);

  const onClose = useCallback(() => {
    const api = apiRef.current;
    if (api) {
      api.executeCommand?.("hangup");
      api.dispose();
      apiRef.current = null;
    }
    setIsOpen(false);
    setIsReady(false);
  }, []);

  const onResizeStart = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      resizeStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        w: size.w,
        h: size.h,
        posX: position.x,
        posY: position.y,
      };
    },
    [size, position]
  );

  useEffect(() => {
    if (!isResizing) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - resizeStartRef.current.x;
      const dy = e.clientY - resizeStartRef.current.y;
      const newW = Math.min(MAX_W, Math.max(MIN_W, resizeStartRef.current.w - dx));
      const newH = Math.min(MAX_H, Math.max(MIN_H, resizeStartRef.current.h - dy));
      const actualDx = resizeStartRef.current.w - newW;
      const actualDy = resizeStartRef.current.h - newH;
      setSize({ w: newW, h: newH });
      setPosition({
        x: resizeStartRef.current.posX + actualDx,
        y: resizeStartRef.current.posY + actualDy,
      });
    };
    const onUp = () => setIsResizing(false);
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.body.style.cursor = "nw-resize";
    document.body.style.userSelect = "none";
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  if (!isOpen) {
    return (
      <Button
        endContent={<VideoIcon />}
        color="primary"
        variant="light"
        onClick={onOpen}
        size="lg"
        style={{ minWidth: 300 }}
      >
        Видеосвязь
      </Button>
    );
  }

  const headerH = 40;

  return (
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
          pointerEvents: "auto",
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
                title="Изменить размер"
                style={{
                  flexShrink: 0,
                  width: 24,
                  height: 24,
                  cursor: "nw-resize",
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
                }}
              >
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 500 }}>Видеосвязь</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                title="Закрыть"
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
                <Image src={CloseIcon} alt="Закрыть" width={16} height={16} />
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
                    Загрузка...
                  </span>
                )}
              </div>
            </div>
          </div>
        </Draggable>
      </div>
    </div>
  );
};
