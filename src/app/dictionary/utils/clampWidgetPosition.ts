export const clampWidgetPosition = (
  left: number,
  top: number,
  widgetWidth: number,
  widgetHeight: number,
  boundsWidth: number,
  boundsHeight: number,
  offset = 8
) => {
  const maxLeft = Math.max(offset, boundsWidth - widgetWidth - offset);
  const maxTop = Math.max(offset, boundsHeight - widgetHeight - offset);

  return {
    left: Math.min(Math.max(left, offset), maxLeft),
    top: Math.min(Math.max(top, offset), maxTop),
  };
};
