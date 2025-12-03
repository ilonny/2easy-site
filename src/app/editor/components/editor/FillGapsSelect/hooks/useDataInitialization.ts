import {useCallback, useEffect} from "react";
import {TFillGapsSelectData} from "../types";
import {defaultValuesStub} from "../constants/defaults";

export const useDataInitialization = (
    data: TFillGapsSelectData,
    images: TFillGapsSelectData["images"],
    success: boolean,
    resetData: (data: TFillGapsSelectData) => void,
    changeData: <K extends keyof TFillGapsSelectData>(key: K, value: TFillGapsSelectData[K]) => void,
    onSuccess?: () => void
) => {
    useEffect(() => {
        if (!data?.id) {
            resetData(defaultValuesStub);
        }
    }, [data?.id, resetData]);

    useEffect(() => {
        changeData("images", images);
    }, [images, changeData]);

    useEffect(() => {
        if (success) {
            onSuccess?.();
            resetData(defaultValuesStub);
        }
    }, [onSuccess, success, resetData]);
};
