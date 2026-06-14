export const clampWidgetPosition = (
  left: number,
  top: number,
  widgetSize: number,
  boundsWidth: number,
  boundsHeight: number,
  offset = 8
) => {
  const maxLeft = Math.max(offset, boundsWidth - widgetSize - offset);
  const maxTop = Math.max(offset, boundsHeight - widgetSize - offset);

  return {
    left: Math.min(Math.max(left, offset), maxLeft),
    top: Math.min(Math.max(top, offset), maxTop),
  };
};
