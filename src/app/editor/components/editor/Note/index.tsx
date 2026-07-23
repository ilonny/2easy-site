"use client";
import { useExData } from "../hooks/useExData";
import { CreateExWithAiButton } from "../CreateExWithAiButton";
import { TitleExInput } from "../TitleExInput";
import { TNoteData } from "./types";
import { FC, useCallback, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { useUploadNoteEx } from "../hooks/useUploadNoteEx";
import { NoteExView } from "../../view/NoteExView";
import { T } from "@/i18n/T";

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
  currentSortIndexToShift?: number;
};

export const Note: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  onChangeIsVisible,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveNoteEx, success } = useUploadNoteEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TNoteData>(
    defaultValues || defaultValuesStub
  );

  useEffect(() => {
    !data?.id &&
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
      <div className="flex flex-col md:flex-row flex-wrap gap-4 md:gap-0">
        <div className="w-full min-w-0">
          <TitleExInput
            label={<T k="editor.taskTitle" defaultText="Заголовок задания" />}
            value={data.title}
            setValue={(val) => changeData("title", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label={<T k="editor.description" defaultText="Описание" />}
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
      </div>
      <div className="h-10" />
      <p className="font-light mb-2">
        <T k="editor.preview" defaultText="Превью" />
      </p>
      <NoteExView data={data} isPreview changeData={changeData} />

      <div className="h-10" />
      <div className="flex justify-center">
        <Button
          color="primary"
          className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
          size="lg"
          onClick={() => saveNoteEx(data)}
          isLoading={isLoading}
        >
          <T k="common.save" defaultText="Сохранить" />
        </Button>
      </div>
        <CreateExWithAiButton
          type="note"
          onApply={(generated) => {
            resetData({
              ...generated,
              id: (data as any)?.id,
              sortIndex: (data as any)?.sortIndex,
            } as any);
          }}
        />
      <div className="h-10" />
    </div>
  );
};
