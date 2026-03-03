"use client";

import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TField, TFillGapsSelectData } from "./types";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Tooltip } from "@nextui-org/react";
import { useUploadFillGapsSelectEx } from "../hooks/useUploadFillGapsSelectEx";
import { AddItemCard } from "../AddItemCard";
import ReactDOM from "react-dom/client";
import { arrayMoveImmutable } from "array-move";
import { GapFieldTrigger } from "./GapFieldTrigger";
import { FieldOptionsModal } from "./FieldOptionsModal";
import styles from "./styles.module.css";
import { FillGapsSelectExView } from "../../view/FillGapsSelectExView";
import InfoIcon from "@/assets/icons/info.svg";

const defaultValuesStub: TFillGapsSelectData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "Choose the correct option to complete the sentences",
  description: "Answer the questions below",
  images: [],
  dataText: "",
  fields: [],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: TFillGapsSelectData;
  lastSortIndex: number;
  currentSortIndexToShift?: boolean;
};

export const FillGapsSelect: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveFillGapsSelectEx, success } =
    useUploadFillGapsSelectEx(lastSortIndex, currentSortIndexToShift);
  const { data, changeData, resetData } = useExData<TFillGapsSelectData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TFillGapsSelectData["images"]>(
    defaultValues?.images || []
  );
  const [activeFieldId, setActiveFieldId] = useState<number | string | null>(
    null
  );
  const rootsMapRef = useRef(new Map<Element, ReturnType<typeof ReactDOM.createRoot>>());
  const contentEditableRef = useRef<HTMLDivElement>(null);

  const activeField = data.fields.find((f) => f.id == activeFieldId);

  useEffect(() => {
    if (!data?.id) {
      resetData({
        title: "Let's practice!",
        titleColor: "#3F28C6",
        subtitle: "Choose the correct option to complete the sentences",
        description: "Answer the questions below",
        images: [],
        dataText: "",
        fields: [],
      });
    }
  }, [data?.id, resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const renderGapTriggers = useCallback(() => {
    const wrappers = document.querySelectorAll(".contentEditable .answerWrapper");
    wrappers.forEach((el) => {
      const id = el.id;
      const field = data.fields.find((f) => f.id == id);
      if (!field) return;

      el.setAttribute("index", String(field.id));
      let root = rootsMapRef.current.get(el);
      if (!root) {
        root = ReactDOM.createRoot(el);
        rootsMapRef.current.set(el, root);
      }
      root.render(
        <GapFieldTrigger
          fieldId={id}
          onOpenOptions={(fieldId) => setActiveFieldId(fieldId)}
        />
      );
    });
  }, [data.fields]);

  const onClickAddSelection = useCallback(
    (addItemState: { selection: string }) => {
      const id = new Date().getTime();
      pasteHtmlAtCaret(
        `<div style="display: inline-block;" contenteditable="false" class="answerWrapper" id=${id} answer='[${addItemState.selection}]' />&nbsp;`
      );
      const contentEditableWrapper = document.getElementById(
        "contentEditableWrapper"
      );
      const selection = window.getSelection();
      if (selection) selection.removeAllRanges();

      const field: TField = {
        id: String(id),
        options: [{ value: addItemState.selection, isCorrect: true }],
        originalWord: addItemState.selection,
      } as TField;

      const dataFields = [...data.fields, field];
      changeData("fields", dataFields);
      changeData("dataText", contentEditableWrapper?.innerHTML ?? "");
      contentEditableWrapper?.blur();
      setActiveFieldId(id);
    },
    [changeData, data.fields]
  );

  const onChangeText = useCallback(
    (text: string) => changeData("dataText", text),
    [changeData]
  );

  const onSaveOptions = useCallback(
    (fieldId: number | string, options: TFieldOption[]) => {
      const dataFields = data.fields.map((f) =>
        f.id == fieldId ? { ...f, options } : f
      );
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  useEffect(() => {
    renderGapTriggers();
  }, [data.fields, renderGapTriggers]);

  useEffect(() => {
    const wrapper = document.getElementById("contentEditableWrapper");
    if (data.dataText && wrapper) {
      wrapper.innerHTML = data.dataText;
    }
    renderGapTriggers();
  }, []);

  useEffect(() => {
    const wrapper = contentEditableRef.current;
    if (!wrapper) return;

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type !== "childList") continue;
        for (const node of Array.from(mutation.removedNodes)) {
          if (
            node instanceof HTMLElement &&
            node.classList?.contains("answerWrapper")
          ) {
            const prev = mutation.previousSibling;
            const attr = node.getAttribute("answer");
            const word = attr?.replace("[", "").replace("]", "") ?? "";
            if (prev && prev.nodeType === Node.TEXT_NODE && word) {
              prev.nodeValue = (prev.nodeValue ?? "") + " " + word + " ";
            }
            onChangeText(wrapper.innerHTML);
            break;
          }
        }
      }
    });

    observer.observe(wrapper, {
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [onChangeText]);

  useEffect(() => {
    const wrapper = document.getElementById("contentEditableWrapper");
    if (!wrapper) return;

    const onPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData?.getData("text/plain") ?? "";
      document.execCommand("insertHTML", false, text);
    };
    wrapper.addEventListener("paste", onPaste);
    return () => wrapper.removeEventListener("paste", onPaste);
  }, []);

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-[50%] pr-2">
          <TitleExInput
            label="Заголовок задания"
            value={data.title}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={data.titleColor}
          />
          <div className="h-4" />
          <TitleExInput
            label="Подзаголовок задания"
            value={data.subtitle}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label="Описание"
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-[50%] pl-2">
          <p className="font-light mb-2">Изображение для задания</p>
          <ImageUpload
            images={images}
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
      <div className="h-10" />
      <div className="flex items-center gap-2 mb-2">
        <p className="font-light">Введите текст задания</p>
        <Tooltip
          content="Выделите в тексте слово, которое хотите пропустить. Нажмите на стрелку, чтобы добавить другие варианты."
          classNames={{
            base: ["before:bg-neutral-400 dark:before:bg-white"],
            content: [
              "py-2 px-4 shadow-xl",
              "text-black bg-white max-w-[255px]",
            ],
          }}
          placement="right-end"
          color="foreground"
        >
          <Image src={InfoIcon} alt="InfoIcon" />
        </Tooltip>
      </div>
      <div className="relative">
        <div
          suppressContentEditableWarning
          contentEditable
          id="contentEditableWrapper"
          className={`p-4 contentEditable ${styles["contentEditable"]}`}
          style={{ borderRadius: 20, background: "#fff" }}
          onBlur={(e) => onChangeText(e.currentTarget.innerHTML || "")}
          ref={contentEditableRef}
        />
        <AddItemCard onClickAddSelection={onClickAddSelection} />
      </div>
      <div className="h-10" />
      <div>
        <p className="font-light mb-2">Превью</p>
        <div
          style={{
            border: "1px solid #3F28C6",
            borderRadius: 4,
            background: "#fff",
          }}
        >
          <FillGapsSelectExView isPreview={true} data={data} />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveFillGapsSelectEx(data)}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </div>
      </div>

      <FieldOptionsModal
        field={activeField}
        isOpen={activeFieldId !== null}
        onClose={() => setActiveFieldId(null)}
        onSaveOptions={onSaveOptions}
      />
    </div>
  );
};
function pasteHtmlAtCaret(html: string) {
  const sel = window.getSelection();
  if (!sel?.rangeCount) return;

  const range = sel.getRangeAt(0);
  range.deleteContents();

  const el = document.createElement("div");
  el.innerHTML = html;
  const frag = document.createDocumentFragment();
  let node: ChildNode | null;
  while ((node = el.firstChild)) {
    frag.appendChild(node);
  }
  range.insertNode(frag);
}

