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
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";

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

  const localAnswer = useMemo(() => {
    return localAnswers.findLast((a) => a.id === field.id);
  }, [localAnswers, field.id]);
  useEffect(() => {
    if (localAnswer) {
      setSelectedValue(localAnswer?.word || "");
    }
  }, [localAnswer]);

  const isCorrect = useMemo(() => {
    if (isDisabled) {
      return false;
    }
    return !!field.options?.find((o) => o.value === selectedValue)?.isCorrect;
  }, [selectedValue, field?.options, isDisabled]);

  const onChangeSelection = useCallback(
    (val: string) => {
      setSelectedValue(val);
      setCount((c) => c + 1);
      // if (!isCorrect) {
      // }
      setLocalAnswers((a) =>
        a.concat({
          id: field.id,
          isCorrect,
          word: val,
        })
      );
      return;
    },
    [isCorrect]
  );

  // useEffect(() => {
  //   if (isCorrect) {
  //     setLocalAnswers((a) =>
  //       a.concat({
  //         id: field.id,
  //         isCorrect: true,
  //         word: field.options[0].value,
  //       })
  //     );
  //   }
  // }, [field.id, isCorrect]);

  useEffect(() => {
    if (field.options.length === 1) {
      return;
    }
    if (count >= field.options.length - 1 && !isCorrect) {
      setIsDisabled(true);
      setSelectedValue(field.options.find((o) => o.isCorrect)?.value || "");
    }
  }, [count, field?.options, isCorrect, selectedValue]);

  return (
    <>
      <Select
        // variant="bordered"
        // isInvalid={!isCorrect}
        className={`${styles["answer-wrapper"]} font-normal`}
        style={{
          backgroundColor:
            field.options.length === 1
              ? "#eeebff"
              : isCorrect
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
    sleepDelay: 1000,
  });

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
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
        // if (field?.options.length === 1) {
        //   return root.render(<span>{field?.options[0].value}</span>);
        // }
        root.render(
          <div
            className="answer-wrapper mx-2 select-answer-wrapper"
            id={"answer-wrapper-" + field?.id}
            style={{
              display: "inline-block",
              minWidth:
                maxOptionLength *
                (maxOptionLength <= 5
                  ? 25
                  : maxOptionLength <= 10
                  ? 20
                  : maxOptionLength >= 20
                  ? 10
                  : 15),
              // maxOptionLength *
              // (maxOptionLength < 10 ? 20 : maxOptionLength > 20 ? 7 : 10),
            }}
          >
            {/* {localAnswers.find((f) => f.id === field.id && f.isCorrect) ? (
              <>success</>
            ) : isTeacher &&
              localAnswers.findLast(
                (f) => f.id === field.id && !f.isCorrect
              ) ? (
              <>error</>
            ) : (
            )} */}
            <AnswerField
              field={field}
              key={field?.id}
              isTeacher={profile?.role_id === 2}
              localAnswers={localAnswers}
              setLocalAnswers={setLocalAnswers}
            />
          </div>
        );
      });
  }, [
    data.fields,
    data?.id,
    profile?.role_id,
    answers.length,
    localAnswers,
    // rest.activeStudentId,
  ]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  const content = useMemo(() => {
    return (
      <div
        className={
          "answerWrapperArea answerWrapperArea-" + (data?.id || 0).toString()
        }
        dangerouslySetInnerHTML={{ __html: data.dataText }}
      ></div>
    );
  }, [data.dataText, data?.id]);

  return (
    <>
      <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
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
            {content}
          </div>
        </Card>
      </div>
    </>
  );
};
