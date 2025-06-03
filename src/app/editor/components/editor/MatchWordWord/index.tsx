"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TMatchWordWordData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Textarea } from "@nextui-org/react";
import { useUploadMatchWordWordEx } from "../hooks/useUploadMatchWordWordEx";
import Close from "@/assets/icons/close.svg";
import { MatchWordWordExView } from "../../view/MatchWordWordExView";
import { uuidv4 } from "@/app/editor/helpers";

const defaultValuesStub: TMatchWordWordData = {
  title: "New vocab!",
  titleColor: "#3F28C6",
  subtitle: "Look at the words below and try to guess their meanings",
  description: "Match the words with their definitions ",
  images: [],
  matches: [
    {
      id: uuidv4(),
      value: "",
      correctValue: "",
    },
    {
      id: uuidv4(),
      value: "",
      correctValue: "",
    },
    {
      id: uuidv4(),
      value: "",
      correctValue: "",
    },
  ],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const MatchWordWord: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveMathWordWordEx, success } =
    useUploadMatchWordWordEx(lastSortIndex);
  const { data, changeData, resetData } = useExData<TMatchWordWordData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TMatchWordWordData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "New vocab!",
        titleColor: "#3F28C6",
        subtitle: "Look at the words below and try to guess their meanings",
        description: "Match the words with their definitions ",
        images: [],
        matches: [
          {
            id: uuidv4(),
            value: "",
            correctValue: "",
          },
          {
            id: uuidv4(),
            value: "",
            correctValue: "",
          },
          {
            id: uuidv4(),
            value: "",
            correctValue: "",
          },
        ],
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      resetData(defaultValuesStub);
      onSuccess?.();
    }
  }, [onSuccess, success, resetData]);

  const onDeleteSticker = useCallback(
    (index: number) => {
      const matches = data.matches.filter((_s, i) => i !== index);
      changeData("matches", matches);
    },
    [changeData, data.matches]
  );

  const createSticker = useCallback(() => {
    const matches = data.matches.concat({
      id: new Date().getTime(),
      value: "",
      correctValue: "",
    });
    changeData("matches", matches);
  }, [changeData, data.matches]);

  const onChangeSticker = useCallback(
    (text: string, index: number, key: "value" | "correctValue") => {
      data.matches[index][key] = text;
      changeData("matches", [...data.matches]);
    },
    [data?.matches, changeData]
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
      <div className="flex flex-wrap items-start justify-between">
        {data.matches?.map((sticker, index) => {
          return (
            <div key={index} className="w-[100%] mb-4">
              <div className="">
                {index === 0 && (
                  <div className="flex justify-between items-center mb-2">
                    <p className="w-[50%]">Слово</p>
                    <p className="w-[50%]">Определение</p>
                  </div>
                )}
                <div className="flex justify-between items-center mb-2">
                  <div className=""></div>
                  {data.matches.length > 1 && (
                    <Button
                      isIconOnly
                      onClick={() => onDeleteSticker(index)}
                      variant="light"
                      className="hover:!bg-transparent"
                      size="sm"
                    >
                      <Image priority={false} src={Close} alt="close" />
                    </Button>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <div className="w-[50%] odd:pr-4">
                    <Textarea
                      value={sticker.value}
                      classNames={{ inputWrapper: "bg-white" }}
                      onChange={(e) =>
                        onChangeSticker(e.target.value, index, "value")
                      }
                    />
                  </div>
                  <div className="w-[50%] odd:pr-4">
                    <Textarea
                      classNames={{ inputWrapper: "bg-white" }}
                      value={sticker.correctValue}
                      onChange={(e) =>
                        onChangeSticker(e.target.value, index, "correctValue")
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {data.matches?.length < 10 && (
        <div className="flex justify-center">
          <Button
            variant="light"
            onClick={() => createSticker()}
            color="primary"
            className="w-[300px]"
          >
            + Добавить еще
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
          <MatchWordWordExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveMathWordWordEx(data)}
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
