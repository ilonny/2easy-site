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
import { pasteHtmlAtCaret, findFieldById } from "./utils";
import { DEFAULT_VALUES_STUB } from "./constants";

/** Значения по умолчанию для создания нового упражнения */
const defaultValuesStub: TFillGapsInputData = DEFAULT_VALUES_STUB as unknown as TFillGapsInputData;

type TProps = {
  onSuccess: () => void;
  defaultValues?: Partial<TFillGapsInputData>;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

/**
 * FillGapsInput - основной компонент редактора для упражнения на заполнение пропусков
 * Управляет всем процессом создания упражнения: редактированием текста, добавлением пропусков,
 * редактированием вариантов ответов и сохранением данных
 */
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
    (defaultValues as TFillGapsInputData) || defaultValuesStub
  );
  /** Хранилище загруженных изображений для задания */
  const [images, setImages] = useState<TFillGapsInputData["images"]>(
    defaultValues?.images || []
  );

  /** Инициализирует значения по умолчанию при первой загрузке компонента */
  useEffect(() => {
    if (!data?.id) {
      resetData({
        title: "Let's practice!",
        titleColor: "#3F28C6",
        subtitle: "Fill in the gaps with the correct words",
        description: "Answer the questions below",
        images: [],
        dataText: "",
        fields: [],
      });
    }
  }, [resetData, data?.id]);

  /** Синхронизирует локальное состояние изображений с основными данными */
  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  /** Обрабатывает успешное сохранение данных - вызывает колбэк и очищает форму */
  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  /** Обновляет текст упражнения при изменении contentEditable элемента */
  const onChangeText = useCallback(
    (text: string) => {
      changeData("dataText", text);
    },
    [changeData]
  );

  /** Переключает флаг правильности ответа для выбранного варианта */
  const onChangeFieldOption = useCallback(
    (fieldId: string, optionIndex: number) => {
      const dataFields = [...data.fields];
      const field = findFieldById(dataFields, fieldId);
      if (!field) return;
      field.options[optionIndex].isCorrect = !field.options[optionIndex].isCorrect;
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  /** Обновляет текстовое значение варианта ответа */
  const onChangeFieldValue = useCallback(
    (fieldId: string, optionIndex: number, value: string) => {
      const dataFields = [...data.fields];
      const field = findFieldById(dataFields, fieldId);
      if (!field) return;
      field.options[optionIndex].value = value;
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  /** Добавляет новый вариант ответа к пропуску */
  const onAddFieldOption = useCallback(
    (fieldId: string) => {
      const dataFields = [...data.fields];
      const field = findFieldById(dataFields, fieldId);
      if (!field) return;
      field.options.push({ isCorrect: false, value: "" });
      changeData("fields", dataFields);
    },
    [data.fields, changeData]
  );

  /** Удаляет вариант ответа из пропуска */
  const deleteOption = useCallback(
    (fieldId: string, optionIndex: number) => {
      const dataFields = [...data.fields];
      const field = findFieldById(dataFields, fieldId);
      if (!field) return;
      field.options = field.options.filter((_o, i) => i !== optionIndex);
      changeData("fields", dataFields);
    },
    [changeData, data.fields]
  );

  /** Отрисовывает попавер-поля со списком вариантов ответов в каждом пропуске */
  const renderContent = useCallback(() => {
    document
      .querySelectorAll(".contentEditable .answerWrapper")
      .forEach((el) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id === id);
        if (!field) return;
        el.setAttribute("index", field.id);
        const root = ReactDOM.createRoot(el);
        root.render(
          <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
            <PopoverFields
              id={field.id}
              field={field}
              onChangeFieldOption={onChangeFieldOption}
              onChangeFieldValue={onChangeFieldValue}
              onAddFieldOption={onAddFieldOption}
              deleteOption={deleteOption}
            />
          </div>
        );
      });
  }, [data, onChangeFieldOption, onChangeFieldValue, onAddFieldOption, deleteOption]);

  /** Добавляет новый пропуск в текст на основе выделенного текста */
  const onClickAddSelection = useCallback(
    (addItemState: { selection: string; left?: number; top?: number }) => {
      const id = String(Date.now());
      pasteHtmlAtCaret(
        `<div class="inline-block answerWrapper" contenteditable="false" id=${id} answer='[${addItemState.selection}]' />&nbsp;`
      );
      const contentEditableWrapper = document.getElementById(
        "contentEditableWrapper"
      );
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }

      const field: TField = {
        id,
        startPosition: 0,
        options: [
          {
            isCorrect: true,
            value: addItemState.selection,
          },
        ],
      };

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

  /** Перерисовывает содержимое при изменении полей */
  useEffect(() => {
    renderContent();
  }, [renderContent, data.fields]);

  /** Ссылка на contentEditable элемент для управления фокусом и содержимым */
  const contentEditableRef = useRef<HTMLDivElement>(null);

  /** Инициализирует поведение contentEditable элемента (вставка, удаление) */
  useContentEditableBehavior(contentEditableRef, onChangeText);

  return (
    <div>
      <div className="flex flex-wrap">
        <LeftPanel data={data} changeData={changeData} />
        <RightPanel images={images} setImages={setImages} />
      </div>

      <div className="h-10" />

      <ContentSection
        contentEditableRef={contentEditableRef}
        onChangeText={onChangeText}
        onClickAddSelection={onClickAddSelection}
      />

      <div className="h-10" />

      <PreviewSection data={data} onSave={saveFillGapsInputEx} isLoading={isLoading} />

      <div className="h-10" />
    </div>
  );
};
