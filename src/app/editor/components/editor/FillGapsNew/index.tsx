"use client";

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FillGapsNewExView } from "../../view/FillGapsNewExView";
import { useExData } from "../hooks/useExData";
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

  useEffect(() => {
    setPortalReady(true);
  }, []);

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
        { id: "select", title: "Выбрать", desc: "Ученик выбирает вариант из списка" },
        { id: "input", title: "Вписать", desc: "Ученик вводит ответ вручную" },
        { id: "drag", title: "Перетащить", desc: "Перетаскивание из списка" },
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

  const scheduleUpdateGapFloat = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
          const margin = 10;
          // Сначала над выделением — реже пересекается со строкой ниже и с уже созданными пропусками
          let top = rect.top - approxH - margin;
          if (top < 8) {
            top = rect.bottom + margin;
          }
          if (top + approxH > window.innerHeight - 8) {
            top = Math.max(8, window.innerHeight - approxH - 8);
          }
          const left = rect.left + rect.width / 2;
          const clampedLeft = Math.max(96, Math.min(left, window.innerWidth - 96));
          setGapFloatPos({ top, left: clampedLeft });
        } catch {
          setGapFloatPos(null);
        }
      });
    });
  }, [editor]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fn = () => scheduleUpdateGapFloat();
    window.addEventListener("scroll", fn, true);
    window.addEventListener("resize", fn);
    document.addEventListener("selectionchange", fn);
    return () => {
      window.removeEventListener("scroll", fn, true);
      window.removeEventListener("resize", fn);
      document.removeEventListener("selectionchange", fn);
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
              e.preventDefault();
              openGapModalFor(gapId);
            }}
            onTouchStart={(e) => {
              e.preventDefault();
              openGapModalFor(gapId);
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
  } | null>(null);

  const getScrollParent = useCallback((el: Element | null): Element | null => {
    let cur: Element | null = el;
    while (cur) {
      const style = window.getComputedStyle(cur);
      const oy = style.overflowY;
      if ((oy === "auto" || oy === "scroll") && (cur as HTMLElement).scrollHeight > (cur as HTMLElement).clientHeight) {
        return cur;
      }
      cur = cur.parentElement;
    }
    return document.scrollingElement || document.documentElement;
  }, []);

  const tryFocusOnShortTap = useCallback(() => {
    const st = tapFocusRef.current;
    tapFocusRef.current = null;
    if (!st) return;
    if (st.moved) return; // selection drag
    if (Date.now() - st.t > 350) return; // long-press selection
    // If any scrolling happened (modal body / page), don't focus
    try {
      const nowScrollY = window.scrollY;
      const nowTop =
        st.scrollEl && "scrollTop" in (st.scrollEl as any) ? Number((st.scrollEl as any).scrollTop || 0) : st.scrollElTop;
      if (nowScrollY !== st.scrollY) return;
      if (nowTop !== st.scrollElTop) return;
    } catch {}
    try {
      ReactEditor.focus(editor as any);
      // iOS Safari: sometimes ReactEditor.focus sets outline but no keyboard;
      // focusing the underlying DOM node helps.
      try {
        const dom = ReactEditor.toDOMNode(editor as any, editor as any) as HTMLElement | null;
        dom?.focus?.();
      } catch {}
    } catch {}
  }, [editor]);

  return (
    <div>
      <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-0">
        <div className="w-full md:w-1/2 md:pr-2 min-w-0">
          <TitleExInput
            label="Заголовок задания"
            value={data.title || ""}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={(data.titleColor as any) || "#3F28C6"}
          />
          <div className="h-4" />
          <TitleExInput
            label="Подзаголовок"
            value={data.subtitle || ""}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label="Описание"
            value={data.description || ""}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-full md:w-1/2 md:pl-2 min-w-0">
          <p className="font-light mb-2">Изображение для задания</p>
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
                  Нажмите на этот блок или перетащите сюда изображения
                </p>
              </div>
            }
          />
        </div>
      </div>

      <div className="h-6" />

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div>
            <div className={styles.question}>Как вставить пропуск?</div>
            <div className={styles.hint}>
              Выберите режим выполнения. Его можно менять в любой момент.
            </div>
            <div className={styles.howto}>
              1) Напишите текст задания. 2) Выделите фрагмент, который должен стать пропуском. 3)
              Нажмите «Сделать пропуск» и добавьте варианты ответа.
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
                <div className={styles.modeTitle}>{m.title}</div>
                <div className={styles.modeDesc}>{m.desc}</div>
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
            scheduleUpdateGapFloat();
          }}
        >
          <div className={styles.draftArea}>
            <Editable
              renderElement={renderElement}
              renderLeaf={renderLeaf}
              placeholder="Начните писать..."
              spellCheck
              onPointerDown={(e) => {
                // iOS Safari: first tap sometimes doesn't focus; focus on "short tap"
                const se = getScrollParent((e as any).target as Element | null);
                tapFocusRef.current = {
                  t: Date.now(),
                  x: (e as any).clientX ?? 0,
                  y: (e as any).clientY ?? 0,
                  moved: false,
                  scrollY: window.scrollY,
                  scrollEl: se,
                  scrollElTop: se && "scrollTop" in (se as any) ? Number((se as any).scrollTop || 0) : 0,
                };
              }}
              onPointerMove={(e) => {
                const st = tapFocusRef.current;
                if (!st) return;
                const x = (e as any).clientX ?? 0;
                const y = (e as any).clientY ?? 0;
                if (Math.abs(x - st.x) > 8 || Math.abs(y - st.y) > 8) st.moved = true;
              }}
              onPointerUpCapture={tryFocusOnShortTap}
              onPointerCancel={() => {
                tapFocusRef.current = null;
              }}
              onTouchStart={(e) => {
                const t = (e as any).touches?.[0];
                const se = getScrollParent((e as any).target as Element | null);
                tapFocusRef.current = {
                  t: Date.now(),
                  x: t?.clientX ?? 0,
                  y: t?.clientY ?? 0,
                  moved: false,
                  scrollY: window.scrollY,
                  scrollEl: se,
                  scrollElTop: se && "scrollTop" in (se as any) ? Number((se as any).scrollTop || 0) : 0,
                };
              }}
              onTouchMove={(e) => {
                const st = tapFocusRef.current;
                if (!st) return;
                const t = (e as any).touches?.[0];
                const x = t?.clientX ?? 0;
                const y = t?.clientY ?? 0;
                if (Math.abs(x - st.x) > 8 || Math.abs(y - st.y) > 8) st.moved = true;
              }}
              onTouchEndCapture={tryFocusOnShortTap}
              onTouchEnd={() => {
                scheduleUpdateGapFloat();
              }}
              onTouchCancel={() => {
                tapFocusRef.current = null;
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

                    let gapEntry =
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
        <p className="font-light mb-2">Превью</p>
        <div style={{ border: "1px solid #3F28C6", borderRadius: 4, background: "#fff" }}>
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
            Сохранить
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
                Сделать пропуск
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
        onSave={onSaveGap}
      />
    </div>
  );
};

