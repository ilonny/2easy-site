"use client";
import { createContext, Dispatch, SetStateAction, useState } from "react";

type TContextValue = {
  scrollToExId: number | undefined;
  setScrollToExId: Dispatch<SetStateAction<number | undefined>>;
};

export const EditorContext = createContext<TContextValue>({
  scrollToExId: undefined,
  setScrollToExId: () => {},
});

export const EditorContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [scrollToExId, setScrollToExId] = useState<number | undefined>();

  return (
    <EditorContext.Provider value={{ scrollToExId, setScrollToExId }}>
      {children}
    </EditorContext.Provider>
  );
};
