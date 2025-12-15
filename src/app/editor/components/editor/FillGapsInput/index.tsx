"use client";
import {useExData} from "../hooks/useExData";
import {TField, TFillGapsInputData} from "./types";
import {FC, useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useUploadFillGapsInputEx} from "../hooks/useUploadFillGapsInputEx";
import {LeftPanel} from "./components/LeftPanel";
import {RightPanel} from "./components/RightPanel";
import {ContentSection} from "./components/ContentSection";
import {PreviewSection} from "./components/PreviewSection";
import {useContentEditableBehavior} from "./hooks/useContentEditableBehavior";
import {DEFAULT_VALUES_STUB,} from "./constants";
import {findFieldById, pasteReactAtCaretUpdate} from "@/app/editor/components/editor/FillGapsInput/utils";
import ReactDOM from "react-dom/client";
import {PopoverFields} from "@/app/editor/components/editor/FillGapsInput/PopoverFields";

type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsInputData>;
    lastSortIndex: number;
    currentSortIndexToShift?: number;
};

const roots = new Map<string, ReactDOM.Root>();


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
        (defaultValues as TFillGapsInputData) || (DEFAULT_VALUES_STUB)
    );
    const [images, setImages] = useState<TFillGapsInputData["images"]>(
        defaultValues?.images || []
    );


    const [openPopover, setOpenPopover] = useState<{ [key: string]: boolean }>({})

    const fieldsKey = useMemo(() => Object.keys(openPopover)?.[0] || '', [openPopover])

    const handleOpen = useCallback((id: string) => {
        setOpenPopover(prev => ({...prev, [id]: true}))
    }, [])

    const handleClose = useCallback((id: string) => {
        setOpenPopover(prev => {
            delete prev[id]
            return prev
        })
    }, [])

    const contentEditableRef = useRef<HTMLDivElement>(null);

    const onChangeText = useCallback(
        (text: string) => {
            changeData("dataText", text);
        },
        [changeData]
    );

    const onChangeFieldValue = useCallback(
        (fieldId: string, optionIndex: number, value: string) => {
            const dataFields = [...data.fields];
            const field = findFieldById(dataFields, fieldId)
            if (!field || !field.options[optionIndex]) return;
            field.options[optionIndex].value = value;
            changeData("fields", [...dataFields]);
        },
        [changeData, data.fields,]
    );

    const onAddFieldOption = useCallback(
        (fieldId: string) => {
            const dataFields = [...data.fields];
            const field = findFieldById(dataFields, fieldId)
            if (!field) return;
            field.options = [...field.options, {isCorrect: true, value: ""}];
            changeData("fields", [...dataFields]);
        },
        [changeData, data.fields,]
    );

    const deleteOption = useCallback(
        (fieldId: string, optionIndex: number) => {
            const dataFields = [...data.fields];
            const field = findFieldById(dataFields, fieldId)
            if (!field) return;
            field.options = field.options.filter((_o, i) => i !== optionIndex);
            changeData("fields", [...dataFields]);
        },
        [changeData, data.fields]
    );

    const renderPopover = useCallback((id?: string, create?: { element: HTMLElement, field?: TField }) => {
        if (!id) return;

        let field: TField | undefined
        let root = roots.get(id);

        if (!root) {
            if (create) {
                field = create.field
                root = ReactDOM.createRoot(create.element);
                roots.set(id, root);
            } else {
                return
            }
        } else {
            field = findFieldById(data.fields, id)
        }

        if (!field) return

        root.render(
            <PopoverFields
                openPopover={openPopover}
                onOpen={handleOpen}
                onClose={handleClose}
                id={id}
                field={field}
                onChangeFieldValue={onChangeFieldValue}
                onAddFieldOption={onAddFieldOption}
                deleteOption={deleteOption}
            />
        );
    }, [data.fields, deleteOption, handleClose, handleOpen, onAddFieldOption, onChangeFieldValue, openPopover])

    const onClickAddSelection = useCallback(
        (addItemState: { selection: string; left?: number; top?: number }) => {
            const id = String(Date.now());

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

            const element = pasteReactAtCaretUpdate(
                id,
                field,
                addItemState,
            )

            if (!element) return;

            renderPopover(id, {element, field})

            const selection = window.getSelection();
            if (selection) {
                selection.removeAllRanges();
            }

            const contentEditableWrapper = document.getElementById(
                "contentEditableWrapper"
            );
            changeData("fields", [...data.fields, field]);
            changeData("dataText", contentEditableWrapper?.innerHTML);
            contentEditableWrapper?.blur();
        },
        [changeData, data.fields, renderPopover]
    );

    useContentEditableBehavior(contentEditableRef, onChangeText);

    useEffect(() => {
        if (!data?.id) {
            resetData(DEFAULT_VALUES_STUB);
        }
    }, []);

    useEffect(() => {
        if (data.dataText) {
            const contentEditableWrapper = document.getElementById("contentEditableWrapper")
            contentEditableWrapper!.innerHTML = data.dataText;

            contentEditableWrapper!.querySelectorAll('.answerWrapper').forEach(el => {
                renderPopover(el.id, {element: el as HTMLElement, field: findFieldById(data.fields, el.id)})
            })
        }
        return () => {
            Array.from(roots).forEach(([key, value]) => {
                value.unmount()
                roots.delete(key)
            })
        }
    }, []);

    useEffect(() => {
        renderPopover(fieldsKey)
    }, [openPopover, fieldsKey, renderPopover])

    useEffect(() => {
        changeData("images", images);
    }, [images,]);

    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(DEFAULT_VALUES_STUB);
        }
    }, [success]);

    useEffect(() => {
        changeData("fields", data.fields);
    }, [changeData, data.fields])

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
