"use client";
import { createContext, Dispatch, SetStateAction, useState } from "react";

type TContextValue = {
  scrollToExId: number | undefined;
  setScrollToExId: Dispatch<SetStateAction<number | undefined>>;
  lessonIdOverride?: string | number | null;
  setLessonIdOverride: Dispatch<SetStateAction<string | number | null>>;
};

export const EditorContext = createContext<TContextValue>({
  scrollToExId: undefined,
  setScrollToExId: () => {},
  lessonIdOverride: null,
  setLessonIdOverride: () => {},
});

export const EditorContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scrollToExId, setScrollToExId] = useState<number | undefined>();
  const [lessonIdOverride, setLessonIdOverride] = useState<
    string | number | null
  >(null);

  return (
    <EditorContext.Provider
      value={{
        scrollToExId,
        setScrollToExId,
        lessonIdOverride,
        setLessonIdOverride,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
