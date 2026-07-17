/* eslint-disable @next/next/no-img-element */
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { FC, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@nextui-org/react";
import { TAudioData } from "../../editor/Audio/types";
import "./styles.scss";
import { getImageNameFromPath } from "../../editor/mappers";
import { getImageUrl } from "@/app/editor/helpers";
import ScriptIcon from "@/assets/icons/audio_script_icon.svg";
import ScriptCloseIcon from "@/assets/icons/audio_script_close_icon.svg";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { T } from "@/i18n/T";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import { useTranslation } from "react-i18next";

/** Inline SVGs so play/pause/volume/loop work when Iconify API is blocked (corporate / CSP). */
const AP_ICON = {
  play: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5v14l11-7L8 5z" />
    </svg>
  ),
  pause: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
    </svg>
  ),
  volume: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0014 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
    </svg>
  ),
  volumeMute: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.5 12A4.5 4.5 0 0014 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.4 8.4 0 0021 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18V21h2.06a8.6 8.6 0 003.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
    </svg>
  ),
  loop: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
    </svg>
  ),
  loopOff: (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="currentColor"
      aria-hidden
    >
      <path d="M2.81 2.81L1.39 4.22 5.17 8H5v6h2V9.83l3.16 3.16-1.41 1.41L7 11l-4 4 4 4 1.41-1.41L3.83 13H7v4h10v-1.17l3.78 3.78 1.41-1.41L2.81 2.81zM19 10v2.17l2 2V10h-2zM7 4V2h10v6h-2V4H7z" />
    </svg>
  ),
  download: (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L11 13.586V4a1 1 0 011-1z" />
      <path d="M5 18a1 1 0 011-1h12a1 1 0 110 2H6a1 1 0 01-1-1z" />
    </svg>
  ),
} as const;

const triggerBlobDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const ensureAudioFilename = (name: string, mime?: string) => {
  if (/\.\w+$/.test(name)) return name;
  const ext = mime?.includes("wav")
    ? "wav"
    : mime?.includes("m4a") || mime?.includes("mp4")
      ? "m4a"
      : "mp3";
  return `${name || "audio"}.${ext}`;
};

type TProps = {
  data: TAudioData;
  isPreview?: boolean;
};

const extractAudioSrcFromHtml = (html?: string) => {
  if (!html || typeof html !== "string") return "";
  const m = html.match(/<audio\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/i);
  return m?.[1]?.trim() || "";
};

const stripAudioElements = (html?: string) => {
  if (!html || typeof html !== "string") return "";
  return html
    .replace(/<audio\b[^>]*>[\s\S]*?<\/audio>/gi, "")
    .replace(/<audio\b[^>]*\/\s*>/gi, "")
    .trim();
};

export const AudioExView: FC<TProps> = ({ data }) => {
  const { t } = useTranslation();
  const downloadLabel = t("common.download", { defaultValue: "Скачать" });
  const image = data?.images?.[0];

  const attachment = data?.editorImages?.[0];
  const pickedFile = attachment?.file;
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pickedFile instanceof Blob) {
      const u = URL.createObjectURL(pickedFile);
      setBlobUrl(u);
      return () => URL.revokeObjectURL(u);
    }
    setBlobUrl(null);
    return undefined;
  }, [pickedFile]);

  const audioSrcFromAttachment = useMemo(() => {
    if (attachment?.dataURL) return attachment.dataURL;
    if (blobUrl) return blobUrl;
    if (typeof attachment?.path === "string" && attachment.path) {
      return getImageUrl(attachment.path);
    }
    return "";
  }, [attachment?.dataURL, attachment?.path, blobUrl]);

  const audioSrcFromDescription = useMemo(
    () => extractAudioSrcFromHtml(data.description),
    [data.description],
  );
  const audioSrc = audioSrcFromAttachment || audioSrcFromDescription;

  const audioFile = pickedFile || attachment;
  const audioFileName =
    audioFile?.name ||
    getImageNameFromPath(audioFile?.path) ||
    getImageNameFromPath(audioSrc) ||
    "";
  const displayDescription =
    audioSrcFromDescription && data.description
      ? stripAudioElements(data.description)
      : data.description;

  const [scriptIsVisible, setScriptIsVisible] = useState(false);

  const handleDownloadAudio = async () => {
    if (!audioSrc) return;

    const baseName =
      (pickedFile instanceof File && pickedFile.name) ||
      audioFileName ||
      "audio";

    try {
      let blob: Blob;
      if (pickedFile instanceof Blob) {
        blob = pickedFile;
      } else {
        const response = await fetch(audioSrc);
        if (!response.ok) throw new Error("fetch failed");
        blob = await response.blob();
      }
      triggerBlobDownload(blob, ensureAudioFilename(baseName, blob.type));
      return;
    } catch {
      /* CORS / network — fall through to same-origin proxy */
    }

    if (/^https?:\/\//i.test(audioSrc)) {
      const proxyUrl = `/api/proxy-download?url=${encodeURIComponent(audioSrc)}&filename=${encodeURIComponent(ensureAudioFilename(baseName))}`;
      try {
        const response = await fetch(proxyUrl);
        if (!response.ok) throw new Error("proxy failed");
        const blob = await response.blob();
        triggerBlobDownload(blob, ensureAudioFilename(baseName, blob.type));
      } catch {
        const a = document.createElement("a");
        a.href = proxyUrl;
        a.download = ensureAudioFilename(baseName);
        a.rel = "noopener";
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    }
  };

  const playerRef = useRef<InstanceType<typeof AudioPlayer> | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const deferSrcLoadRef = useRef(true);
  const [deferSrcLoad, setDeferSrcLoad] = useState(true);

  useEffect(() => {
    deferSrcLoadRef.current = true;
    setDeferSrcLoad(true);
    const a = playerRef.current?.audio?.current;
    if (a) {
      a.pause();
      a.removeAttribute("src");
      a.load();
    }
  }, [audioSrc]);

  useEffect(() => {
    const wrap = wrapperRef.current;
    if (!wrap || !audioSrc) return;

    const bindSrcIfNeeded = () => {
      if (!deferSrcLoadRef.current) return;
      const audioEl = playerRef.current?.audio?.current;
      if (!audioEl) return;
      audioEl.src = audioSrc;
      deferSrcLoadRef.current = false;
      setDeferSrcLoad(false);
    };

    const onPointerDownCapture = (e: PointerEvent) => {
      const el = e.target as HTMLElement;
      if (
        !el.closest?.(".rhap_play-pause-button") &&
        !el.closest?.(".rhap_progress-container")
      ) {
        return;
      }
      bindSrcIfNeeded();
    };

    const onKeyDownCapture = (e: KeyboardEvent) => {
      if (e.key !== " ") return;
      const player = playerRef.current;
      const container = player?.container?.current;
      const progressBar = player?.progressBar?.current;
      const t = e.target as Node | null;
      if (!container || !t || (t !== container && t !== progressBar)) return;
      bindSrcIfNeeded();
    };

    wrap.addEventListener("pointerdown", onPointerDownCapture, true);
    wrap.addEventListener("keydown", onKeyDownCapture, true);
    return () => {
      wrap.removeEventListener("pointerdown", onPointerDownCapture, true);
      wrap.removeEventListener("keydown", onKeyDownCapture, true);
    };
  }, [audioSrc]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">
          {data.subtitle}
        </p>
        {!!displayDescription && (
          <p className="exercise-view-desc">
            {displayDescription}
          </p>
        )}
      </div>
      {!!image && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        {!!audioSrc && (
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 mx-auto w-full min-w-0">
            <Card radius="md" className="p-3 sm:p-4 box-border min-w-0">
              <div className="relative flex items-center justify-center min-h-[28px] px-8">
                <p
                  className="text-center"
                  style={{ fontWeight: 500, color: "#3F28C6" }}
                >
                  {data.audioTitle || audioFileName || (
                    <T k="templates.audio" defaultText="Аудио" />
                  )}
                </p>
                <ResponsiveTooltip content={downloadLabel} placement="top">
                  <button
                    type="button"
                    onClick={handleDownloadAudio}
                    className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center text-[#3F28C6] hover:opacity-80 transition-opacity"
                    aria-label={downloadLabel}
                  >
                    {AP_ICON.download}
                  </button>
                </ResponsiveTooltip>
              </div>
              <div ref={wrapperRef} className={`audio-wrapper my-4`}>
                <AudioPlayer
                  ref={playerRef}
                  src={deferSrcLoad ? undefined : audioSrc}
                  preload="none"
                  showJumpControls={false}
                  customIcons={{
                    play: AP_ICON.play,
                    pause: AP_ICON.pause,
                    volume: AP_ICON.volume,
                    volumeMute: AP_ICON.volumeMute,
                    loop: AP_ICON.loop,
                    loopOff: AP_ICON.loopOff,
                  }}
                  customAdditionalControls={[
                    <div key={1}>
                      <div
                        onClick={() => setScriptIsVisible((s) => !s)}
                        style={{ cursor: "pointer" }}
                      >
                        {scriptIsVisible ? (
                          <Image
                            src={ScriptCloseIcon}
                            alt="toggle script icon"
                          />
                        ) : (
                          <Image src={ScriptIcon} alt="toggle script icon" />
                        )}
                      </div>
                    </div>,
                  ]}
                />
              </div>
              {scriptIsVisible && (
                <div>
                  <p className="my-2">
                    <T k="editor.audioScript" defaultText="Скрипт" />
                  </p>
                  <Card
                    radius="md"
                    shadow="none"
                    className="p-4"
                    style={{
                      border: "1px solid #3F28C6",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {data.audioDescription}
                  </Card>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
