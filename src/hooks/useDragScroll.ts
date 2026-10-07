import { RefObject, useEffect } from "react";

const DRAG_THRESHOLD = 5;

// Lets a mouse drag a horizontally scrollable row; touch and trackpads scroll it natively.
export const useDragScroll = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let pointerId: number | null = null;
    let startX = 0;
    let startScroll = 0;
    let dragged = false;

    const onPointerDown = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      if (element.scrollWidth <= element.clientWidth) return;
      pointerId = event.pointerId;
      startX = event.clientX;
      startScroll = element.scrollLeft;
      dragged = false;
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      const deltaX = event.clientX - startX;
      if (!dragged) {
        if (Math.abs(deltaX) < DRAG_THRESHOLD) return;
        dragged = true;
        element.setPointerCapture(event.pointerId);
        element.style.cursor = "grabbing";
      }
      element.scrollLeft = startScroll - deltaX;
    };
    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== pointerId) return;
      pointerId = null;
      element.style.cursor = "";
    };
    // A drag must not end with a click on the item under the cursor.
    const onClick = (event: MouseEvent) => {
      if (!dragged) return;
      dragged = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const onDragStart = (event: DragEvent) => event.preventDefault();

    element.addEventListener("pointerdown", onPointerDown);
    element.addEventListener("pointermove", onPointerMove);
    element.addEventListener("pointerup", onPointerUp);
    element.addEventListener("pointercancel", onPointerUp);
    element.addEventListener("click", onClick, true);
    element.addEventListener("dragstart", onDragStart);
    return () => {
      element.removeEventListener("pointerdown", onPointerDown);
      element.removeEventListener("pointermove", onPointerMove);
      element.removeEventListener("pointerup", onPointerUp);
      element.removeEventListener("pointercancel", onPointerUp);
      element.removeEventListener("click", onClick, true);
      element.removeEventListener("dragstart", onDragStart);
    };
  }, [ref]);
};
