"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TField, TFillGapsDragData } from "./types";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useUploadFillGapsDragEx } from "../hooks/useUploadFillGapsDragEx";
import { AddItemCard } from "../AddItemCard";
import ReactDOM from "react-dom/client";
import { PopoverFields } from "./PopoverFields";
import styles from "./styles.module.css";
import { FillGapsDragExView } from "../../view/FillGapsDragExView";

const defaultValuesStub: TFillGapsDragData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "Fill in the gaps with the correct words",
  description: "Answer the questions below",
  images: [],
  dataText: "",
  fields: [],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const FillGapsDrag: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveFillGapsDragEx, success } = useUploadFillGapsDragEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TFillGapsDragData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TFillGapsDragData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Let's practice!",
        titleColor: "#3F28C6",
        subtitle: "Fill in the gaps with the correct words",
        description: "Answer the questions below",
        images: [],
        dataText: "",
        fields: [],
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const checkFields = useCallback(() => {
    // const fields = [...data.fields];
    // console.log('checkFields', data.fields)
    // changeData(
    //   "fields",
    //   fields.filter((field) => {
    //     const el = document.getElementById("popover-wrapper-" + field.id);
    //     console.log("el??", el);
    //     return !!el;
    //   })
    // );
    // setTimeout(() => {
    //   renderContent()
    // }, 100);
  }, [changeData, data.fields]);

  const renderContent = useCallback(() => {
    document
      .querySelectorAll(".contentEditable .answerWrapper")
      .forEach((el, index) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id == id);
        el.setAttribute("index", field?.id?.toString());
        const root = ReactDOM.createRoot(el);
        root.render(
          <div className="popover-wrapper" id={"popover-wrapper-" + field?.id}>
            <PopoverFields id={id} field={field} />
          </div>
        );
      });
    // setTimeout(() => {
    //   checkFields();
    // }, 100);
  }, [checkFields, data.fields]);

  const onClickAddSelection = useCallback(
    (addItemState: any) => {
      const id = new Date().getTime();
      pasteHtmlAtCaret(
        `<div style="display: inline-block;" contenteditable="false" class="answerWrapper" id=${id} answer='[${addItemState.selection}]' />&nbsp;`
      );
      const contentEditableWrapper = document.getElementById(
        "contentEditableWrapper"
      );
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      const field = {
        id,
        value: addItemState.selection,
      } as unknown as TField;

      const dataFields = [...data.fields];
      dataFields.push(field);

      changeData("fields", [...dataFields]);
      changeData("dataText", contentEditableWrapper?.innerHTML);
      contentEditableWrapper?.blur();
      // setTimeout(() => {
      //   renderContent();
      // }, 100);
    },
    [changeData, data]
  );

  const onChangeText = useCallback(
    (text: string) => {
      changeData("dataText", text);
      setTimeout(() => {
        checkFields();
      }, 1000);
    },
    [changeData, checkFields]
  );

  useEffect(() => {
    renderContent();
  }, [data.fields]);

  useEffect(() => {
    if (data.dataText) {
      document.getElementById("contentEditableWrapper").innerHTML =
        data.dataText;
    }
    renderContent();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const res = data.fields.filter((field) => {
        const el = document.getElementById("popover-wrapper-" + field.id);
        return !!el;
      });
      if (res.length !== data.fields.length) {
        changeData("fields", res);
      }
    }, 500);
  }, [data.dataText, data.fields, changeData]);

  const contentEditableRef = useRef(null);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.removedNodes.forEach((removedNode) => {
            if (
              removedNode.classList &&
              removedNode.classList.contains("answerWrapper")
            ) {
              mutation.previousSibling.nodeValue =
                mutation.previousSibling?.nodeValue +
                " " +
                removedNode
                  ?.getAttribute("answer")
                  .replace("[", "")
                  .replace("]", "") +
                " ";
              onChangeText(contentEditableRef.current?.innerHTML || "");
            }
          });
        }
      });
    });

    const currentRef = contentEditableRef.current;

    if (currentRef) {
      observer.observe(currentRef, {
        childList: true,
        subtree: true,
        characterData: false,
      });
    }

    return () => {
      observer.disconnect();
    };
  }, [onChangeText]);

  useEffect(() => {
    const pasteListener = (e) => {
      e.preventDefault();
      // get text representation of clipboard
      const text = (e.originalEvent || e).clipboardData.getData("text/plain");
      // insert text manually
      document.execCommand("insertHTML", false, text);
    };
    document
      .getElementById("contentEditableWrapper")
      ?.addEventListener("paste", pasteListener);
    return () =>
      document
        .getElementById("contentEditableWrapper")
        ?.removeEventListener("paste", pasteListener);
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
      <p className="font-light mb-2">Введите текст задания</p>
      <div className="relative">
        <div
          suppressContentEditableWarning
          contentEditable
          id="contentEditableWrapper"
          className={`p-4 contentEditable contentEditableDrag ${styles["contentEditable"]}`}
          style={{ borderRadius: 20, background: "#fff" }}
          onBlur={(e) => onChangeText(e.currentTarget.innerHTML || "")}
          ref={contentEditableRef}
        ></div>
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
          <FillGapsDragExView isPreview={true} data={data} />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveFillGapsDragEx(data)}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
};

function pasteHtmlAtCaret(html: string) {
  let sel, range;
  if (window.getSelection) {
    // IE9 and non-IE
    sel = window.getSelection();
    if (!sel) {
      return;
    }
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();

      // Range.createContextualFragment() would be useful here but is
      // non-standard and not supported in all browsers (IE9, for one)
      const el = document.createElement("div");
      el.innerHTML = html;
      let frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
    }
  }
}
