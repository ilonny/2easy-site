"use client";
import {useExData} from "../hooks/useExData";
import {TField, TFillGapsInputData} from "./types";
import {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useUploadFillGapsInputEx} from "../hooks/useUploadFillGapsInputEx";
import ReactDOM from "react-dom/client";
import {PopoverFields} from "./PopoverFields";
import {LeftPanel} from "./components/LeftPanel";
import {RightPanel} from "./components/RightPanel";
import {ContentSection} from "./components/ContentSection";
import {PreviewSection} from "./components/PreviewSection";
import {useContentEditableBehavior} from "./hooks/useContentEditableBehavior";
import {pasteHtmlAtCaret,} from "./utils";
import {DEFAULT_VALUES_STUB,} from "./constants";

type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsInputData>;
    lastSortIndex: number;
    currentSortIndexToShift?: number;
};

/** Значения по умолчанию для создания нового упражнения */
const defaultValuesStub: TFillGapsInputData = DEFAULT_VALUES_STUB as unknown as TFillGapsInputData;

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
    const {isLoading, saveFillGapsInputEx, success} = useUploadFillGapsInputEx(
        lastSortIndex,
        currentSortIndexToShift
    );
    const {data, changeData, resetData} = useExData<TFillGapsInputData>(
        (defaultValues as TFillGapsInputData) || defaultValuesStub
    );
    /** Хранилище загруженных изображений для задания */
    const [images, setImages] = useState<TFillGapsInputData["images"]>(
        defaultValues?.images || []
    );

    /** Ссылка на contentEditable элемент для управления фокусом и содержимым */
    const contentEditableRef = useRef<HTMLDivElement>(null);

    /** Обновляет текст упражнения при изменении contentEditable элемента */
    const onChangeText = useCallback(
        (text: string) => {
            changeData("dataText", text);
        },
        []
    );

    const fieldsObj = useMemo(() => {
        if (data.fields?.length) {
            return Object.fromEntries(
                data.fields.map(item => [item.id, item])
            );
        }
        return {}
    }, [data.fields])

    /** Обновляет текстовое значение варианта ответа */
    const onChangeFieldValue = useCallback(
        (fieldId: string, optionIndex: number, value: string) => {
            const field = fieldsObj[fieldId]
            if (!field || !field.options[optionIndex]) return;
            field.options[optionIndex].value = value;
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );

    /** Добавляет новый вариант ответа к пропуску */
    const onAddFieldOption = useCallback(
        (fieldId: string) => {
            const field = fieldsObj[fieldId]
            if (!field) return;
            field.options.push({isCorrect: true, value: ""});
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );

    /** Удаляет вариант ответа из пропуска */
    const deleteOption = useCallback(
        (fieldId: string, optionIndex: number) => {
            const field = fieldsObj[fieldId]
            if (!field) return;
            field.options = field.options.filter((_o, i) => i !== optionIndex);
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );


    /** Отрисовывает попавер-поля со списком вариантов ответов в каждом пропуске */
    const renderContent = useCallback(() => {

        document
            .querySelectorAll(".contentEditable .answerWrapper")
            .forEach((el) => {
                const field = fieldsObj[el.id]
                if (!field) return;
                el.setAttribute("index", field.id);
                const root = ReactDOM.createRoot(el);

                root.render(
                    <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
                        <PopoverFields
                            id={field.id}
                            field={field}
                            onChangeFieldValue={onChangeFieldValue}
                            onAddFieldOption={onAddFieldOption}
                            deleteOption={deleteOption}
                        />
                    </div>
                );

            });
    }, [data.fields, fieldsObj, open]);

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

            changeData("fields", [...data.fields, field]);
            changeData("dataText", contentEditableWrapper?.innerHTML);
            contentEditableWrapper?.blur();
        },
        [data]
    );

    /** Инициализирует поведение contentEditable элемента (вставка, удаление) */
    useContentEditableBehavior(contentEditableRef, onChangeText);

    /** Инициализирует значения по умолчанию при первой загрузке компонента */
    useEffect(() => {
        if (!data?.id) {
            resetData(defaultValuesStub);
        }
    }, [data?.id,]);

    /** Синхронизирует contentEditable содержимое с состоянием */
    useEffect(() => {
        if (data.dataText) {
            document.getElementById("contentEditableWrapper")!.innerHTML =
                data.dataText;
        }
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /** Синхронизирует изображения с основными данными */
    useEffect(() => {
        changeData("images", images);
    }, [images,]);

    /** Перерисовывает содержимое при изменении полей */
    useEffect(() => {
        renderContent();
    }, [renderContent]);

    /** Обрабатывает успешное сохранение данных */
    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(defaultValuesStub);
        }
    }, [success]);

    return (
        <div>
            <div className="flex flex-wrap">
                <LeftPanel data={data} changeData={changeData}/>
                <RightPanel images={images} setImages={setImages}/>
            </div>

            <div className="h-10"/>

            <ContentSection
                contentEditableRef={contentEditableRef}
                onChangeText={onChangeText}
                onClickAddSelection={onClickAddSelection}
            />

            <div className="h-10"/>

            <PreviewSection data={data} onSave={saveFillGapsInputEx} isLoading={isLoading}/>

            <div className="h-10"/>
        </div>
    );
};
