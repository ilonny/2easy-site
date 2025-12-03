"use client";
import { useExData } from "../hooks/useExData";
import { TField, TFillGapsSelectData } from "./types";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { PopoverFields } from "./PopoverFields";
import styles from "./styles.module.css";
import { defaultValuesStub } from "./constants/defaults";
import { pasteHtmlAtCaret } from "./helpers/pasteHtmlAtCaret";
import { Form } from "./components/Form";
import { EditorArea } from "./components/EditorArea";
import { Preview } from "./components/Preview";
import { useUploadFillGapsSelectEx } from "../hooks/useUploadFillGapsSelectEx";

type TProps = {
    onSuccess: () => void;
    defaultValues?: any;
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

    useEffect(() => {
        !data?.id && resetData(defaultValuesStub);
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
                originalWord: addItemState.selection,
            } as unknown as TField;

            const dataFields = [...data.fields];
            dataFields.push(field);

            changeData("fields", [...dataFields]);
            changeData("dataText", contentEditableWrapper?.innerHTML);
            contentEditableWrapper?.blur();
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
            field.options.push({ value: "", isCorrect: false });
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
            const text = (e.originalEvent || e).clipboardData.getData("text/plain");
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
            <Form
                data={data}
                changeData={changeData}
                images={images}
                setImages={setImages}
            />

            <div className="h-10" />

            <EditorArea
                onClickAddSelection={onClickAddSelection}
                onChangeText={onChangeText}
                contentEditableRef={contentEditableRef}
                styles={styles}
            />

            <div className="h-10" />

            <Preview
                data={data}
                isLoading={isLoading}
                saveFillGapsSelectEx={saveFillGapsSelectEx}
            />

            <div className="h-10" />
        </div>
    );
};

