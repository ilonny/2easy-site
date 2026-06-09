export const getSelectionEndRect = (selection: Selection): DOMRect | null => {
  const { focusNode, focusOffset } = selection;
  if (!focusNode) {
    return null;
  }

  const range = document.createRange();

  try {
    range.setStart(focusNode, focusOffset);
    range.collapse(true);
  } catch {
    return null;
  }

  const rects = range.getClientRects();
  if (rects.length > 0) {
    return rects[rects.length - 1];
  }

  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) {
    return null;
  }

  return rect;
};
