"use client";

import { useEffect } from "react";

/**
 * Keep macOS Chrome/Safari from treating two-finger trackpad pans as
 * browser back/forward while the board editor is mounted.
 *
 * Excalidraw 0.18 only toggles documentElement.overscrollBehaviorX on
 * pointer enter/leave, which leaves a window where the history swipe can arm.
 * A root data attribute + CSS !important keeps the gesture disabled for the
 * whole mount lifetime (page and lesson modal).
 */
export const useDisableBrowserHistorySwipe = () => {
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.boardEditorOpen = "1";
    return () => {
      delete root.dataset.boardEditorOpen;
    };
  }, []);
};
