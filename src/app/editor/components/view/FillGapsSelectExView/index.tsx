/* eslint-disable @next/next/no-img-element */

import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Checkbox, Select, SelectItem } from "@nextui-org/react";
import ReactDOM from "react-dom/client";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const AnswerField: FC<{ field: TField; isTeacher: boolean }> = ({
  field,
  isTeacher,
}) => {
  const [selectedValue, setSelectedValue] = useState("");
  const [count, setCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const isCorrect = useMemo(() => {
    if (isDisabled) {
      return false;
    }
    return !!field.options?.find((o) => o.value === selectedValue)?.isCorrect;
  }, [selectedValue, field?.options, isDisabled]);

  const onChangeSelection = useCallback((val: string) => {
    setSelectedValue(val);
    setCount((c) => c + 1);
    return;
  }, []);

  useEffect(() => {
    if (count >= field.options.length - 1 && !isCorrect) {
      setIsDisabled(true);
      setSelectedValue(field.options.find((o) => o.isCorrect)?.value || "");
    }
  }, [count, field.options, isCorrect, selectedValue]);

  return (
    <>
      <Select
        // variant="bordered"
        // isInvalid={!isCorrect}
        className={`${styles["answer-wrapper"]} font-normal`}
        style={{
          backgroundColor: isCorrect
            ? "#EBFFEE"
            : selectedValue
            ? "#FFE5E5"
            : "#eeebff",
          borderRadius: "8px",
        }}
        size="sm"
        // color={isCorrect ? "success" : selectedValue ? "danger" : "primary"}
        onChange={(e) => onChangeSelection(e.target.value)}
        defaultSelectedKeys={[selectedValue]}
        selectedKeys={[selectedValue]}
        isDisabled={isDisabled}
      >
        {(field?.options || [])?.map((o) => {
          return (
            <SelectItem color="default" key={o.value} textValue={o.value}>
              <div
                className={`flex gap-1 items-center ${
                  isTeacher && o.isCorrect && "text-success"
                }`}
              >
                {/* {isTeacher && o.isCorrect && (
                  <div>
                    <Checkbox isSelected isDisabled />
                  </div>
                )} */}
                {o.value}
              </div>
            </SelectItem>
          );
        })}
      </Select>
    </>
  );
};

export const FillGapsSelectExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);

  const renderContent = useCallback(() => {
    document
      .querySelectorAll(
        `${".answerWrapperArea-" + (data?.id || 0).toString()} .answerWrapper`
      )
      .forEach((el, index) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id == id);
        const maxOptionLength = Math?.max(
          ...(field?.options?.map((o) => o.value.length) || [])
        );
        el.setAttribute("index", field?.id?.toString());
        const root = ReactDOM.createRoot(el);
        root.render(
          <div
            className="answer-wrapper mx-2 select-answer-wrapper"
            id={"answer-wrapper-" + field?.id}
            style={{
              display: "inline-block",
              minWidth: maxOptionLength * (maxOptionLength <= 5 ? 20 : 15),
              // maxOptionLength *
              // (maxOptionLength < 10 ? 20 : maxOptionLength > 20 ? 7 : 10),
            }}
          >
            <AnswerField
              field={field}
              key={field?.id}
              isTeacher={profile?.role_id === 2}
            />
          </div>
        );
      });
  }, [data.fields, data?.id, profile?.role_id]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

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
      <div className={`py-8 w-[886px] m-auto`}>
        <Card className={`p-10 px-10 `}>
          <div
            style={{ margin: "0 auto", lineHeight: "230%" }}
            className="flex flex-col gap-10"
          >
            <div
              className={
                "answerWrapperArea answerWrapperArea-" +
                (data?.id || 0).toString()
              }
              dangerouslySetInnerHTML={{ __html: data.dataText }}
            ></div>
          </div>
        </Card>
      </div>
    </>
  );
};
