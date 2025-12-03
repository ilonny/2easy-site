"use client";
import {useExData} from "../hooks/useExData";
import {TFillGapsSelectData} from "./types";
import {FC, useCallback, useState} from "react";
import styles from "./styles.module.css";
import {defaultValuesStub} from "./constants/defaults";
import {Form} from "./components/Form";
import {EditorArea} from "./components/EditorArea";
import {Preview} from "./components/Preview";
import {useUploadFillGapsSelectEx} from "../hooks/useUploadFillGapsSelectEx";
import {
    useFieldMutations,
    usePopoverRender,
    useContentEditable,
    useAddSelection,
    useDataInitialization,
} from "./hooks";

type TProps = {
    onSuccess: () => void;
    defaultValues?: Partial<TFillGapsSelectData>;
    lastSortIndex: number;
    currentSortIndexToShift?: boolean;
};

export const FillGapsSelect: FC<TProps> = ({
    onSuccess,
    defaultValues,
    lastSortIndex,
    currentSortIndexToShift,
}) => {
    const {isLoading, saveFillGapsSelectEx, success} =
        useUploadFillGapsSelectEx(lastSortIndex, currentSortIndexToShift);
    const {data, changeData, resetData} = useExData<TFillGapsSelectData>(
        defaultValues ? (defaultValues as TFillGapsSelectData) : defaultValuesStub
    );
    const [images, setImages] = useState<TFillGapsSelectData["images"]>(
        defaultValues?.images || []
    );

    // Initialize data
    useDataInitialization(data, images, success, resetData, changeData, onSuccess);

    // Field mutations callbacks
    const {onChangeFieldOption, onChangeFieldValue, onAddFieldOption, deleteOption} =
        useFieldMutations(data, changeData);

    // Add selection functionality
    const onClickAddSelection = useAddSelection(data, changeData);

    // Change text callback
    const onChangeText = useCallback(
        (text: string) => {
            changeData("dataText", text);
        },
        [changeData]
    );

    // Render popover roots
    const rootsRef = usePopoverRender(data, {
        onChangeFieldOption,
        onChangeFieldValue,
        onAddFieldOption,
        deleteOption,
    });

    // ContentEditable management
    const contentEditableRef = useContentEditable(onChangeText, rootsRef);

    return (
        <div>
            <Form data={data} changeData={changeData} images={images} setImages={setImages} />
            <div className="h-10" />
            <EditorArea
                onClickAddSelection={onClickAddSelection}
                onChangeText={onChangeText}
                contentEditableRef={contentEditableRef}
                styles={styles}
            />
            <div className="h-10" />
            <Preview data={data} isLoading={isLoading} saveFillGapsSelectEx={saveFillGapsSelectEx} />
            <div className="h-10" />
        </div>
    );
};

