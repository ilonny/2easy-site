import { BOARD_SAVE_STATUS_LABEL_KEY } from "../constants";
import { TBoardSaveStatus } from "../types";
import i18n from "@/i18n/config";

export const getBoardSaveStatusLabel = (status: TBoardSaveStatus): string => {
  if (status === "idle") {
    return "";
  }

  const labelKey = BOARD_SAVE_STATUS_LABEL_KEY[status];
  return labelKey ? i18n.t(labelKey) : "";
};
