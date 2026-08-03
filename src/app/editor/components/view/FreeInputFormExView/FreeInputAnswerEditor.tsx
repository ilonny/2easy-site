"use client";

import { FC, useMemo } from "react";
import dynamic from "next/dynamic";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import {
  FREE_INPUT_EMPTY_TOOLBAR,
  FREE_INPUT_TEACHER_TOOLBAR,
} from "./constants";
import { useSyncedAnswerEditor } from "./useSyncedAnswerEditor";
import styles from "./styles.module.css";

const Editor = dynamic(
  () =>
    import("react-draft-wysiwyg").then(({ Editor: WysiwygEditor }) => {
      return WysiwygEditor;
    }),
  { ssr: false }
);

type TProps = {
  value?: string;
  onChange: (html: string) => void;
  placeholder?: string;
  showToolbar?: boolean;
  readOnly?: boolean;
};

export const FreeInputAnswerEditor: FC<TProps> = ({
  value,
  onChange,
  placeholder = "Введите текст",
  showToolbar = false,
  readOnly = false,
}) => {
  const { editorState, onEditorStateChange, onFocus, onBlur } =
    useSyncedAnswerEditor({ value, onChange, readOnly });

  const toolbar = useMemo(
    () => (showToolbar ? FREE_INPUT_TEACHER_TOOLBAR : FREE_INPUT_EMPTY_TOOLBAR),
    [showToolbar]
  );

  return (
    <div
      className={`${styles.editor} ${showToolbar ? styles.editorWithToolbar : ""} ${
        readOnly ? styles.editorReadOnly : ""
      }`}
    >
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder}
        readOnly={readOnly}
        toolbarHidden={!showToolbar}
        toolbar={toolbar}
        stripPastedStyles={!showToolbar}
        toolbarClassName={styles.toolbar}
        wrapperClassName={styles.wrapper}
        editorClassName={styles.body}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    </div>
  );
};
