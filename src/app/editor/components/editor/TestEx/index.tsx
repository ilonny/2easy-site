"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TTestData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Card, Checkbox, Input, Textarea } from "@nextui-org/react";
import { useUploadTestEx } from "../hooks/useUploadTestEx";
import Close from "@/assets/icons/close.svg";
import { ImageListType } from "react-images-uploading";
import { uuidv4 } from "@/app/editor/helpers";
import { TestExView } from "../../view/TestExView";

const defaultValuesStub: TTestData = {
  title: "Let's test yourself!",
  titleColor: "#3F28C6",
  subtitle: "Choose the correct option for each question",
  description: "",
  images: [],
  questions: [
    {
      id: uuidv4(),
      images: [],
      value: "",
      options: [
        {
          id: uuidv4(),
          isCorrect: false,
          value: "",
        },
        {
          id: uuidv4(),
          isCorrect: false,
          value: "",
        },
      ],
    },
    {
      id: uuidv4(),
      images: [],
      value: "",
      options: [
        {
          id: uuidv4(),
          isCorrect: false,
          value: "",
        },
        {
          id: uuidv4(),
          isCorrect: false,
          value: "",
        },
      ],
    },
  ],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const TestEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveTestEx, success } = useUploadTestEx(lastSortIndex);
  const { data, changeData, resetData } = useExData<TTestData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TTestData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    !data?.id && resetData({
      title: "Let's test yourself!",
      titleColor: "#3F28C6",
      subtitle: "Choose the correct option for each question",
      description: "",
      images: [],
      questions: [
        {
          id: uuidv4(),
          images: [],
          value: "",
          options: [
            {
              id: uuidv4(),
              isCorrect: false,
              value: "",
            },
            {
              id: uuidv4(),
              isCorrect: false,
              value: "",
            },
          ],
        },
        {
          id: uuidv4(),
          images: [],
          value: "",
          options: [
            {
              id: uuidv4(),
              isCorrect: false,
              value: "",
            },
            {
              id: uuidv4(),
              isCorrect: false,
              value: "",
            },
          ],
        },
      ],
    });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      console.log("reset data fired");
      resetData(defaultValuesStub);
      onSuccess?.();
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
          isCorrect: false,
          value: "",
        },
        {
          id: uuidv4(),
          isCorrect: false,
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

  const setQuestionImages = useCallback(
    (qIndex: number, images: ImageListType) => {
      const copy = [...data.questions];
      copy[qIndex].images = images;
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  const onDeleteOption = useCallback(
    (qIndex: number, oIndex: number) => {
      const copy = [...data.questions];
      copy[qIndex].options = copy[qIndex].options.filter(
        (_o, oI) => oI !== oIndex
      );
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  const onCreateOption = useCallback(
    (qIndex: number) => {
      const copy = [...data.questions];
      copy[qIndex].options = copy[qIndex].options.concat({
        id: uuidv4(),
        isCorrect: false,
        value: "",
      });
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  const toggleOptionCorrect = useCallback(
    (qIndex: number, oIndex: number) => {
      const copy = [...data.questions];
      copy[qIndex].options[oIndex].isCorrect =
        !copy[qIndex].options[oIndex].isCorrect;
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );

  const onChangeOptionValue = useCallback(
    (value: string, qIndex: number, oIndex: number) => {
      const copy = [...data.questions];
      copy[qIndex].options[oIndex].value = value;
      changeData("questions", copy);
    },
    [changeData, data.questions]
  );
  console.log("data", data);
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
              <div className="flex justify-between items-center">
                <p className="font-light mb-2">Вопрос {qIndex + 1}</p>
              </div>

              <div
                className="mb-2 flex justify-between items-center bg-white p-4 w-[100%]"
                style={{ borderRadius: 14 }}
              >
                <Input
                  value={q.value}
                  classNames={{ inputWrapper: "bg-white" }}
                  onValueChange={(val) => onChangeQuestionValue(qIndex, val)}
                />
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
            </div>
            <div className="w-[100%] mt-8">
              <p className="font-light mb-2">Варианты ответов</p>
              {q.options.map((option, optionIndex) => {
                return (
                  <>
                    <Card
                      shadow="none"
                      className="p-4 bg-white flex flex-row items-center justify-between mb-2"
                    >
                      <div className="flex flex-row items-center justify-start w-[100%]">
                        <Checkbox
                          isSelected={option.isCorrect}
                          onValueChange={() =>
                            toggleOptionCorrect(qIndex, optionIndex)
                          }
                        />
                        <Textarea
                          style={{ width: "100%" }}
                          variant="flat"
                          value={option.value}
                          classNames={{ inputWrapper: "bg-white" }}
                          minRows={1}
                          onValueChange={(val) =>
                            onChangeOptionValue(val, qIndex, optionIndex)
                          }
                        />
                      </div>
                      {q.options.length > 1 && (
                        <div className="flex justify-end">
                          <Button
                            isIconOnly
                            variant="light"
                            className="hover:!bg-transparent"
                            onClick={() => onDeleteOption(qIndex, optionIndex)}
                          >
                            <Image src={Close} alt="close icon" />
                          </Button>
                        </div>
                      )}
                    </Card>
                  </>
                );
              })}
              {q.options.length < 8 && (
                <div className="flex justify-start w-[100%] mt-4">
                  <Button
                    variant="light"
                    onClick={() => onCreateOption(qIndex)}
                    color="primary"
                    // className="w-[300px]"
                    // className="px-0"
                  >
                    + Добавить вариант
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {data.questions.length < 20 && (
        <div className="flex justify-center w-[100%] mt-4">
          <Card className="mt-4">
            <Button
              variant="light"
              color="primary"
              size="lg"
              onClick={addQuestion}
              className="w-[300px]"
            >
              + Добавить вопрос
            </Button>
          </Card>
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
          <TestExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveTestEx(data)}
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
