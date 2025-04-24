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

type TProps = {
  data: TFreeInputFormData;
  isPreview?: boolean;
};

export const FreeInputFormExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
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
      <div
        className={`py-8 w-[886px] m-auto`}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
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
                  minRows={5}
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
