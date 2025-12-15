"use client";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { useExData } from "../hooks/useExData";
import { useUploadFillGapsDragEx } from "../hooks/useUploadFillGapsDragEx";
import { TField, TFillGapsDragData } from "./types";
import { TVideoData } from "../Video/types";
import { PopoverFields } from "./PopoverFields";
import {
    HeaderSection,
    ImageSection,
    TextEditor,
    PreviewSection,
} from "./components";
import { DEFAULT_VALUES_STUB } from "./constants";
import { pasteHtmlAtCaret as pasteHtmlAtCaretUtil } from "./utils";

type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsDragData> | undefined;
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
    const initialValues: TFillGapsDragData = {
        ...DEFAULT_VALUES_STUB,
        ...(defaultValues ?? {}),
    } as TFillGapsDragData;

    const { data, changeData, resetData } = useExData<TFillGapsDragData>(
        initialValues
    );
    const [images, setImages] = useState<TFillGapsDragData["images"]>(
        defaultValues?.images || []
    );

    useEffect(() => {
        if (!data?.dataText) {
            resetData(DEFAULT_VALUES_STUB);
        }
    }, [resetData, data?.dataText]);

    useEffect(() => {
        changeData("images", images);
    }, [images, changeData]);

    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(DEFAULT_VALUES_STUB);
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
    }, []);

    const renderContent = useCallback(() => {
        document
            .querySelectorAll(".contentEditable .answerWrapper")
            .forEach((el) => {
                const id = el.id;
                const field = data.fields.find((f) => f.id == id);
                if (field?.id) {
                    el.setAttribute("index", field.id.toString());
                }
                const root = ReactDOM.createRoot(el);
                root.render(
                    <div
                        className="popover-wrapper"
                        id={"popover-wrapper-" + field?.id}
                    >
                        {field && <PopoverFields id={id} field={field} />}
                    </div>
                );
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.fields]);

    type TAddItemState = { selection: string };

    const onClickAddSelection = useCallback(
        (addItemState: TAddItemState) => {
            const id = new Date().getTime();
            pasteHtmlAtCaretUtil(
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
            // eslint-disable-next-line react-hooks/exhaustive-deps
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.fields]);

    useEffect(() => {
        if (data.dataText) {
            const element = document.getElementById("contentEditableWrapper");
            if (element) {
                element.innerHTML = data.dataText;
            }
        }
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const contentEditableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "childList") {
                    mutation.removedNodes.forEach((removedNode) => {
                        const element = removedNode as Element;
                        if (
                            element.classList &&
                            element.classList.contains("answerWrapper")
                        ) {
                            const answer = element
                                .getAttribute("answer")
                                ?.replace("[", "")
                                .replace("]", "") || "";
                            if (mutation.previousSibling?.nodeValue !== undefined) {
                                mutation.previousSibling.nodeValue =
                                    mutation.previousSibling.nodeValue +
                                    " " +
                                    answer +
                                    " ";
                            }
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
        const pasteListener = (e: ClipboardEvent) => {
            e.preventDefault();
            // get text representation of clipboard
            const text = e.clipboardData?.getData("text/plain") || "";
            // insert text manually
            document.execCommand("insertHTML", false, text);
        };
        document
            .getElementById("contentEditableWrapper")
            ?.addEventListener("paste", pasteListener as EventListener);
        return () =>
            document
                .getElementById("contentEditableWrapper")
                ?.removeEventListener("paste", pasteListener as EventListener);
    }, []);

    return (
        <div>
            <div className="flex flex-wrap">
                <HeaderSection
                    data={data}
                    onTitleChange={(val) => changeData("title", val)}
                    onTitleColorChange={(color) => changeData("titleColor", color)}
                    onSubtitleChange={(val) => changeData("subtitle", val)}
                    onDescriptionChange={(val) => changeData("description", val)}
                />
                <ImageSection images={images} setImages={setImages} />
            </div>
            <div className="h-10" />
            <TextEditor
                contentEditableRef={contentEditableRef}
                onChangeText={onChangeText}
                onClickAddSelection={onClickAddSelection}
            />
            <div className="h-10" />
            <div>
                <PreviewSection
                    data={data}
                    onSave={async (d) => await saveFillGapsDragEx(d as TVideoData)}
                    isLoading={isLoading}
                />
            </div>
            <div className="h-10" />
        </div>
    );
};
