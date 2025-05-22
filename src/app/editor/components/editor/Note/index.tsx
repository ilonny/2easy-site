"use client";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TNoteData } from "./types";
import { FC, useCallback, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useUploadNoteEx } from "../hooks/useUploadNoteEx";
import { NoteExView } from "../../view/NoteExView";

const defaultValuesStub: TNoteData = {
  title: "teacher's notes",
  description: "",
  isVisible: false,
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  onChangeIsVisible: () => void;
};

export const Note: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  onChangeIsVisible,
}) => {
  const { isLoading, saveNoteEx, success } = useUploadNoteEx(lastSortIndex);
  const { data, changeData, resetData } = useExData<TNoteData>(
    defaultValues || defaultValuesStub
  );

  useEffect(() => {
    resetData({
      title: "teacher's notes",
      description: "",
      isVisible: false,
    });
  }, [resetData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

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
      <NoteExView data={data} isPreview changeData={changeData} />

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
