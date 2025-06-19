/* eslint-disable @next/next/no-img-element */

import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Input, Select, SelectItem } from "@nextui-org/react";
import ReactDOM from "react-dom/client";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const AnswerField: FC<{ field: TField; isTeacher: boolean }> = ({
  field,
  isTeacher,
  localAnswers,
  setLocalAnswers,
}) => {
  const [selectedValue, setSelectedValue] = useState("");

  const [count, setCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);
  const [isIncorrect, setIsIncorrect] = useState(false);
  const isCorrect = useMemo(() => {
    if (isDisabled) {
      return false;
    }
    return !!field?.options?.find((o) => o.value === selectedValue)?.isCorrect;
  }, [selectedValue, field?.options, isDisabled]);

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

  const onBlur = useCallback(
    (e) => {
      e.stopPropagation();
      setCount((c) => c + 1);
      if (count < 3 && !isCorrect) {
        setLocalAnswers((a) =>
          a.concat({
            id: field.id,
            isCorrect: false,
            word: selectedValue,
          })
        );
        setSelectedValue("");
        setIsIncorrect(true);
        return;
      }
    },
    [count, isCorrect, selectedValue]
  );

  useEffect(() => {
    if (isCorrect) {
      setLocalAnswers((a) =>
        a.concat({
          id: field.id,
          isCorrect: true,
          word: field.options[0].value,
        })
      );
    }
  }, [field.id, isCorrect]);

  // useEffect(() => {
  //   if (localAnswers.includes(field.id)) {
  //     setSelectedValue(field.options[0].value);
  //   }
  // }, [localAnswers?.length]);

  return (
    <>
      <Input
        placeholder={isTeacher ? field.options[0]?.value : ""}
        onBlur={onBlur}
        variant="flat"
        className={`${styles["answer-wrapper"]} inputcustom ${
          isCorrect && "isCorrect"
        } ${(isDisabled || isIncorrect) && "isIncorrect"}`}
        size="sm"
        classNames={{
          inputWrapper: isCorrect ? "bg-[#EBFFEE]" : "bg-[#eeebfe]",
        }}
        color={isCorrect ? "success" : selectedValue ? "danger" : "primary"}
        value={selectedValue}
        onValueChange={onChangeSelection}
        // onChange={(e) => onChangeSelection(e.target.value)}
        isDisabled={isDisabled}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            onBlur(event);
          }
        }}
      />
    </>
  );
};

export const FillGapsInputExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);

  const [localAnswers, setLocalAnswers] = useState<
    {
      id: number;
      word: string;
      isCorrect: boolean;
    }[]
  >([]);

  const isTeacher = profile?.role_id === 2;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;
  const { writeAnswer, answers, getAnswers, setAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    sleepDelay: 3000,
  });

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        console.log("a", a);
        try {
          setLocalAnswers(JSON.parse(a[data.id].answer));
        } catch (err) {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  useEffect(() => {
    if (!answers && !isTeacher) {
      return;
    }
    try {
      setLocalAnswers(JSON.parse(answers[data.id].answer));
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher]);

  useEffect(() => {
    if (localAnswers.length) {
      writeAnswer(data.id, JSON.stringify(localAnswers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAnswers, writeAnswer]);

  const renderContent = useCallback(() => {
    console.log("render");
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
            className="answer-wrapper mx-2 !bg-transparent"
            id={"answer-wrapper-" + field?.id}
            style={{
              display: "inline-block",
              maxWidth: maxOptionLength * (maxOptionLength < 5 ? 30 : 15),
              lineHeight: "initial",
            }}
          >
            {localAnswers.find((f) => f.id === field.id && f.isCorrect) ? (
              <Input
                variant="flat"
                className={`${styles["answer-wrapper"]} inputcustom isCorrect`}
                size="sm"
                classNames={{
                  inputWrapper: "bg-[#EBFFEE]",
                }}
                color={"success"}
                value={field?.options[0]?.value}
              />
            ) : isTeacher &&
              localAnswers.findLast(
                (f) => f.id === field.id && !f.isCorrect
              ) ? (
              <Input
                variant="flat"
                className={`${styles["answer-wrapper"]} inputcustom isIncorrect`}
                size="sm"
                isDisabled={isTeacher}
                classNames={{
                  inputWrapper: "bg-[#eeebfe]",
                }}
                color={"danger"}
                value={
                  localAnswers.findLast(
                    (f) => f.id === field.id && !f.isCorrect
                  )?.word
                }
              />
            ) : (
              <AnswerField
                field={field}
                key={field?.id}
                isTeacher={profile?.role_id === 2}
                localAnswers={localAnswers}
                setLocalAnswers={setLocalAnswers}
                // localAnswers={localAnswers}
                // setLocalAnswers={setLocalAnswers}
              />
            )}
          </div>
        );
      });
  }, [
    data.fields,
    data?.id,
    profile?.role_id,
    answers,
    localAnswers,
    rest.activeStudentId,
  ]);

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
                "fill-gaps-input-area answerWrapperArea answerWrapperArea-" +
                (data?.id || 0).toString()
              }
              onBlur={() =>
                setTimeout(() => {
                  renderContent();
                }, 300)
              }
              dangerouslySetInnerHTML={{ __html: data.dataText }}
            ></div>
          </div>
        </Card>
      </div>
    </>
  );
};
