/* eslint-disable @next/next/no-img-element */

import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
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

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
}> = ({
  field,
  isTeacher,
  localAnswers,
  setLocalAnswers,
  isPresentationMode,
}) => {
  const [selectedValue, setSelectedValue] = useState("");
  const [count, setCount] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const localAnswer = useMemo(() => {
    if (!field?.id) return undefined;
    return localAnswers.findLast((a) => a.id === field.id);
  }, [localAnswers, field?.id]);
  useEffect(() => {
    if (localAnswer) {
      setSelectedValue(localAnswer?.word || "");
    }
  }, [localAnswer]);

  const isCorrect = useMemo(() => {
    if (isDisabled || !field) {
      return false;
    }
    return !!field.options?.find((o) => o.value === selectedValue)?.isCorrect;
  }, [selectedValue, field?.options, isDisabled, field]);

  if (!field) return null;

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
    if (!field?.options?.length || field.options.length === 1) {
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
                  isTeacher &&
                  !isPresentationMode &&
                  o.isCorrect &&
                  "text-success"
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
      id: number | string;
      word: string;
      isCorrect: boolean;
    }[]
  >([]);

  const rootsMapRef = useRef(new Map<Element, ReturnType<typeof ReactDOM.createRoot>>());
  const wrapperId = useId().replace(/:/g, "") || "fill-gaps-preview";
  const areaClass = "answerWrapperArea-" + (data?.id ?? wrapperId);

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

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
    isPresentationMode: rest?.isPresentationMode
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
    const areaClassCurrent = "answerWrapperArea-" + (data?.id ?? wrapperId);
    const wrappers = document.querySelectorAll(`.${areaClassCurrent} .answerWrapper`);
    wrappers.forEach((el) => {
      const id = el.id;
      const field = data.fields?.find((f) => f.id == id);
      if (!field) return;
      const maxOptionLength = Math?.max(
        ...(field?.options?.map((o) => o.value.length) || [1])
      );
      el.setAttribute("index", field?.id?.toString());
      let root = rootsMapRef.current.get(el);
      if (!root) {
        root = ReactDOM.createRoot(el);
        rootsMapRef.current.set(el, root);
      }
        // if (field?.options.length === 1) {
        //   return root.render(<span>{field?.options[0].value}</span>);
        // }
        let minWidth =
          maxOptionLength *
          (maxOptionLength <= 5
            ? 75
            : maxOptionLength <= 10
            ? 20
            : maxOptionLength >= 20
            ? 10
            : 15);
        if (minWidth < 70) {
          minWidth = 85;
        }
        root.render(
          <div
            className="answer-wrapper mx-2 select-answer-wrapper"
            id={"answer-wrapper-" + field?.id}
            style={{
              display: "inline-block",
              minWidth,
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
              isTeacher={profile?.role_id === 2 || profile?.role_id === 1}
              localAnswers={localAnswers}
              setLocalAnswers={setLocalAnswers}
              isPresentationMode={rest?.isPresentationMode}
            />
          </div>
        );
    });
  }, [
    data.fields,
    data?.id,
    wrapperId,
    profile?.role_id,
    localAnswers,
    rest?.isPresentationMode,
  ]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      renderContent();
    });
    return () => cancelAnimationFrame(timer);
  }, [renderContent]);

  const content = useMemo(() => {
    return (
      <div
        className={`answerWrapperArea ${areaClass}`}
        dangerouslySetInnerHTML={{ __html: data.dataText || "" }}
      />
    );
  }, [data.dataText, areaClass]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[866px] mx-auto exercise-view-head`}>
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">
          {data.subtitle}
        </p>
        {!!data.description && (
          <p className="exercise-view-desc">
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <Card className={`p-4 sm:p-6 md:p-8 lg:p-10 min-w-0`}>
          <div
            style={{ margin: "0 auto", lineHeight: "230%" }}
            className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10"
          >
            {content}
          </div>
        </Card>
      </div>
    </div>
  );
};
