/* eslint-disable @next/next/no-img-element */

import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Input, Select, SelectItem } from "@nextui-org/react";
import ReactDOM from "react-dom/client";
import styles from "./styles.module.css";
type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const AnswerField: FC<{ field: TField }> = ({ field }) => {
  const inputRef = useRef();
  const [selectedValue, setSelectedValue] = useState("");
  const [count, setCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const isCorrect = useMemo(() => {
    if (isDisabled) {
      return false;
    }
    return !!field.options?.find((o) => o.value === selectedValue)?.isCorrect;
  }, [selectedValue, field.options, isDisabled]);

  const onChangeSelection = useCallback((val: string) => {
    setSelectedValue(val);
    return;
  }, []);

  useEffect(() => {
    if (count >= 3 && !isCorrect) {
      setIsDisabled(true);
      setSelectedValue(field.options.find((o) => o.isCorrect)?.value || "");
      return;
    }
  }, [count, field.options, isCorrect, selectedValue]);

  const onBlur = useCallback(() => {
    setCount((c) => c + 1);
    if (count < 3 && !isCorrect) {
      setSelectedValue("");
      setIsIncorrect(true);
      return;
    }
  }, [count, isCorrect]);

  return (
    <>
      <Input
        onBlur={onBlur}
        variant="underlined"
        className={`${styles["answer-wrapper"]} inputcustom ${
          isCorrect && "isCorrect"
        } ${(isDisabled || isIncorrect) && "isIncorrect"}`}
        size="sm"
        color={isCorrect ? "success" : selectedValue ? "danger" : "primary"}
        value={selectedValue}
        onValueChange={onChangeSelection}
        // onChange={(e) => onChangeSelection(e.target.value)}
        isDisabled={isDisabled}
      />
    </>
  );
};

export const FillGapsInputExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
  const image = data?.images?.[0];

  const renderContent = useCallback(() => {
    document
      .querySelectorAll(".answerWrapperArea .answerWrapper")
      .forEach((el, index) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id == id);
        el.setAttribute("index", field?.id?.toString());
        const root = ReactDOM.createRoot(el);
        root.render(
          <div
            className="answer-wrapper mx-2"
            id={"answer-wrapper-" + field?.id}
            style={{ display: "inline-block", minWidth: 70 }}
          >
            <AnswerField field={field} key={field?.id} />
          </div>
        );
      });
  }, [data]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  return (
    <>
      <div className="p-8 px-24">
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
      <div className={`p-8 ${isPreview ? "pt-4" : "p-18"} px-24 `}>
        <Card
          className={`p-10 px-10 `}
          style={
            image && {
              backgroundImage: `url(${image.dataURL})`,
              backgroundSize: "cover",
            }
          }
        >
          <div style={{ margin: "0 auto" }} className="flex flex-col gap-10">
            <div
              className="answerWrapperArea"
              dangerouslySetInnerHTML={{ __html: data.dataText }}
            ></div>
          </div>
        </Card>
      </div>
    </>
  );
};
