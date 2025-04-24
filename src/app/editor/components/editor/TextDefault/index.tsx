"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TTextDefaultData } from "./types";
import { FC, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { useUploadTextDefaultEx } from "../hooks/useUploadTextDefaultEx";
import { TextDefaultExView } from "../../view/TextDefaultExView";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import dynamic from "next/dynamic";
import draftToHtml from "draftjs-to-html";

let htmlToDraft = null;
if (typeof window === "object") {
  htmlToDraft = require("html-to-draftjs").default;
}

const Editor = dynamic(
  () =>
    import("react-draft-wysiwyg").then(({ Editor }) => {
      return Editor;
    }),
  {
    ssr: false,
  }
);

// const htmlToDraft = dynamic(() => import("html-to-draftjs"), { ssr: false });

const defaultValuesStub: TTextDefaultData = {
  title: "Let's read!",
  titleColor: "#3F28C6",
  subtitle: "Read the article",
  description: "Answer the questions below",
  images: [],
  editorImages: [],
  viewType: "carousel",
  content: "",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
};

export const TextDefaultEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
}) => {
  const { isLoading, saveTextDefaultEx, success } =
    useUploadTextDefaultEx(lastSortIndex);
  const { data, changeData } = useExData<TTextDefaultData>(
    defaultValues || defaultValuesStub
  );
  const [images, setImages] = useState<TTextDefaultData["images"]>(
    defaultValues?.images || []
  );

  const [editorImages, setEditorImages] = useState<TTextDefaultData["images"]>(
    defaultValues?.editorImages || []
  );

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    changeData("images", images);
    changeData("editorImages", editorImages);
  }, [images, changeData, editorImages]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
    }
  }, [onSuccess, success]);

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setIsLoaded(true);
      setEditorState(
        data.content
          ? EditorState.createWithContent(
              ContentState.createFromBlockArray(htmlToDraft(data?.content))
            )
          : EditorState.createEmpty()
      );
    }, 300);
  }, []);

  useEffect(() => {
    const htmlContent = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    changeData("content", htmlContent);
  }, [editorState, changeData]);

  if (!isLoaded) {
    return null;
  }
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
          <div className="h-4" />
        </div>
      </div>
      <div className="h-5" />
      <div style={{ background: "#fff" }}>
        <Editor
          editorState={editorState}
          stripPastedStyles={true}
          toolbar={{
            options: [
              "inline",
              "blockType",
              "fontSize",
              // "fontFamily",
              "list",
              "textAlign",
              "colorPicker",
              // "link",
              "remove",
            ],
            fontSize: {
              options: [
                8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96,
              ],
              className: undefined,
              component: undefined,
              dropdownClassName: undefined,
            },
          }}
          toolbarClassName="toolbarClassName"
          wrapperClassName="wrapperClassName"
          editorClassName="editorClassName"
          onEditorStateChange={setEditorState}
        />
      </div>
      <div className="h-8" />
      <div className="flex justify-center">
        <ImageUpload
          images={editorImages}
          setImages={setEditorImages}
          isButton
          onlyPlaceholder
        />
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
          <TextDefaultExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveTextDefaultEx(data)}
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
