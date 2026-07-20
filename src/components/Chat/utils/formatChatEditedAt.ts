import dayjs from "dayjs";

/** Today → HH:mm; other day → DD.MM.YYYY HH:mm */
export const formatChatEditedAt = (editedAt: string | null | undefined) => {
  if (!editedAt) return null;
  const edited = dayjs(editedAt);
  if (!edited.isValid()) return null;
  if (edited.isSame(dayjs(), "day")) {
    return edited.format("HH:mm");
  }
  return edited.format("DD.MM.YYYY HH:mm");
};
