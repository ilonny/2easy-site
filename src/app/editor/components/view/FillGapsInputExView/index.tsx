/* eslint-disable @next/next/no-img-element */

import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Input, Select, SelectItem, Tooltip } from "@nextui-org/react";
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

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  ex_id?: number;
  lesson_id?: number;
  student_id?: number;
  activeStudentId?: number;
}> = ({
  field,
  isTeacher,
  isPresentationMode,
  ex_id,
  lesson_id,
  student_id,
  activeStudentId,
}) => {
  const { getAnswers, writeAnswer, answers } = useExAnswer({
    ex_id,
    lesson_id,
    student_id,
    isTeacher,
    activeStudentId,
    isPresentationMode,
    sleepDelay: 2000,
  });

  const [selectedValue, setSelectedValue] = useState("");
  const [isIncorrect, setIsIncorrect] = useState(false);

  const isCorrect = useMemo(() => {
    return !!field?.options?.find(
      (o) => o.value.toLowerCase() === selectedValue.toLowerCase()
    )?.isCorrect;
  }, [selectedValue, field?.options]);

  const onChangeSelection = useCallback((val: string) => {
    setSelectedValue(val);
    return;
  }, []);

  //первоначальное получение старых ответов ученику
  useEffect(() => {
    if (!isTeacher) {
      getAnswers(true).then((a) => {
        if (a?.[field?.id]?.answer) {
          setSelectedValue(a?.[field?.id]?.answer);
        }
      });
    }
  }, [field?.id, getAnswers, isTeacher]);

  //запись ответа учеником
  useEffect(() => {
    if (isTeacher) {
      return;
    }
    if (selectedValue) {
      writeAnswer(field.id, selectedValue);
    }
  }, [field.id, isTeacher, selectedValue, writeAnswer]);

  //чтение ответов учителем
  useEffect(() => {
    if (!isTeacher || isPresentationMode) {
      return;
    }
    if (answers?.[field?.id]?.answer) {
      setSelectedValue(answers?.[field?.id]?.answer);
    }
  }, [isTeacher, answers, field?.id, isPresentationMode]);

  return (
    <>
      <Input
        // placeholder={
        //   isTeacher && !isPresentationMode ? field.options[0]?.value : ""
        // }
        variant="flat"
        className={`${styles["answer-wrapper"]} inputcustom ${
          isCorrect && "isCorrect"
        } ${isIncorrect && "isIncorrect"}`}
        size="sm"
        classNames={{
          inputWrapper: isCorrect ? "bg-[#EBFFEE]" : "bg-[#eeebfe]",
        }}
        color={isCorrect ? "success" : selectedValue ? "danger" : "primary"}
        value={selectedValue}
        onValueChange={onChangeSelection}
      />
    </>
  );
};

export const FillGapsInputExViewComp: FC<TProps> = ({
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

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

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
        const toolTipContent = field?.options
          .filter((o) => o.isCorrect)
          .map((o) => o.value)
          .join(", ");
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
            <Tooltip
              isDisabled={!isTeacher || rest?.isPresentationMode}
              content={toolTipContent}
            >
              <div className="">
                <AnswerField
                  field={field}
                  key={field?.id}
                  isTeacher={profile?.role_id === 2 || profile?.role_id === 1}
                  localAnswers={localAnswers}
                  setLocalAnswers={setLocalAnswers}
                  isPresentationMode={rest?.isPresentationMode}
                  ex_id={ex_id}
                  lesson_id={lesson_id}
                  student_id={student_id}
                  activeStudentId={rest?.activeStudentId}
                  // localAnswers={localAnswers}
                  // setLocalAnswers={setLocalAnswers}
                />
              </div>
            </Tooltip>
          </div>
        );
      });
  }, [
    data?.id,
    data.fields,
    isTeacher,
    rest?.isPresentationMode,
    rest?.activeStudentId,
    profile?.role_id,
    localAnswers,
    ex_id,
    lesson_id,
    student_id,
  ]);

  useEffect(() => {
    setTimeout(() => {
      renderContent();
    }, 300);
  }, [renderContent]);

  const textHtml = useMemo(() => {
    return data.dataText;
  }, [data]);

  return (
    <>
      <div className={`py-8 w-[100%] max-w-[766px] m-auto`}>
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
      <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
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
              // onBlur={() =>
              //   setTimeout(() => {
              //     renderContent();
              //   }, 300)
              // }
              dangerouslySetInnerHTML={{ __html: textHtml }}
            ></div>
          </div>
        </Card>
      </div>
    </>
  );
};

export const FillGapsInputExView = memo(FillGapsInputExViewComp);
