/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Card,
  Checkbox,
  Radio,
  RadioGroup,
  Textarea,
} from "@nextui-org/react";
import Close from "@/assets/icons/cross_white.png";
import Image from "next/image";
import { TFreeInputFormData } from "../../editor/FreeInputFormEx/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TFreeInputFormData;
  isPreview?: boolean;
};

export const FreeInputFormExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  console.log("rest props", rest);
  const image = data?.images?.[0];

  return (
    <>
      <div className={`py-8 w-[886px] m-auto`}>
        <p
          style={{
            color: data.titleColor,
            fontSize: 38,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.title}
        </p>
        <p
          style={{
            fontSize: 24,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.subtitle}
        </p>
        {!!data.description && (
          <p
            style={{
              fontSize: 20,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[540px] m-auto`}>
        {data.questions.map((question) => {
          return (
            <div key={question.id} className="mb-6">
              <p style={{ fontSize: 18, marginBottom: 20, fontWeight: 500 }}>
                {question.value}
              </p>
              <Card>
                <Textarea
                  placeholder="Введите текст"
                  classNames={{ inputWrapper: "bg-white p-4" }}
                  minRows={1}
                  style={{ fontSize: 16 }}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
};
