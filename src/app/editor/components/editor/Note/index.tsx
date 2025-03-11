"use client";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TNoteData } from "./types";
import { FC, useCallback, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useUploadNoteEx } from "../hooks/useUploadNoteEx";
import { NoteExView } from "../../view/NoteExView";

const defaultValuesStub: TNoteData = {
  title: "For example: key",
  description:
    "When you go on a SetJetting vacation you visit famous film sets around the world. For example, Maya Beach where The Beach was filmed and Harry Potter sets in London. ",
  isVisible: false,
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const Note: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveNoteEx, success } = useUploadNoteEx(lastSortIndex);
  const { data, changeData } = useExData<TNoteData>(
    defaultValues || defaultValuesStub
  );

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-[100%] pr-2">
          <TitleExInput
            label="Заголовок задания"
            value={data.title}
            setValue={(val) => changeData("title", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label="Описание"
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
      </div>
      <div className="h-10" />
      <p className="font-light mb-2">Превью</p>
      <NoteExView data={data} isPreview />

      <div className="h-10" />
      <div className="flex justify-center">
        <Button
          color="primary"
          className="min-w-[310px]"
          size="lg"
          onClick={() => saveNoteEx(data)}
          isLoading={isLoading}
        >
          Сохранить
        </Button>
      </div>
      <div className="h-10" />
    </div>
  );
};
