import {useCallback, useEffect, useRef} from "react";
import ReactDOM, {Root} from "react-dom/client";
import {TFillGapsSelectData} from "../types";
import {PopoverFields} from "../PopoverFields";

type FieldCallbacks = {
    onChangeFieldOption: (fieldId: number, optionIndex: number) => void;
    onChangeFieldValue: (fieldId: number, optionIndex: number, value: string) => void;
    onAddFieldOption: (fieldId: number) => void;
    deleteOption: (fieldId: number, optionIndex: number) => void;
};

export const usePopoverRender = (
    data: TFillGapsSelectData,
    callbacks: FieldCallbacks
) => {
    const rootsRef = useRef<Map<number, Root>>(new Map());


    const renderContent = useCallback(() => {
        document
            .querySelectorAll(".contentEditable .answerWrapper")
            .forEach((el) => {
                const elId = el.id;
                const field = data.fields.find((f) => String(f.id) === elId);
                if (!field) return;
                el.setAttribute("index", String(field.id));
                const root = ReactDOM.createRoot(el as HTMLElement);
                root.render(
                    <div className="popover-wrapper" id={"popover-wrapper-" + field.id}>
                        <PopoverFields
                            id={field.id}
                            field={field}
                            onChangeFieldOption={callbacks.onChangeFieldOption}
                            onChangeFieldValue={callbacks.onChangeFieldValue}
                            onAddFieldOption={callbacks.onAddFieldOption}
                            deleteOption={callbacks.deleteOption}
                        />
                    </div>
                );
            });
    }, [data, callbacks]);

    useEffect(() => {
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.fields]);

    useEffect(() => {
        const wrapperEl = document.getElementById("contentEditableWrapper");
        if (data.dataText && wrapperEl) {
            wrapperEl.innerHTML = data.dataText;
        }
        renderContent();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return rootsRef;
};
