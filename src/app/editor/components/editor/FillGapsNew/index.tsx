"use client";

/* Slate editor nodes are loosely typed throughout this module. */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FillGapsNewExView } from "../../view/FillGapsNewExView";
import { useExData } from "../hooks/useExData";
import { CreateExWithAiButton } from "../CreateExWithAiButton";
import { useUploadFillGapsNewEx } from "../hooks/useUploadFillGapsNewEx";
import { GapOptionsModal } from "./GapOptionsModal";
import { TitleExInput } from "../TitleExInput";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import {
  TFillGapsNewContent,
  TFillGapsNewData,
  TFillGapsNewGap,
  TFillGapsNewMode,
  TSlateGapElement,
  TSlateText,
} from "./types";
import styles from "./styles.module.css";
import { createEditor, Editor, Element, Range, Transforms } from "slate";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { withHistory } from "slate-history";
import { Path } from "slate";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

const COLORS = ["#3F28C6", "#111827", "#16A34A", "#DC2626", "#2563EB", "#F59E0B"];

const defaultValuesStub: TFillGapsNewData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "Fill in the gaps with the correct words",
  description: "",
  images: [],
  mode: "select",
  content: [
    {
      type: "paragraph",
      children: [
        {
          text: "",
        },
      ],
    },
  ],
  gaps: [],
};

type TProps = {
  onSuccess: (id: number) => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const FillGapsNew: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveFillGapsNewEx, success } = useUploadFillGapsNewEx(
    lastSortIndex,
    currentSortIndexToShift,
  );

  const { data, changeData, resetData } = useExData<TFillGapsNewData>(
    defaultValues || defaultValuesStub,
  );

  const [images, setImages] = useState<TFillGapsNewData["images"]>(
    defaultValues?.images || [],
  );

  useEffect(() => {
    changeData("images", images || []);
  }, [changeData, images]);

  useEffect(() => {
    if (success) {
      onSuccess?.((data as any)?.id || 0);
      resetData(defaultValuesStub);
    }
  }, [data, onSuccess, resetData, success]);

  const [gapModalOpen, setGapModalOpen] = useState(false);
  const [activeGapId, setActiveGapId] = useState<string | null>(null);
  const [initialCorrectText, setInitialCorrectText] = useState<string | undefined>(
    undefined,
  );
  const [slateMountKey, setSlateMountKey] = useState(0);
  const [gapFloatPos, setGapFloatPos] = useState<{ top: number; left: number } | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const gapFloatTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPointerSelectingRef = useRef(false);
  const gapFloatVisibleRef = useRef(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    gapFloatVisibleRef.current = gapFloatPos !== null;
  }, [gapFloatPos]);

  const editor = useMemo(() => {
    const e = withHistory(withReact(createEditor()));
    const { isInline, isVoid } = e;
    e.isInline = (element) => {
      return (element as any).type === "gap" ? true : isInline(element);
    };
    e.isVoid = (element) => {
      return (element as any).type === "gap" ? true : isVoid(element);
    };
    return e;
    // Remount via slateMountKey recreates the editor instance intentionally.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slateMountKey]);

  useEffect(() => {
    setSlateMountKey((k) => k + 1);
    if (!Array.isArray(data.content) || data.content.length === 0) {
      changeData("content", defaultValuesStub.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.id]);

  const modes = useMemo(
    () =>
      [
        {
          id: "select",
          titleKey: "editor.fillGapsModeSelect",
          titleDefault: "Выбрать",
          descKey: "editor.fillGapsModeSelectDesc",
          descDefault: "Ученик выбирает вариант из списка",
        },
        {
          id: "input",
          titleKey: "editor.fillGapsModeInput",
          titleDefault: "Вписать",
          descKey: "editor.fillGapsModeInputDesc",
          descDefault: "Ученик вводит ответ вручную",
        },
        {
          id: "drag",
          titleKey: "editor.fillGapsModeDrag",
          titleDefault: "Перетащить",
          descKey: "editor.fillGapsModeDragDesc",
          descDefault: "Перетаскивание из списка",
        },
      ] as const,
    [],
  );

  const toggleMark = useCallback(
    (mark: "bold" | "italic" | "underline") => {
      const marks = Editor.marks(editor) as any;
      const isActive = !!marks?.[mark];
      if (isActive) {
        Editor.removeMark(editor, mark);
      } else {
        Editor.addMark(editor, mark, true);
      }
    },
    [editor],
  );

  const setColor = useCallback(
    (color: string) => {
      Editor.addMark(editor, "color", color);
    },
    [editor],
  );

  const openGapModalFor = useCallback((gapId: string, correctText?: string) => {
    setActiveGapId(gapId);
    setInitialCorrectText(correctText);
    setGapModalOpen(true);
  }, []);

  const makeGap = useCallback(() => {
    const selection = editor.selection;
    if (!selection || Editor.string(editor, selection).trim().length === 0) {
      return;
    }
    const selectedText = Editor.string(editor, selection);
    const gapId = uuidv4();
    const gapEl: TSlateGapElement = {
      type: "gap",
      gapId,
      children: [{ text: "" }],
    };
    Transforms.delete(editor, { at: selection });
    Transforms.insertNodes(editor, gapEl);
    Transforms.move(editor);

    const normalizedSelected = selectedText.trim();
    const gap: TFillGapsNewGap = {
      id: gapId,
      originalText: normalizedSelected,
      options: normalizedSelected
        ? [
            {
              id: uuidv4(),
              value: normalizedSelected,
              isCorrect: true,
            },
          ]
        : [],
    };
    changeData("gaps", (data.gaps || []).concat(gap));
    openGapModalFor(gapId, normalizedSelected);
    setGapFloatPos(null);
  }, [changeData, data.gaps, editor, openGapModalFor]);

  const GAP_FLOAT_SHOW_DELAY_MS = 300;

  const hideGapFloat = useCallback(() => {
    if (gapFloatTimerRef.current) {
      clearTimeout(gapFloatTimerRef.current);
      gapFloatTimerRef.current = null;
    }
    if (gapFloatVisibleRef.current) {
      setGapFloatPos(null);
    }
  }, []);

  const computeGapFloatPos = useCallback(() => {
    try {
      const sel = editor.selection;
      if (!sel || Range.isCollapsed(sel)) {
        setGapFloatPos(null);
        return;
      }
      const hasGapNode = Array.from(
        Editor.nodes(editor, {
          at: sel,
          match: (n) => Element.isElement(n) && (n as any).type === "gap",
        }),
      ).length > 0;
      if (hasGapNode) {
        setGapFloatPos(null);
        return;
      }
      const text = Editor.string(editor, sel).trim();
      if (!text) {
        setGapFloatPos(null);
        return;
      }
      try {
        const domEditor = ReactEditor.toDOMNode(editor as any, editor as any);
        const nativeSel = window.getSelection();
        if (!nativeSel || nativeSel.rangeCount === 0) {
          setGapFloatPos(null);
          return;
        }
        if (!domEditor.contains(nativeSel.anchorNode)) {
          setGapFloatPos(null);
          return;
        }
      } catch {
        setGapFloatPos(null);
        return;
      }
      const domRange = ReactEditor.toDOMRange(editor as any, sel);
      const rect = domRange.getBoundingClientRect();
      if (rect.width < 1 && rect.height < 1) {
        setGapFloatPos(null);
        return;
      }
      const approxH = 48;
      const isMobile = window.matchMedia("(max-width: 1023px)").matches;
      const vv = window.visualViewport;
      const viewportTop = vv?.offsetTop ?? 0;
      const viewportH = vv?.height ?? window.innerHeight;
      const viewportBottom = viewportTop + viewportH;

      let top: number;
      if (isMobile) {
        const margin = 16;
        top = rect.bottom + margin;
        if (top + approxH > viewportBottom - 8) {
          top = Math.max(viewportTop + 8, viewportBottom - approxH - 8);
        }
      } else {
        const margin = 10;
        top = rect.top - approxH - margin;
        if (top < 8) {
          top = rect.bottom + margin;
        }
        if (top + approxH > window.innerHeight - 8) {
          top = Math.max(8, window.innerHeight - approxH - 8);
        }
      }
      const left = rect.left + rect.width / 2;
      const clampedLeft = Math.max(96, Math.min(left, window.innerWidth - 96));
      setGapFloatPos({ top, left: clampedLeft });
    } catch {
      setGapFloatPos(null);
    }
  }, [editor]);

  const scheduleUpdateGapFloat = useCallback(
    (opts?: { immediate?: boolean }) => {
      if (gapFloatTimerRef.current) {
        clearTimeout(gapFloatTimerRef.current);
        gapFloatTimerRef.current = null;
      }

      const sel = editor.selection;
      if (!sel || Range.isCollapsed(sel)) {
        hideGapFloat();
        return;
      }

      if (isPointerSelectingRef.current && !opts?.immediate) {
        return;
      }

      const run = () => {
        gapFloatTimerRef.current = null;
        requestAnimationFrame(() => {
          requestAnimationFrame(computeGapFloatPos);
        });
      };

      if (opts?.immediate) {
        run();
        return;
      }

      gapFloatTimerRef.current = setTimeout(run, GAP_FLOAT_SHOW_DELAY_MS);
    },
    [editor, hideGapFloat, computeGapFloatPos],
  );

  useEffect(() => {
    return () => {
      if (gapFloatTimerRef.current) {
        clearTimeout(gapFloatTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fn = () => {
      if (!gapFloatVisibleRef.current) return;
      scheduleUpdateGapFloat({ immediate: true });
    };
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    window.visualViewport?.addEventListener("resize", fn);
    window.visualViewport?.addEventListener("scroll", fn);
    return () => {
      window.removeEventListener("scroll", fn, true);
      window.removeEventListener("resize", fn);
      window.visualViewport?.removeEventListener("resize", fn);
      window.visualViewport?.removeEventListener("scroll", fn);
    };
  }, [scheduleUpdateGapFloat]);

  const restoreGapToOriginalText = useCallback(
    (gapId: string) => {
      const gap = (data.gaps || []).find((g) => g.id === gapId);
      const original =
        (gap?.originalText || "").trim() ||
        (gap?.options || []).find((o) => o.isCorrect)?.value?.trim() ||
        (gap?.options || [])?.[0]?.value?.trim() ||
        "";

      const entry = Array.from(
        Editor.nodes(editor, {
          at: [],
          match: (n) => (n as any)?.type === "gap" && (n as any)?.gapId === gapId,
        }),
      )[0] as any;

      if (!entry) return;
      const [, path] = entry;
      try {
        const insertAt = Editor.before(editor, path) || Editor.start(editor, Path.parent(path));
        Transforms.removeNodes(editor, { at: path });
        if (original) Transforms.insertText(editor, original, { at: insertAt });
      } catch {}

      changeData(
        "gaps",
        (data.gaps || []).filter((g) => g.id !== gapId),
      );
    },
    [changeData, data.gaps, editor],
  );

  const onSaveGap = useCallback(
    (gap: TFillGapsNewGap) => {
      const next = (data.gaps || []).filter((g) => g.id !== gap.id).concat(gap);
      changeData("gaps", next);
    },
    [changeData, data.gaps],
  );

  const activeGap = useMemo(() => {
    if (!activeGapId) return undefined;
    return (data.gaps || []).find((g) => g.id === activeGapId);
  }, [activeGapId, data.gaps]);

  const initialValue = useMemo<TFillGapsNewContent>(() => {
    const v = Array.isArray(data.content) ? data.content : [];
    return v.length ? v : defaultValuesStub.content;
  }, [data.content]);

  const renderElement = useCallback(
    (props: RenderElementProps) => {
      const el = props.element as any;
      if (el.type === "gap") {
        const gapId = el.gapId as string;
        return (
          <span
            {...props.attributes}
            contentEditable={false}
            className={styles.gapPill}
            onPointerDown={(e) => {
              // Gap pill: open only on short tap, not when scrolling starts here
              e.preventDefault();
              e.stopPropagation();
              const x = e.clientX ?? 0;
              const y = e.clientY ?? 0;
              (e.currentTarget as any).__gapTap = {
                t: Date.now(),
                x,
                y,
                moved: false,
              };
            }}
            onPointerMove={(e) => {
              const st = (e.currentTarget as any).__gapTap;
              if (!st) return;
              if (
                Math.abs((e.clientX ?? 0) - st.x) > MOVE_PX ||
                Math.abs((e.clientY ?? 0) - st.y) > MOVE_PX
              ) {
                st.moved = true;
              }
            }}
            onPointerUp={(e) => {
              e.stopPropagation();
              const st = (e.currentTarget as any).__gapTap;
              (e.currentTarget as any).__gapTap = null;
              if (!st || st.moved) return;
              if (Date.now() - st.t > 350) return;
              openGapModalFor(gapId);
            }}
            onPointerCancel={(e) => {
              (e.currentTarget as any).__gapTap = null;
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const t = e.touches?.[0];
              (e.currentTarget as any).__gapTap = {
                t: Date.now(),
                x: t?.clientX ?? 0,
                y: t?.clientY ?? 0,
                moved: false,
              };
            }}
            onTouchMove={(e) => {
              const st = (e.currentTarget as any).__gapTap;
              if (!st) return;
              const t = e.touches?.[0];
              if (
                Math.abs((t?.clientX ?? 0) - st.x) > MOVE_PX ||
                Math.abs((t?.clientY ?? 0) - st.y) > MOVE_PX
              ) {
                st.moved = true;
              }
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              const st = (e.currentTarget as any).__gapTap;
              (e.currentTarget as any).__gapTap = null;
              if (!st || st.moved) return;
              if (Date.now() - st.t > 350) return;
              openGapModalFor(gapId);
            }}
            onTouchCancel={(e) => {
              (e.currentTarget as any).__gapTap = null;
            }}
            style={{ cursor: "pointer" }}
          >
            Пропуск{props.children}
          </span>
        );
      }
      return <p {...props.attributes}>{props.children}</p>;
    },
    [openGapModalFor],
  );

  const renderLeaf = useCallback((props: RenderLeafProps) => {
    const leaf = props.leaf as any as TSlateText;
    const style: any = {};
    if (leaf.bold) style.fontWeight = 700;
    if (leaf.italic) style.fontStyle = "italic";
    if (leaf.underline) style.textDecoration = "underline";
    if (leaf.color) style.color = leaf.color;
    return (
      <span {...props.attributes} style={style}>
        {props.children}
      </span>
    );
  }, []);

  const tapFocusRef = useRef<{
    t: number;
    x: number;
    y: number;
    moved: boolean;
    scrollY: number;
    scrollElTop: number;
    scrollEl?: Element | null;
    unbindScroll?: (() => void) | null;
  } | null>(null);

  const MOVE_PX = 10;

  const getScrollParent = useCallback((el: Element | null): Element | null => {
    let cur: Element | null = el;
    while (cur) {
      const style = window.getComputedStyle(cur);
      const oy = style.overflowY;
      const ox = style.overflowX;
      if (
        ((oy === "auto" || oy === "scroll" || oy === "overlay") ||
          (ox === "auto" || ox === "scroll" || ox === "overlay")) &&
        ((cur as HTMLElement).scrollHeight > (cur as HTMLElement).clientHeight ||
          (cur as HTMLElement).scrollWidth > (cur as HTMLElement).clientWidth)
      ) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }, []);

  const clearTapFocus = useCallback(() => {
    const st = tapFocusRef.current;
    st?.unbindScroll?.();
    tapFocusRef.current = null;
  }, []);

  const markTapMoved = useCallback(() => {
    const st = tapFocusRef.current;
    if (st) st.moved = true;
  }, []);

  const beginTapFocus = useCallback(
    (target: Element | null, x: number, y: number) => {
      clearTapFocus();
      const se = getScrollParent(target);
      const onScroll = () => markTapMoved();
      se?.addEventListener("scroll", onScroll, { passive: true });
      // Modal body scroll often bubbles to document on iOS.
      document.addEventListener("scroll", onScroll, {
        passive: true,
        capture: true,
      });
      tapFocusRef.current = {
        t: Date.now(),
        x,
        y,
        moved: false,
        scrollY: window.scrollY,
        scrollEl: se,
        scrollElTop:
          se && "scrollTop" in (se as any)
            ? Number((se as any).scrollTop || 0)
            : 0,
        unbindScroll: () => {
          se?.removeEventListener("scroll", onScroll);
          document.removeEventListener("scroll", onScroll, true);
        },
      };
    },
    [clearTapFocus, getScrollParent, markTapMoved],
  );

  const tryFocusOnShortTap = useCallback(
    (e?: { target?: EventTarget | null }) => {
      const st = tapFocusRef.current;
      clearTapFocus();
      if (!st) return;
      if (st.moved) return; // scroll / drag
      if (Date.now() - st.t > 350) return; // long-press selection
      // Don't steal focus when the gesture ended on a gap pill / control
      try {
        const t = e?.target as Element | null;
        if (t?.closest?.("[contenteditable=false], button, input, textarea, a")) {
          return;
        }
      } catch {}
      // If any scrolling happened (modal body / page), don't focus
      try {
        const nowScrollY = window.scrollY;
        const nowTop =
          st.scrollEl && "scrollTop" in (st.scrollEl as any)
            ? Number((st.scrollEl as any).scrollTop || 0)
            : st.scrollElTop;
        if (Math.abs(nowScrollY - st.scrollY) > 1) return;
        if (Math.abs(nowTop - st.scrollElTop) > 1) return;
      } catch {}
      try {
        ReactEditor.focus(editor as any);
        // iOS Safari: sometimes ReactEditor.focus sets outline but no keyboard;
        // focusing the underlying DOM node helps.
        try {
          const dom = ReactEditor.toDOMNode(
            editor as any,
            editor as any,
          ) as HTMLElement | null;
          dom?.focus?.();
        } catch {}
      } catch {}
    },
    [clearTapFocus, editor],
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-0">
        <div className="w-full md:w-1/2 md:pr-2 min-w-0">
          <TitleExInput
            label={<T k="editor.taskTitle" defaultText="Заголовок задания" />}
            value={data.title || ""}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={(data.titleColor as any) || "#3F28C6"}
          />
          <div className="h-4" />
          <TitleExInput
            label={<T k="editor.taskSubtitle" defaultText="Подзаголовок" />}
            value={data.subtitle || ""}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label={<T k="editor.description" defaultText="Описание" />}
            value={data.description || ""}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 min-w-0">
          <p className="font-light mb-2">
            <T k="editor.imageForTask" defaultText="Изображение для задания" />
          </p>
          <ImageUpload
            images={images || []}
            setImages={setImages}
            customPlaceHolder={
              <div
                style={{
                  width: "100%",
                  background: "#fff",
                  height: 200,
                  borderRadius: 10,
                }}
                className="flex items-center justify-center flex-col gap-4"
              >
                <Image src={GalleryIcon} alt="GalleryIcon" />
                <p
                  className="text-small text-center max-w-[250px]"
                  style={{ color: "#B7B7B7" }}
                >
                  <T
                    k="editor.dragImagesHere"
                    defaultText="Нажмите на этот блок или перетащите сюда изображения"
                  />
                </p>
              </div>
            }
          />
          <CreateExWithAiButton
            type="FILL_GAPS_NEW"
            currentData={data as any}
            onApply={(generated) => {
              resetData({
                ...generated,
                id: (data as any)?.id,
                sortIndex: (data as any)?.sortIndex,
              } as any);
              setImages(Array.isArray(generated.images) ? generated.images : images);
              setSlateMountKey((k) => k + 1);
            }}
          />
        </div>
      </div>

      <div className="h-6" />

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.question}>
              <T k="editor.howToInsertGapTitle" defaultText="Как вставить пропуск?" />
            </div>
            <div className={styles.hint}>
              <T
                k="editor.howToInsertGapHint"
                defaultText="Выберите режим выполнения. Его можно менять в любой момент."
              />
            </div>
            <div className={styles.howto}>
              <T
                k="editor.howToInsertGapSteps"
                defaultText="1) Напишите текст задания. 2) Выделите фрагмент, который должен стать пропуском. 3) Нажмите «Сделать пропуск» и добавьте варианты ответа."
              />
            </div>
          </div>
        </div>

        <div className={styles.modeRow}>
          {modes.map((m) => {
            const isActive = data.mode === m.id;
            return (
              <button
                key={m.id}
                type="button"
                className={`${styles.modeCard} ${isActive ? styles.modeCardActive : ""}`}
                onClick={() => changeData("mode", m.id as TFillGapsNewMode)}
              >
                <div className={styles.modeTitle}>
                  <T k={m.titleKey} defaultText={m.titleDefault} />
                </div>
                <div className={styles.modeDesc}>
                  <T k={m.descKey} defaultText={m.descDefault} />
                </div>
              </button>
            );
          })}
        </div>

        <div className={styles.toolbar}>
          <Button
            size="sm"
            variant="flat"
            className={styles.toolbarButton}
            onPointerDown={(e) => {
              e.preventDefault();
              toggleMark("bold");
            }}
          >
            <span className={styles.iconBold}>B</span>
          </Button>
          <Button
            size="sm"
            variant="flat"
            className={styles.toolbarButton}
            onPointerDown={(e) => {
              e.preventDefault();
              toggleMark("italic");
            }}
          >
            <span className={styles.iconItalic}>I</span>
          </Button>
          <Button
            size="sm"
            variant="flat"
            className={styles.toolbarButton}
            onPointerDown={(e) => {
              e.preventDefault();
              toggleMark("underline");
            }}
          >
            <span className={styles.iconUnderline}>U</span>
          </Button>
          {COLORS.map((c) => (
            <Button
              key={c}
              size="sm"
              variant="light"
              className={styles.toolbarButton}
              onPointerDown={(e) => {
                e.preventDefault();
                setColor(c);
              }}
            >
              <span className={styles.colorSwatch} style={{ background: c }} />
            </Button>
          ))}
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.editorCard}>
        <Slate
          key={`fg-new-editor-${data?.id || "new"}-${slateMountKey}`}
          editor={editor as any}
          initialValue={initialValue as any}
          onSelectionChange={() => {
            scheduleUpdateGapFloat();
          }}
          onChange={(val: any) => {
            changeData("content", val as TFillGapsNewContent);
          }}
        >
          <div className={styles.draftArea}>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder={i18n.t("editor.startTyping", {
                defaultValue: "Начните писать",
              })}
              spellCheck
              onPointerDown={(e) => {
                isPointerSelectingRef.current = true;
                hideGapFloat();
                // iOS Safari: first tap sometimes doesn't focus; focus on "short tap"
                beginTapFocus(
                  e.target as Element | null,
                  (e as any).clientX ?? 0,
                  (e as any).clientY ?? 0,
                );
              }}
              onPointerMove={(e) => {
                const st = tapFocusRef.current;
                if (!st) return;
                const x = (e as any).clientX ?? 0;
                const y = (e as any).clientY ?? 0;
                if (Math.abs(x - st.x) > MOVE_PX || Math.abs(y - st.y) > MOVE_PX) {
                  st.moved = true;
                }
              }}
              onPointerUpCapture={(e) => tryFocusOnShortTap(e)}
              onPointerUp={() => {
                isPointerSelectingRef.current = false;
                scheduleUpdateGapFloat();
              }}
              onPointerCancel={() => {
                isPointerSelectingRef.current = false;
                clearTapFocus();
              }}
              onTouchStart={(e) => {
                isPointerSelectingRef.current = true;
                hideGapFloat();
                const t = (e as any).touches?.[0];
                beginTapFocus(
                  e.target as Element | null,
                  t?.clientX ?? 0,
                  t?.clientY ?? 0,
                );
              }}
              onTouchMove={(e) => {
                const st = tapFocusRef.current;
                if (!st) return;
                const t = (e as any).touches?.[0];
                const x = t?.clientX ?? 0;
                const y = t?.clientY ?? 0;
                if (Math.abs(x - st.x) > MOVE_PX || Math.abs(y - st.y) > MOVE_PX) {
                  st.moved = true;
                }
              }}
              onTouchEndCapture={(e) => tryFocusOnShortTap(e)}
              onTouchEnd={() => {
                isPointerSelectingRef.current = false;
                scheduleUpdateGapFloat();
              }}
              onTouchCancel={() => {
                isPointerSelectingRef.current = false;
                clearTapFocus();
              }}
              onKeyDown={(event) => {
                if (event.key === "Backspace" || event.key === "Delete") {
                  const sel = editor.selection;
                  if (sel) {
                    const findGapEntryAt = (at: any) =>
                      Array.from(
                        Editor.nodes(editor, {
                          at,
                          match: (n) => (n as any)?.type === "gap",
                        }),
                      )[0] as any;

                    const gapEntry =
                      findGapEntryAt(sel) ||
                      (sel.anchor
                        ? findGapEntryAt(Editor.before(editor, sel.anchor) || sel)
                        : undefined) ||
                      (sel.anchor
                        ? findGapEntryAt(Editor.after(editor, sel.anchor) || sel)
                        : undefined);

                    if (gapEntry) {
                      event.preventDefault();
                      const [node] = gapEntry;
                      const gid = (node as any)?.gapId as string | undefined;
                      if (gid) {
                        restoreGapToOriginalText(gid);
                        return;
                      }
                    }
                  }
                }
                if (!event.ctrlKey && !event.metaKey) return;
                if (event.key.toLowerCase() === "b") {
                  event.preventDefault();
                  toggleMark("bold");
                }
                if (event.key.toLowerCase() === "i") {
                  event.preventDefault();
                  toggleMark("italic");
                }
                if (event.key.toLowerCase() === "u") {
                  event.preventDefault();
                  toggleMark("underline");
                }
              }}
            />
          </div>
        </Slate>
      </div>

      <div className="h-10" />

      <div>
        <p className="font-light mb-2">
          <T k="editor.preview" defaultText="Превью" />
        </p>
        <div
          style={{ border: "1px solid #3F28C6", borderRadius: 4, background: "#fff" }}
          className="pointer-events-none select-none"
        >
          <FillGapsNewExView key={`fg-new-preview-${data.mode}`} data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
            size="lg"
            onPress={() => saveFillGapsNewEx(data)}
            isLoading={isLoading}
          >
            <T k="common.save" defaultText="Сохранить" />
          </Button>
        </div>
      </div>

      {portalReady &&
        gapFloatPos &&
        createPortal(
          <div
            className={styles.gapFloatWrap}
            style={{ top: gapFloatPos.top, left: gapFloatPos.left }}
          >
            <div className={styles.gapFloatInner}>
              <Button
                size="sm"
                color="primary"
                variant="solid"
                className={styles.gapFloatButton}
                onPointerDown={(e) => {
                  e.preventDefault();
                  makeGap();
                }}
              >
                <T k="editor.makeGap" defaultText="Сделать пропуск" />
              </Button>
            </div>
          </div>,
          document.body,
        )}

      <GapOptionsModal
        isOpen={gapModalOpen}
        onClose={() => setGapModalOpen(false)}
        gapId={activeGapId || ""}
        initialCorrectText={initialCorrectText}
        currentGap={activeGap}
        mode={data.mode}
        onSave={onSaveGap}
      />
    </div>
  );
};

