import {useCallback, useMemo} from "react";
import {TFillGapsSelectData} from "../types";

type FieldMutationHandlers = {
    toggleOption: (fieldId: number, optionIndex: number) => void;
    updateOptionValue: (fieldId: number, optionIndex: number, value: string) => void;
    addOption: (fieldId: number) => void;
    removeOption: (fieldId: number, optionIndex: number) => void;
};

export const useFieldMutations = (
    data: TFillGapsSelectData,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void
) => {
    const fieldMutationHandlers = useMemo<FieldMutationHandlers>(
        () => ({
            toggleOption: (fieldId: number, optionIndex: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options[optionIndex].isCorrect = !field.options[optionIndex].isCorrect;
                changeData("fields", dataFields);
            },
            updateOptionValue: (fieldId: number, optionIndex: number, value: string) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options[optionIndex].value = value;
                changeData("fields", dataFields);
            },
            addOption: (fieldId: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options.push({value: "", isCorrect: false});
                changeData("fields", dataFields);
            },
            removeOption: (fieldId: number, optionIndex: number) => {
                const dataFields = [...data.fields];
                const field = dataFields.find((f) => f.id === fieldId);
                if (!field) return;
                field.options = field.options.filter((_o, i) => i !== optionIndex);
                changeData("fields", dataFields);
            },
        }),
        [data.fields, changeData]
    );

    const onChangeFieldOption = useCallback(
        (fieldId: number, optionIndex: number) => fieldMutationHandlers.toggleOption(fieldId, optionIndex),
        [fieldMutationHandlers]
    );

    const onChangeFieldValue = useCallback(
        (fieldId: number, optionIndex: number, value: string) =>
            fieldMutationHandlers.updateOptionValue(fieldId, optionIndex, value),
        [fieldMutationHandlers]
    );

    const onAddFieldOption = useCallback(
        (fieldId: number) => fieldMutationHandlers.addOption(fieldId),
        [fieldMutationHandlers]
    );

    const deleteOption = useCallback(
        (fieldId: number, optionIndex: number) => fieldMutationHandlers.removeOption(fieldId, optionIndex),
        [fieldMutationHandlers]
    );

    return {
        onChangeFieldOption,
        onChangeFieldValue,
        onAddFieldOption,
        deleteOption,
    };
};
