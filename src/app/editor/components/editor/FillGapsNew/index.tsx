"use client";

import { uuidv4 } from "@/app/editor/helpers";
import { ImageUpload } from "@/components/ImageUpload";
import { Button } from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import { createEditor, Editor, Transforms } from "slate";
import {
  Editable,
  ReactEditor,
  RenderElementProps,
  RenderLeafProps,
  Slate,
  withReact,
} from "slate-react";
import { withHistory } from "slate-history";

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
          text: "Введите текст. Выделите фрагмент и нажмите «Сделать пропуск».",
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

    const gap: TFillGapsNewGap = { id: gapId, options: [] };
    changeData("gaps", (data.gaps || []).concat(gap));
    openGapModalFor(gapId, selectedText.trim());
  }, [changeData, data.gaps, editor, openGapModalFor]);

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

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-[50%] pr-2">
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
        <div className="w-[50%] pl-2">
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
              1) Напишите текст задания. 2) Выделите фрагмент, который должен стать
              пропуском. 3) Нажмите «Сделать пропуск» и добавьте варианты ответа.
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
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPointerDown={(e) => {
              e.preventDefault();
              makeGap();
            }}
          >
            Сделать пропуск
          </Button>
        </div>
      </div>

      <div className="h-4" />

      <div className={styles.editorCard}>
        <Slate
          key={`fg-new-editor-${data?.id || "new"}-${slateMountKey}`}
          editor={editor as any}
          initialValue={initialValue as any}
          onChange={(val: any) => {
            changeData("content", val as TFillGapsNewContent);
          }}
        >
          <Editable
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Начните писать..."
            spellCheck
            onPointerDown={() => {
              try {
                ReactEditor.focus(editor as any);
              } catch {}
            }}
            onTouchStart={() => {
              try {
                ReactEditor.focus(editor as any);
              } catch {}
            }}
            onKeyDown={(event) => {
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
            className="min-w-[310px]"
            size="lg"
            onPress={() => saveFillGapsNewEx(data)}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </div>
      </div>

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

