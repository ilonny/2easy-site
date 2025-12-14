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
import {pasteReactAtCaretUpdate} from "@/app/editor/components/editor/FillGapsInput/utils";

type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsInputData>;
    lastSortIndex: number;
    currentSortIndexToShift?: number;
};




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

    const contentEditableRef = useRef<HTMLDivElement>(null);

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

    const onChangeFieldValue = useCallback(
        (fieldId: string, optionIndex: number, value: string) => {
            const field = fieldsObj[fieldId]
            if (!field || !field.options[optionIndex]) return;
            field.options[optionIndex].value = value;
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );

    const onAddFieldOption = useCallback(
        (fieldId: string) => {
            const field = fieldsObj[fieldId]
            if (!field) return;
            field.options.push({isCorrect: true, value: ""});
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );

    const deleteOption = useCallback(
        (fieldId: string, optionIndex: number) => {
            const field = fieldsObj[fieldId]
            if (!field) return;
            field.options = field.options.filter((_o, i) => i !== optionIndex);
            changeData("fields", [...data.fields]);
        },
        [data.fields, fieldsObj]
    );


    // const renderContent = useCallback(() => {
    //
    //     document
    //         .querySelectorAll(".contentEditable .answerWrapper")
    //         .forEach((el) => {
    //             const field = fieldsObj[el.id]
    //             if (!field) return;
    //             el.setAttribute("index", field.id);
    //             const root = ReactDOM.createRoot(el);
    //
    //             root.render(
    //                 <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
    //                     <PopoverFields
    //                         id={field.id}
    //                         field={field}
    //                         onChangeFieldValue={onChangeFieldValue}
    //                         onAddFieldOption={onAddFieldOption}
    //                         deleteOption={deleteOption}
    //                     />
    //                 </div>
    //             );
    //
    //         });
    // }, [data.fields, fieldsObj, open]);

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

            pasteReactAtCaretUpdate(
                id,
                field,
                addItemState,
                onChangeFieldValue,
                onAddFieldOption,
                deleteOption,
            )


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
        [data.fields]
    );

    useContentEditableBehavior(contentEditableRef, onChangeText);

    useEffect(() => {
        if (!data?.id) {
            resetData(DEFAULT_VALUES_STUB);
        }
    }, [data?.id,]);

    // useEffect(() => {
    //     if (data.dataText) {
    //         document.getElementById("contentEditableWrapper")!.innerHTML =
    //             data.dataText;
    //     }
    //     renderContent();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);


    useEffect(() => {
        changeData("images", images);
    }, [images,]);

    // useEffect(() => {
    //     renderContent();
    // }, [renderContent]);

    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(DEFAULT_VALUES_STUB);
        }
    }, [success]);

    useEffect(() => {
        changeData("fields", data.fields);
        console.log('data.fields')
    }, [data.fields])

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
