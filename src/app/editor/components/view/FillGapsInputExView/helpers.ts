import { TField } from "../../editor/FillGapsSelect/types";
import {
  ANSWER_WRAPPER_AREA_PREFIX,
  SMALL_MULTIPLIER,
  LARGE_MULTIPLIER,
} from "./constants";

export const getAnswerWrapperSelector = (dataId?: number | string) =>
  `${ANSWER_WRAPPER_AREA_PREFIX + (dataId || 0).toString()} .answerWrapper`;

export const getMaxOptionLength = (field?: TField) => {
  return Math.max(...(field?.options?.map((o) => o.value.length) || [0]));
};

export const computeMaxWidth = (maxOptionLength: number) => {
  return maxOptionLength * (maxOptionLength < 5 ? SMALL_MULTIPLIER : LARGE_MULTIPLIER);
};

export const getToolTipContent = (field?: TField) =>
  field?.options?.filter((o) => o.isCorrect).map((o) => o.value).join(", ") || "";
