"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TFreeInputFormData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Textarea } from "@nextui-org/react";
import { useUploadFreeInputFormEx } from "../hooks/useUploadFreeInputFormEx";
import Close from "@/assets/icons/close.svg";
import { uuidv4 } from "@/app/editor/helpers";
import { FreeInputFormExView } from "../../view/FreeInputFormExView";

const defaultValuesStub: TFreeInputFormData = {
  title: "Let's practice!",
  titleColor: "#3F28C6",
  subtitle: "Look at the questions below",
  description: "Write down your answers for each of them",
  images: [],
  questions: [
    {
      value: "",
      id: uuidv4(),
    },
  ],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const FreeInputFormEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveFreeInputFormEx, success } = useUploadFreeInputFormEx(
    lastSortIndex,
    currentSortIndexToShift
  );
  const { data, changeData, resetData } = useExData<TFreeInputFormData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TFreeInputFormData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Let's practice!",
        titleColor: "#3F28C6",
        subtitle: "Look at the questions below",
        description: "Write down your answers for each of them",
        images: [],
        questions: [
          {
            value: "",
            id: uuidv4(),
          },
        ],
      });
  }, []);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

  const onDeleteQuestion = useCallback(
    (qIndex: number) => {
      const copy = data.questions.filter((_q, qI) => qI !== qIndex);
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  const addQuestion = useCallback(() => {
    const copy = data.questions.concat({
      id: uuidv4(),
      images: [],
      value: "",
      options: [
        {
          id: uuidv4(),
          value: "",
        },
      ],
    });
    changeData("questions", copy);
  }, [changeData, data.questions]);

  const onChangeQuestionValue = useCallback(
    (qIndex: number, value: string) => {
      const copy = [...data.questions];
      copy[qIndex].value = value;
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  return (
    <div>
      <div className="flex flex-wrap">
        <div className="w-[50%] pr-2">
          <TitleExInput
            label="Заголовок задания"
            value={data.title}
            setValue={(val) => changeData("title", val)}
            onColorChange={(color: string) => changeData("titleColor", color)}
            selectedColor={data.titleColor}
          />
          <div className="h-4" />
          <TitleExInput
            label="Подзаголовок задания"
            value={data.subtitle}
            setValue={(val) => changeData("subtitle", val)}
          />
          <div className="h-4" />
          <TitleExInput
            isTextarea
            label="Описание"
            value={data.description}
            setValue={(val) => changeData("description", val)}
          />
        </div>
        <div className="w-[50%] pl-2">
          <p className="font-light mb-2">Изображение для задания</p>
          <ImageUpload
            images={images}
            setImages={setImages}
            customPlaceHolder={
              <div
                style={{
                  width: "100%",
                  background: "#fff",
                  height: 200,
                  borderRadius: 10,
                }}
                className="flex items-center justify-center flex-col gap-4"
              >
                <Image src={GalleryIcon} alt="GalleryIcon" />
                <p
                  className="text-small text-center max-w-[250px]"
                  style={{ color: "#B7B7B7" }}
                >
                  Нажмите на этот блок или перетащите сюда изображения
                </p>
              </div>
            }
          />
        </div>
      </div>
      <div className="h-5" />
      {data.questions.map((q, qIndex) => {
        return (
          <div className="question-wrapper items-start mb-4" key={q.id}>
            <div className="w-[100%]">
              <div className="flex justify-between items-center min-h-[40px]">
                <p className="font-light mb-2">Текст задания</p>
                {data.questions.length > 1 && (
                  <div className="flex justify-end">
                    <Button
                      isIconOnly
                      variant="light"
                      className="hover:!bg-transparent"
                      onClick={() => onDeleteQuestion(qIndex)}
                    >
                      <Image src={Close} alt="close icon" />
                    </Button>
                  </div>
                )}
              </div>

              <div className="mb-2 w-[100%]">
                <Textarea
                  value={q.value}
                  classNames={{ inputWrapper: "bg-white" }}
                  onValueChange={(val) => onChangeQuestionValue(qIndex, val)}
                />
              </div>
            </div>
          </div>
        );
      })}
      {data.questions.length < 20 && (
        <div className="flex justify-center w-[100%] mt-4">
          <Button
            variant="light"
            color="primary"
            size="lg"
            onClick={addQuestion}
            className="w-[300px]"
          >
            + Добавить задание
          </Button>
        </div>
      )}
      <div className="h-10" />
      <div>
        <p className="font-light mb-2">Превью</p>
        <div
          style={{
            border: "1px solid #3F28C6",
            borderRadius: 4,
            background: "#fff",
          }}
        >
          <FreeInputFormExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveFreeInputFormEx(data)}
            isLoading={isLoading}
          >
            Сохранить
          </Button>
        </div>
      </div>
      <div className="h-10" />
    </div>
  );
};
