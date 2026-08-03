import { useCallback, useEffect, useRef, useState } from "react";
import { EditorState } from "draft-js";
import {
  editorStateFromAnswer,
  htmlFromEditorState,
  normalizeAnswerValue,
} from "./draftAnswer";

type TParams = {
  value?: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
};

/**
 * Keeps draft-js state in sync with a remote string value without
 * stealing focus / wiping in-progress edits.
 */
export const useSyncedAnswerEditor = ({
  value,
  onChange,
  readOnly = false,
}: TParams) => {
  const [editorState, setEditorState] = useState(() =>
    editorStateFromAnswer(value)
  );

  const focusedRef = useRef(false);
  const lastEmittedRef = useRef(normalizeAnswerValue(value));
  const valueAtFocusRef = useRef(normalizeAnswerValue(value));
  const pendingRemoteRef = useRef<string | null>(null);
  const isInternalChangeRef = useRef(false);

  const applyExternalValue = useCallback((next: string) => {
    lastEmittedRef.current = next;
    pendingRemoteRef.current = null;
    isInternalChangeRef.current = true;
    setEditorState(editorStateFromAnswer(next));
  }, []);

  useEffect(() => {
    const next = normalizeAnswerValue(value);
    if (focusedRef.current) {
      pendingRemoteRef.current = next;
      return;
    }
    if (next === lastEmittedRef.current) return;
    applyExternalValue(next);
  }, [value, applyExternalValue]);

  const onEditorStateChange = useCallback(
    (nextState: EditorState) => {
      setEditorState(nextState);
      if (isInternalChangeRef.current) {
        isInternalChangeRef.current = false;
        return;
      }
      if (readOnly) return;

      const html = htmlFromEditorState(nextState);
      if (html === lastEmittedRef.current) return;
      lastEmittedRef.current = html;
      onChange(html);
    },
    [onChange, readOnly]
  );

  const onFocus = useCallback(() => {
    focusedRef.current = true;
    valueAtFocusRef.current = lastEmittedRef.current;
    pendingRemoteRef.current = null;
  }, []);

  const onBlur = useCallback(() => {
    focusedRef.current = false;
    const pending = pendingRemoteRef.current;
    pendingRemoteRef.current = null;

    // Apply remote only if the user didn't edit while focused.
    if (
      pending != null &&
      pending !== lastEmittedRef.current &&
      lastEmittedRef.current === valueAtFocusRef.current
    ) {
      applyExternalValue(pending);
    }
  }, [applyExternalValue]);

  return {
    editorState,
    onEditorStateChange,
    onFocus,
    onBlur,
  };
};
