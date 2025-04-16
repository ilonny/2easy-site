"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TMatchWordColumnData } from "./types";
import { FC, useCallback, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button, Card, Input } from "@nextui-org/react";
import { useUploadMatchWordColumnEx } from "../hooks/useUploadMatchWordColumnEx";
import Close from "@/assets/icons/close.svg";
import DeleteIcon from "@/assets/icons/delete_black.svg";
import { MatchWordColumnExView } from "../../view/MatchWordColumnExView";

const defaultValuesStub: TMatchWordColumnData = {
  title: "New vocab!",
  titleColor: "#3F28C6",
  subtitle: "Here's some more vocabulary on the topic",
  description: "Sort these words into positive and negative columns",
  images: [],
  sortIndex: undefined,
  columns: [
    {
      id: new Date().getTime(),
      title: "Название колонки",
      words: ["", "", "", "", ""],
    },
    {
      id: new Date().getTime() + 1,
      title: "Название колонки",
      words: ["", "", "", "", ""],
    },
  ],
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const MatchWordColumn: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveMathWordColumnEx, success } =
    useUploadMatchWordColumnEx(lastSortIndex);
  const { data, changeData } = useExData<TMatchWordColumnData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TMatchWordColumnData["images"]>(
    defaultValues?.images || []
  );

  useEffect(() => {
    changeData("images", images);
  }, [images, changeData]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

  const onChangeColumnTitle = useCallback(
    (title: string, index: number) => {
      const copy = [...data.columns];
      copy[index]["title"] = title;
      changeData("columns", copy);
    },
    [changeData, data.columns]
  );

  const onChangeWord = useCallback(
    (word: string, columnIndex: number, wordIndex: number) => {
      const copy = [...data.columns];
      copy[columnIndex]["words"][wordIndex] = word;
      changeData("columns", copy);
    },
    [changeData, data.columns]
  );

  const onDeleteWord = useCallback(
    (columnIndex: number, wordIndex: number) => {
      const copy = [...data.columns];
      copy[columnIndex].words = copy[columnIndex].words.filter(
        (_w, wIndex) => wIndex !== wordIndex
      );
      changeData("columns", copy);
    },
    [changeData, data.columns]
  );

  const onCreateWord = useCallback(
    (columnIndex: number) => {
      const copy = [...data.columns];
      copy[columnIndex].words.push("");
      changeData("columns", copy);
    },
    [changeData, data.columns]
  );

  const addColumn = useCallback(() => {
    const copy = [...data.columns];
    copy.push({
      id: new Date().getTime(),
      title: "Название колонки",
      words: [""],
    });
    changeData("columns", copy);
  }, [data.columns, changeData]);

  const deleteColumn = useCallback(
    (columnIndex: number) => {
      const copy = data.columns.filter((_c, cIndex) => cIndex !== columnIndex);
      changeData("columns", copy);
    },
    [changeData, data.columns]
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
          <p className="font-light mb-2">Фоновое изображение блока</p>
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
      <p>Заполните колонки словами</p>
      <div className="h-4" />
      <div className="flex flex-wrap items-start justify-between gap-4">
        {data.columns.map((column, columnIndex) => {
          return (
            <Card key={column.id} className="p-6 w-[49%]">
              <div className="flex items-center justify-between gap-4">
                <Input
                  value={column.title}
                  variant="flat"
                  onValueChange={(val) => onChangeColumnTitle(val, columnIndex)}
                />
                {data.columns.length > 2 && (
                  <Button
                    isIconOnly
                    variant="flat"
                    onClick={() => deleteColumn(columnIndex)}
                  >
                    <Image
                      src={DeleteIcon}
                      alt="delete icon"
                      style={{ fill: "#000" }}
                    />
                  </Button>
                )}
              </div>
              {column.words.map((word, wordIndex) => {
                return (
                  <Card key={wordIndex} className="p-4 w-[100%] mt-4">
                    <div className="flex justify-between items-center gap-2">
                      <Input
                        value={word}
                        size="sm"
                        onValueChange={(val) =>
                          onChangeWord(val, columnIndex, wordIndex)
                        }
                      />
                      {column.words.length > 1 && (
                        <Button
                          onClick={() => {
                            onDeleteWord(columnIndex, wordIndex);
                          }}
                          isIconOnly
                          variant="flat"
                          size="sm"
                        >
                          <Image src={Close} alt="delete option" />
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
              {column.words.length < 10 && (
                <Card className="mt-4">
                  <Button
                    variant="light"
                    color="primary"
                    size="lg"
                    onClick={() => onCreateWord(columnIndex)}
                  >
                    Добавить слово
                  </Button>
                </Card>
              )}
            </Card>
          );
        })}
        {data.columns?.length < 4 && (
          <div className="flex justify-center w-[100%] mt-4">
            <Button
              variant="light"
              onClick={() => addColumn()}
              color="primary"
              className="w-[300px]"
            >
              + Добавить еще
            </Button>
          </div>
        )}
      </div>
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
          <MatchWordColumnExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveMathWordColumnEx(data)}
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
