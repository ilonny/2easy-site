"use client";
import { ImageUpload } from "@/components/ImageUpload";
import { useExData } from "../hooks/useExData";
import { TitleExInput } from "../TitleExInput";
import { TText2ColData } from "./types";
import { FC, useEffect, useState } from "react";
import GalleryIcon from "@/assets/icons/gallery.svg";
import Image from "next/image";
import { Button } from "@nextui-org/react";
import { Text2ColExView } from "../../view/Text2ColExView";
import { EditorState, convertToRaw, ContentState } from "draft-js";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import dynamic from "next/dynamic";
import draftToHtml from "draftjs-to-html";
import { useUploadText2ColEx } from "../hooks/useUploadText2ColEx";

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

const defaultValuesStub: TText2ColData = {
  title: "Let’s read!",
  titleColor: "#3F28C6",
  subtitle: "Read the part of the article",
  description: "Answer the questions below",
  images: [],
  editorImages: [],
  content: "",
  secondEditorImages: [],
  secondContent: "",
};

type TProps = {
  onSuccess: () => void;
  defaultValues?: any;
  lastSortIndex: number;
  currentSortIndexToShift?: number;
};

export const Text2ColEx: FC<TProps> = ({
  onSuccess,
  defaultValues,
  lastSortIndex,
  currentSortIndexToShift,
}) => {
  const { isLoading, saveText2ColEx, success } = useUploadText2ColEx(
    lastSortIndex,
    currentSortIndexToShift
  );

  const { data, changeData, resetData } = useExData<TText2ColData>(
    defaultValues || defaultValuesStub
  );

  const [images, setImages] = useState<TText2ColData["images"]>(
    defaultValues?.images || []
  );

  const [editorImages, setEditorImages] = useState<TText2ColData["images"]>(
    defaultValues?.editorImages || []
  );

  const [secondEditorImages, setSecondEditorImages] = useState<
    TText2ColData["secondEditorImages"]
  >(defaultValues?.secondEditorImages || []);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  const [secondEditorState, setSecondEditorState] = useState(
    EditorState.createEmpty()
  );

  useEffect(() => {
    !data?.id &&
      resetData({
        title: "Let’s read!",
        titleColor: "#3F28C6",
        subtitle: "Read the part of the article",
        description: "Answer the questions below",
        images: [],
        editorImages: [],
        content: "",
        secondEditorImages: [],
        secondContent: "",
      });
  }, [resetData]);

  useEffect(() => {
    changeData("images", images);
    changeData("editorImages", editorImages);
  }, [images, changeData, editorImages]);

  useEffect(() => {
    changeData("secondEditorImages", secondEditorImages);
  }, [changeData, secondEditorImages]);

  useEffect(() => {
    if (success) {
      onSuccess?.();
      resetData(defaultValuesStub);
    }
  }, [onSuccess, success, resetData]);

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
      setSecondEditorState(
        data.content
          ? EditorState.createWithContent(
              ContentState.createFromBlockArray(
                htmlToDraft(data?.secondContent)
              )
            )
          : EditorState.createEmpty()
      );
    }, 200);
  }, []);

  useEffect(() => {
    const htmlContent = draftToHtml(
      convertToRaw(editorState.getCurrentContent())
    );
    changeData("content", htmlContent);
  }, [editorState, changeData]);

  useEffect(() => {
    const htmlContent = draftToHtml(
      convertToRaw(secondEditorState.getCurrentContent())
    );
    changeData("secondContent", htmlContent);
  }, [secondEditorState, changeData]);

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
          <div className="h-4" />
        </div>
      </div>
      <div className="h-5" />
      <div className="flex items-start justify-between gap-4">
        <div style={{ width: "50%" }}>
          <div
            style={{
              background: "#fff",
              // border: "1px solid #3f28c6",
              // padding: 10,
            }}
          >
            <Editor
              editorState={editorState}
              stripPastedStyles={true}
              toolbar={{
                options: [
                  "inline",
                  "blockType",
                  "fontSize",
                  "list",
                  "textAlign",
                  "colorPicker",
                  "link",
                ],
                fontSize: {
                  options: [
                    8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96,
                  ],
                  className: undefined,
                  component: undefined,
                  dropdownClassName: undefined,
                },
                colorPicker: {
                  // icon: color,
                  className: undefined,
                  component: undefined,
                  popupClassName: undefined,
                  colors: [
                    "#EEEBFF",
                    "#CCBCFF",
                    "#191919",
                    "#3F28C6",
                    "#FFE5F7",
                    "#FF7ECC",
                    "#FFD2C8",
                    "#8EE8FF",
                    "#E4FF38",
                    "#FFFFBA",
                    "#F2F226",
                    "rgb(97,189,109)",
                    "rgb(26,188,156)",
                    "rgb(84,172,210)",
                    "rgb(44,130,201)",
                    "rgb(147,101,184)",
                    "rgb(71,85,119)",
                    "rgb(204,204,204)",
                    "rgb(65,168,95)",
                    "rgb(0,168,133)",
                    "rgb(61,142,185)",
                    "rgb(41,105,176)",
                    "rgb(85,57,130)",
                    "rgb(40,50,78)",
                    "rgb(0,0,0)",
                    "rgb(247,218,100)",
                    "rgb(251,160,38)",
                    "rgb(235,107,86)",
                    "rgb(226,80,65)",
                    "rgb(163,143,132)",
                    "rgb(239,239,239)",
                    "rgb(255,255,255)",
                    "rgb(250,197,28)",
                    "rgb(243,121,52)",
                    "rgb(209,72,65)",
                    "rgb(184,49,47)",
                    "rgb(124,112,107)",
                    "rgb(209,213,216)",
                  ],
                },
              }}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              onEditorStateChange={setEditorState}
            />
          </div>
          <div className="h-4" />
          <div className="flex justify-center">
            <ImageUpload
              images={editorImages}
              setImages={setEditorImages}
              isButton
              onlyPlaceholder
              whiteBg
              fullWidth
            />
          </div>
        </div>
        <div style={{ width: "50%" }}>
          <div
            style={{
              background: "#fff",
              // border: "1px solid #3f28c6",
              // padding: 10,
            }}
          >
            <Editor
              stripPastedStyles={true}
              editorState={secondEditorState}
              toolbar={{
                options: [
                  "inline",
                  "blockType",
                  "fontSize",
                  // "fontFamily",
                  "list",
                  "textAlign",
                  "colorPicker",
                  "link",
                ],
                fontSize: {
                  options: [
                    8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96,
                  ],
                  className: undefined,
                  component: undefined,
                  dropdownClassName: undefined,
                },
                colorPicker: {
                  // icon: color,
                  className: undefined,
                  component: undefined,
                  popupClassName: undefined,
                  colors: [
                    "#EEEBFF",
                    "#CCBCFF",
                    "#191919",
                    "#3F28C6",
                    "#FFE5F7",
                    "#FF7ECC",
                    "#FFD2C8",
                    "#8EE8FF",
                    "#E4FF38",
                    "#FFFFBA",
                    "#F2F226",
                    "rgb(97,189,109)",
                    "rgb(26,188,156)",
                    "rgb(84,172,210)",
                    "rgb(44,130,201)",
                    "rgb(147,101,184)",
                    "rgb(71,85,119)",
                    "rgb(204,204,204)",
                    "rgb(65,168,95)",
                    "rgb(0,168,133)",
                    "rgb(61,142,185)",
                    "rgb(41,105,176)",
                    "rgb(85,57,130)",
                    "rgb(40,50,78)",
                    "rgb(0,0,0)",
                    "rgb(247,218,100)",
                    "rgb(251,160,38)",
                    "rgb(235,107,86)",
                    "rgb(226,80,65)",
                    "rgb(163,143,132)",
                    "rgb(239,239,239)",
                    "rgb(255,255,255)",
                    "rgb(250,197,28)",
                    "rgb(243,121,52)",
                    "rgb(209,72,65)",
                    "rgb(184,49,47)",
                    "rgb(124,112,107)",
                    "rgb(209,213,216)",
                  ],
                },
              }}
              toolbarClassName="toolbarClassName"
              wrapperClassName="wrapperClassName"
              editorClassName="editorClassName"
              onEditorStateChange={setSecondEditorState}
            />
          </div>
          <div className="h-4" />
          <div className="flex justify-center">
            <ImageUpload
              fullWidth
              whiteBg
              images={secondEditorImages}
              setImages={setSecondEditorImages}
              isButton
              onlyPlaceholder
            />
          </div>
        </div>
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
          <Text2ColExView data={data} isPreview />
        </div>
        <div className="h-5" />
        <div className="flex justify-center">
          <Button
            color="primary"
            className="min-w-[310px]"
            size="lg"
            onClick={() => saveText2ColEx(data)}
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
