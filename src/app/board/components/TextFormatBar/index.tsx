"use client";

import {
  CaptureUpdateAction,
  FONT_FAMILY,
  mutateElement,
} from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import {
  FormEvent,
  PointerEvent as ReactPointerEvent,
  RefObject,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import styles from "./styles.module.css";

type TTextElement = {
  id: string;
  type: "text";
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  fontSize: number;
  fontFamily: number;
  textAlign: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  strokeColor: string;
  backgroundColor: string;
  originalText: string;
  text: string;
  lineHeight: number;
  autoResize: boolean;
  containerId: string | null;
  locked: boolean;
  link: string | null;
  isDeleted?: boolean;
  customData?: { marker?: string | null } | null;
};

type TBox = { x: number; y: number; width: number; height: number };

type TBarState = {
  x: number;
  y: number;
  placement: "above" | "below";
  fontSize: number;
  fontFamily: number;
  textAlign: "left" | "center" | "right";
  color: string;
  highlight: string;
  locked: boolean;
  link: string;
  bulleted: boolean;
};

const FONTS: Array<{ id: number; label: string }> = [
  { id: FONT_FAMILY.Helvetica, label: "Inter" },
  { id: FONT_FAMILY.Excalifont, label: "Excalifont" },
  { id: FONT_FAMILY.Nunito, label: "Nunito" },
  { id: FONT_FAMILY["Liberation Sans"], label: "Sans" },
  { id: FONT_FAMILY.Virgil, label: "Рукописный" },
  { id: FONT_FAMILY.Cascadia, label: "Код" },
];

const TEXT_COLORS = [
  "#1e1e1e",
  "#e03131",
  "#2f9e44",
  "#1971c2",
  "#f08c00",
  "#6741d9",
  "#ffffff",
];

const HIGHLIGHTS = [
  "transparent",
  "#fff3bf",
  "#ffd8a8",
  "#d0ebff",
  "#d3f9d8",
  "#ffc9c9",
  "#e5dbff",
];

const MIN_FONT_SIZE = 8;
const MAX_FONT_SIZE = 200;

const isText = (element: { type?: string } | null | undefined): element is TTextElement =>
  element?.type === "text";

const fontCss = (fontFamily: number) => {
  const name =
    Object.entries(FONT_FAMILY).find(([, id]) => id === fontFamily)?.[0] ||
    "Helvetica";
  return `${name}, sans-serif`;
};

const measureTextBox = (
  text: string,
  fontSize: number,
  fontFamily: number,
  lineHeight: number,
) => {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const lines = (text || "").split("\n");
  const font = `${fontSize}px ${fontCss(fontFamily)}`;
  let width = 0;
  if (context) {
    context.font = font;
    lines.forEach((line) => {
      width = Math.max(width, context.measureText(line || " ").width);
    });
  }
  const height = Math.max(fontSize * lineHeight, lines.length * fontSize * lineHeight);
  return { width: Math.max(width, fontSize), height };
};

const liveEditor = () =>
  document.querySelector<HTMLTextAreaElement>("textarea.excalidraw-wysiwyg");

const textElements = (api: ExcalidrawImperativeAPI): TTextElement[] => {
  const appState = api.getAppState();
  const elements = api
    .getSceneElements()
    .filter((element) => !element.isDeleted) as TTextElement[];

  if (appState.editingTextElement && isText(appState.editingTextElement)) {
    const current = elements.find(
      (element) => element.id === appState.editingTextElement?.id,
    );
    return [current || (appState.editingTextElement as TTextElement)];
  }

  const selected = elements.filter(
    (element) => appState.selectedElementIds[element.id],
  );
  const texts = selected.filter(isText);
  if (texts.length) return texts;

  const containerIds = new Set(selected.map((element) => element.id));
  return elements.filter(
    (element) =>
      isText(element) &&
      element.containerId &&
      containerIds.has(element.containerId),
  );
};

const anchorBox = (
  api: ExcalidrawImperativeAPI,
  texts: TTextElement[],
): TBox | null => {
  if (!texts.length) return null;
  const elements = api.getSceneElements();
  const boxes = texts.map((text) => {
    const container = text.containerId
      ? elements.find((element) => element.id === text.containerId)
      : null;
    const source = container || text;
    return {
      x: source.x,
      y: source.y,
      width: source.width || text.width || 0,
      height: source.height || text.height || 0,
    };
  });
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = Math.max(...boxes.map((box) => box.y + box.height));
  return { x: left, y: top, width: right - left, height: Math.max(bottom - top, 1) };
};

const toClient = (api: ExcalidrawImperativeAPI, sceneX: number, sceneY: number) => {
  const appState = api.getAppState();
  const zoom = appState.zoom?.value || 1;
  return {
    x: (sceneX + appState.scrollX) * zoom + appState.offsetLeft,
    y: (sceneY + appState.scrollY) * zoom + appState.offsetTop,
  };
};

const keepEditing = (event: ReactPointerEvent | FormEvent) => {
  event.preventDefault();
  event.stopPropagation();
};

const markerColor = (text: TTextElement) => {
  const marker = text.customData?.marker;
  return typeof marker === "string" && marker && marker !== "transparent"
    ? marker
    : "transparent";
};

const markerRgba = (color: string) => {
  const hex = color.replace("#", "");
  if (hex.length !== 6) return color;
  const red = Number.parseInt(hex.slice(0, 2), 16);
  const green = Number.parseInt(hex.slice(2, 4), 16);
  const blue = Number.parseInt(hex.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, 0.72)`;
};

const paintEditorMarker = (text: TTextElement) => {
  const editor = liveEditor();
  if (!editor) return;
  const color = markerColor(text);
  if (color === "transparent") {
    editor.style.backgroundImage = "none";
    return;
  }
  const line = text.fontSize * (text.lineHeight || 1.25);
  editor.style.backgroundColor = "transparent";
  editor.style.backgroundImage = `linear-gradient(${markerRgba(color)}, ${markerRgba(color)})`;
  editor.style.backgroundRepeat = "repeat-y";
  editor.style.backgroundSize = `100% ${line * 0.7}px`;
  editor.style.backgroundPosition = `0px ${line * 0.16}px`;
};

const syncEditorStyle = (text: TTextElement) => {
  const editor = liveEditor();
  if (!editor) return;
  editor.style.font = `${text.fontSize}px ${fontCss(text.fontFamily)}`;
  editor.style.lineHeight = String(text.lineHeight);
  editor.style.color = text.strokeColor;
  editor.style.textAlign = text.textAlign;
  editor.style.width = `${text.width}px`;
  editor.style.height = `${text.height}px`;
  paintEditorMarker(text);
};

type TProps = {
  api: ExcalidrawImperativeAPI | null;
  editorWrapRef: RefObject<HTMLElement | null>;
};

export const TextFormatBar = ({ api, editorWrapRef }: TProps) => {
  const [bar, setBar] = useState<TBarState | null>(null);
  const [menu, setMenu] = useState<"font" | "color" | "highlight" | "link" | null>(
    null,
  );
  const [linkDraft, setLinkDraft] = useState("");
  const [sizeDraft, setSizeDraft] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const barSizeRef = useRef({ width: 0, height: 0 });
  const repositionRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const node = barRef.current;
    if (!node) {
      barSizeRef.current = { width: 0, height: 0 };
      return;
    }
    const width = node.offsetWidth;
    const height = node.offsetHeight;
    if (width === barSizeRef.current.width && height === barSizeRef.current.height) return;
    barSizeRef.current = { width, height };
    repositionRef.current();
  });

  useEffect(() => {
    const wrap = editorWrapRef.current;
    if (!api || !wrap) return;

    let frame = 0;
    const read = () => {
      const texts = textElements(api);
      const toolIsText = api.getAppState().activeTool.type === "text";
      if (!texts.length) {
        wrap.dataset.textFormatBar = toolIsText ? "pending" : "";
        if (!toolIsText) delete wrap.dataset.textFormatBar;
        setBar(null);
        return;
      }

      const box = anchorBox(api, texts);
      if (!box) return;
      const topLeft = toClient(api, box.x, box.y);
      const bottomRight = toClient(api, box.x + box.width, box.y + box.height);
      const barHeight = barRef.current?.offsetHeight || 44;
      const placeBelow = topLeft.y < barHeight + 16;
      const first = texts[0];
      const sourceText = liveEditor()?.value ?? first.originalText ?? first.text;
      const center = (topLeft.x + bottomRight.x) / 2;
      const viewport = window.innerWidth;
      const narrow = viewport <= 520;
      const barWidth = Math.min(
        barRef.current?.offsetWidth || (narrow ? viewport - 16 : 480),
        viewport - 16,
      );
      const half = barWidth / 2;
      wrap.dataset.textFormatBar = "1";
      paintEditorMarker(first);
      setBar({
        x: narrow
          ? viewport / 2
          : Math.min(viewport - 8 - half, Math.max(8 + half, center)),
        y: placeBelow ? bottomRight.y + 10 : topLeft.y - 10,
        placement: placeBelow ? "below" : "above",
        fontSize: Math.round(first.fontSize),
        fontFamily: first.fontFamily,
        textAlign: first.textAlign,
        color: first.strokeColor,
        highlight: markerColor(first),
        locked: texts.every((text) => text.locked),
        link: first.link || "",
        bulleted: sourceText
          .split("\n")
          .every((line) => !line.trim() || line.startsWith("• ")),
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(read);
    };

    repositionRef.current = schedule;
    const unsubscribeChange = api.onChange(schedule);
    const unsubscribeScroll = api.onScrollChange(schedule);
    window.addEventListener("resize", schedule);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      unsubscribeChange();
      unsubscribeScroll();
      window.removeEventListener("resize", schedule);
      delete wrap.dataset.textFormatBar;
    };
  }, [api, editorWrapRef]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const node = barRef.current;
      const target = event.target;
      if (!node || !(target instanceof Node) || !node.contains(target)) return;
      const editor = liveEditor();
      const writing =
        target instanceof HTMLElement && Boolean(target.closest("input, textarea"));
      const previousBlur = editor?.onblur ?? null;
      if (editor) editor.onblur = null;
      if (!writing) {
        event.preventDefault();
        queueMicrotask(() => {
          if (editor && editor.isConnected) editor.onblur = previousBlur;
        });
        return;
      }
      const restore = () => {
        window.removeEventListener("pointerup", restore, true);
        if (editor && editor.isConnected) editor.onblur = previousBlur;
      };
      window.addEventListener("pointerup", restore, true);
    };
    window.addEventListener("pointerdown", onPointerDown, true);
    return () => window.removeEventListener("pointerdown", onPointerDown, true);
  }, []);

  if (!api || !bar) return null;

  const patchTexts = (
    updates: Partial<TTextElement> | ((text: TTextElement) => Partial<TTextElement>),
  ) => {
    const targets = textElements(api);
    if (!targets.length) return;
    const ids = new Set(targets.map((text) => text.id));
    const editor = liveEditor();
    const liveText = editor?.value;
    const containerRatios = new Map<string, number>();
    const containerColors = new Map<string, string>();

    let sample: TTextElement | null = null;
    api.getSceneElements().forEach((element) => {
      if (!ids.has(element.id) || !isText(element)) return;
      const text = element as TTextElement;
      const patch = typeof updates === "function" ? updates(text) : updates;
      const originalText =
        liveText !== undefined && targets.length === 1
          ? liveText
          : patch.originalText ?? text.originalText;
      const previousSize = text.fontSize;
      const fontSize = patch.fontSize ?? text.fontSize;
      const fontFamily = patch.fontFamily ?? text.fontFamily;
      const contentChanged =
        fontSize !== previousSize ||
        fontFamily !== text.fontFamily ||
        originalText !== text.originalText;
      const metrics = contentChanged
        ? measureTextBox(originalText, fontSize, fontFamily, text.lineHeight)
        : { width: text.width, height: text.height };
      mutateElement(text, {
        ...patch,
        originalText,
        text: text.containerId || !text.autoResize ? text.text : originalText,
        fontSize,
        fontFamily,
        width:
          contentChanged && text.autoResize && !text.containerId
            ? metrics.width
            : text.width,
        height:
          contentChanged && text.autoResize && !text.containerId
            ? metrics.height
            : text.height * (fontSize / Math.max(previousSize, 1)),
      });
      if (text.containerId && fontSize !== previousSize) {
        containerRatios.set(text.containerId, fontSize / Math.max(previousSize, 1));
      }
      if (text.containerId && patch.backgroundColor) {
        containerColors.set(text.containerId, String(patch.backgroundColor));
      }
      sample = text;
    });

    api.getSceneElements().forEach((element) => {
      const ratio = containerRatios.get(element.id);
      const backgroundColor = containerColors.get(element.id);
      if ((!ratio || ratio === 1) && !backgroundColor) return;
      mutateElement(element, {
        ...(ratio && ratio !== 1
          ? { width: element.width * ratio, height: element.height * ratio }
          : {}),
        ...(backgroundColor ? { backgroundColor } : {}),
      });
    });

    api.updateScene({
      elements: api.getSceneElements(),
      appState: sample
        ? {
            currentItemFontSize: sample.fontSize,
            currentItemFontFamily: sample.fontFamily,
            currentItemStrokeColor: sample.strokeColor,
            currentItemTextAlign: sample.textAlign,
          }
        : {},
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    if (sample) {
      syncEditorStyle(sample);
      liveEditor()?.dispatchEvent(new Event("input", { bubbles: true }));
    }
    setMenu(null);
  };

  const setFontSize = (value: number) => {
    const fontSize = Math.round(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, value)));
    if (!Number.isFinite(fontSize)) return;
    patchTexts({ fontSize });
  };

  const toggleList = () => {
    const editor = liveEditor();
    const current = editor?.value ?? "";
    const next = bar.bulleted
      ? current
          .split("\n")
          .map((line) => line.replace(/^• /, ""))
          .join("\n")
      : current
          .split("\n")
          .map((line) => (line.startsWith("• ") || !line ? line : `• ${line}`))
          .join("\n");
    if (editor) editor.value = next;
    patchTexts({ originalText: next, text: next });
  };

  const fontLabel =
    FONTS.find((font) => font.id === bar.fontFamily)?.label ||
    Object.entries(FONT_FAMILY).find(([, id]) => id === bar.fontFamily)?.[0] ||
    "Шрифт";

  return (
    <div
      ref={barRef}
      className={styles.bar}
      style={{
        left: bar.x,
        top: bar.y,
        transform:
          bar.placement === "below"
            ? "translate(-50%, 0)"
            : "translate(-50%, -100%)",
      }}
      onPointerDown={keepEditing}
      onMouseDown={keepEditing}
    >
      <div className={styles.group}>
        <button
          type="button"
          className={styles.fontButton}
          onMouseDown={keepEditing}
          onClick={() => setMenu(menu === "font" ? null : "font")}
        >
          <span className={styles.fontLabel}>{fontLabel}</span>
          <Caret />
        </button>
        {menu === "font" ? (
          <div className={styles.menu}>
            {FONTS.map((font) => (
              <button
                key={font.id}
                type="button"
                className={font.id === bar.fontFamily ? styles.menuItemActive : styles.menuItem}
                style={{ fontFamily: fontCss(font.id) }}
                onMouseDown={keepEditing}
                onClick={() => patchTexts({ fontFamily: font.id })}
              >
                {font.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className={styles.size}>
        <input
          className={styles.sizeInput}
          inputMode="numeric"
          value={sizeDraft ?? String(Math.round(bar.fontSize))}
          aria-label="Размер шрифта"
          onPointerDown={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onKeyDown={(event) => event.stopPropagation()}
          onFocus={() => setSizeDraft(String(Math.round(bar.fontSize)))}
          onBlur={() => {
            const next = Number(sizeDraft);
            if (sizeDraft !== null && sizeDraft !== "" && Number.isFinite(next)) {
              setFontSize(next);
            }
            setSizeDraft(null);
          }}
          onChange={(event) => {
            const raw = event.target.value.replace(/[^\d]/g, "").slice(0, 3);
            setSizeDraft(raw);
            const next = Number(raw);
            if (raw !== "" && next >= MIN_FONT_SIZE && next <= MAX_FONT_SIZE) {
              setFontSize(next);
            }
          }}
        />
        <div className={styles.stepper}>
          <button
            type="button"
            aria-label="Увеличить размер"
            onMouseDown={keepEditing}
            onClick={() => {
              setSizeDraft(null);
              setFontSize((sizeDraft ? Number(sizeDraft) : bar.fontSize) + 1);
            }}
          >
            <Caret up />
          </button>
          <button
            type="button"
            aria-label="Уменьшить размер"
            onMouseDown={keepEditing}
            onClick={() => {
              setSizeDraft(null);
              setFontSize((sizeDraft ? Number(sizeDraft) : bar.fontSize) - 1);
            }}
          >
            <Caret />
          </button>
        </div>
      </div>

      <span className={styles.divider} />

      <div className={styles.group}>
        {(["left", "center", "right"] as const).map((align) => (
          <button
            key={align}
            type="button"
            className={bar.textAlign === align ? styles.iconActive : styles.icon}
            aria-label={align}
            onMouseDown={keepEditing}
            onClick={() => patchTexts({ textAlign: align })}
          >
            <AlignIcon align={align} />
          </button>
        ))}
        <button
          type="button"
          className={bar.bulleted ? styles.iconActive : styles.icon}
          aria-label="Список"
          onMouseDown={keepEditing}
          onClick={toggleList}
        >
          <ListIcon />
        </button>
      </div>

      <span className={`${styles.divider} ${styles.rowBreak}`} />

      <div className={styles.group}>
        <button
          type="button"
          className={styles.icon}
          aria-label="Цвет текста"
          onMouseDown={keepEditing}
          onClick={() => setMenu(menu === "color" ? null : "color")}
        >
          <span className={styles.colorA} style={{ borderBottomColor: bar.color }}>
            A
          </span>
        </button>
        <button
          type="button"
          className={styles.icon}
          aria-label="Выделение"
          onMouseDown={keepEditing}
          onClick={() => setMenu(menu === "highlight" ? null : "highlight")}
        >
          <span
            className={styles.highlightSwatch}
            style={{
              background:
                bar.highlight === "transparent" ? "#fff3bf" : bar.highlight,
            }}
          />
        </button>
        {menu === "color" || menu === "highlight" ? (
          <div className={styles.menu}>
            {(menu === "color" ? TEXT_COLORS : HIGHLIGHTS).map((color) => (
              <button
                key={color}
                type="button"
                className={styles.swatch}
                style={{
                  background: color === "transparent" ? "#fff" : color,
                }}
                aria-label={color}
                onMouseDown={keepEditing}
                onClick={() =>
                  menu === "color"
                    ? patchTexts({ strokeColor: color })
                    : patchTexts((text) => ({
                        customData: {
                          ...(text.customData || {}),
                          marker: color === "transparent" ? null : color,
                        },
                      }))
                }
              />
            ))}
          </div>
        ) : null}
      </div>

      <span className={styles.divider} />

      <div className={styles.group}>
        <button
          type="button"
          className={bar.link ? styles.iconActive : styles.icon}
          aria-label="Ссылка"
          onMouseDown={keepEditing}
          onClick={() => {
            setLinkDraft(bar.link);
            setMenu(menu === "link" ? null : "link");
          }}
        >
          <LinkIcon />
        </button>
        <button
          type="button"
          className={bar.locked ? styles.iconActive : styles.icon}
          aria-label={bar.locked ? "Разблокировать" : "Заблокировать"}
          onMouseDown={keepEditing}
          onClick={() => patchTexts({ locked: !bar.locked })}
        >
          <LockIcon />
        </button>
        {menu === "link" ? (
          <form
            className={styles.linkForm}
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              patchTexts({ link: linkDraft.trim() || null });
            }}
          >
            <input
              className={styles.linkInput}
              value={linkDraft}
              placeholder="https://"
              onPointerDown={(event) => event.stopPropagation()}
              onMouseDown={(event) => event.stopPropagation()}
              onKeyDown={(event) => event.stopPropagation()}
              onChange={(event) => setLinkDraft(event.target.value)}
            />
          </form>
        ) : null}
      </div>
    </div>
  );
};

const Caret = ({ up = false }: { up?: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
    <path
      d={up ? "M2 6.5 L5 3.5 L8 6.5" : "M2 3.5 L5 6.5 L8 3.5"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const AlignIcon = ({ align }: { align: "left" | "center" | "right" }) => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path
      d={
        align === "left"
          ? "M2 3.5h12M2 8h8M2 12.5h10"
          : align === "center"
            ? "M2 3.5h12M4 8h8M3 12.5h10"
            : "M2 3.5h12M6 8h8M4 12.5h10"
      }
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const ListIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path
      d="M3 4h.01M6 4h8M3 8h.01M6 8h8M3 12h.01M6 12h8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
    />
  </svg>
);

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path
      d="M6.5 9.5l3-3M7 4.5l.7-.7a2.5 2.5 0 013.5 3.5L10.5 8M9 11.5l-.7.7a2.5 2.5 0 01-3.5-3.5L5.5 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" fill="none" stroke="currentColor" strokeWidth="1.3" />
    <path d="M5.5 7V5.2a2.5 2.5 0 015 0V7" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>
);
