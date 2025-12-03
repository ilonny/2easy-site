import {useCallback} from "react";
import {pasteHtmlAtCaret} from "../helpers/pasteHtmlAtCaret";
import {TField, TFillGapsSelectData} from "../types";

export const useAddSelection = (
    data: TFillGapsSelectData,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void
) => {
    return useCallback(
        (addItemState: {selection: string}) => {
            const id = new Date().getTime();
            pasteHtmlAtCaret(
                `<div style="display: inline-block;" contenteditable="false" class="answerWrapper" id=${id} answer='[${addItemState.selection}]' />&nbsp;`
            );
            const contentEditableWrapper = document.getElementById("contentEditableWrapper");
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
            } as TField;

            const dataFields = [...data.fields];
            dataFields.push(field);

            changeData("fields", [...dataFields]);
            changeData("dataText", contentEditableWrapper?.innerHTML);
            contentEditableWrapper?.blur();
        },
        [changeData, data]
    );
};
