"use client";
import { useExData } from "../hooks/useExData";
import { TField, TFillGapsInputData } from "./types";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useUploadFillGapsInputEx } from "../hooks/useUploadFillGapsInputEx";
import ReactDOM from "react-dom/client";
import { PopoverFields } from "./PopoverFields";
import { LeftPanel } from "./components/LeftPanel";
import { RightPanel } from "./components/RightPanel";
import { ContentSection } from "./components/ContentSection";
import { PreviewSection } from "./components/PreviewSection";
import { useContentEditableBehavior } from "./hooks/useContentEditableBehavior";

const defaultValuesStub: TFillGapsInputData = {
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

export const FillGapsInput: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveFillGapsInputEx, success } = useUploadFillGapsInputEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TFillGapsInputData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TFillGapsInputData["images"]>(
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
            <PopoverFields
              id={id}
              field={field}
              onChangeFieldOption={onChangeFieldOption}
              onChangeFieldValue={onChangeFieldValue}
              onAddFieldOption={onAddFieldOption}
              deleteOption={deleteOption}
            />
          </div>
        );
      });
  }, [data]);

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
        options: [
          {
            isCorrect: true,
            value: addItemState.selection,
          },
        ],
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
    },
    [changeData]
  );

  const onChangeFieldOption = useCallback(
    (fieldId: number, optionIndex: number) => {
      const dataFields = [...data.fields];
      const field = dataFields.find((f) => f.id == fieldId);
      field.options[optionIndex].isCorrect =
        !field.options[optionIndex].isCorrect;
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  const onChangeFieldValue = useCallback(
    (fieldId: number, optionIndex: number, value: string) => {
      const dataFields = [...data.fields];
      const field = dataFields.find((f) => f.id == fieldId);
      field.options[optionIndex].value = value;
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  const onAddFieldOption = useCallback(
    (fieldId: number) => {
      const dataFields = [...data.fields];
      const field = dataFields.find((f) => f.id == fieldId);
      field.options.push({ value: "", isCorrect: true });
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  const deleteOption = useCallback(
    (fieldId: number, optionIndex: number) => {
      const dataFields = [...data.fields];
      const field = dataFields.find((f) => f.id == fieldId);
      field.options = field.options.filter((_o, i) => i !== optionIndex);
      changeData("fields", dataFields);
    },
    [changeData, data.fields]
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

  const contentEditableRef = useRef<HTMLDivElement>(null);





  // Управление contentEditable поведением
  useContentEditableBehavior(contentEditableRef, onChangeText);

  return (
    <div>
      <div className="flex flex-wrap">
        <LeftPanel data={data} changeData={changeData} />
        <RightPanel images={images} setImages={setImages} />
      </div>

      <div className="h-10" />

      <ContentSection
        contentEditableRef={contentEditableRef as any}
        onChangeText={onChangeText}
        onClickAddSelection={onClickAddSelection}
      />

      <div className="h-10" />

      <PreviewSection data={data} onSave={saveFillGapsInputEx} isLoading={isLoading} />

      <div className="h-10" />
    </div>
  );
};

function pasteHtmlAtCaret(html: string) {
  let sel, range;
  if (window.getSelection) {
    sel = window.getSelection();
    if (!sel) {
      return;
    }
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
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
  }
}
