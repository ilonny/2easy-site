/* eslint-disable @next/next/no-img-element */

import {
  FC,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Input } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import ReactDOM from "react-dom/client";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import {
  maxOptionTextLength,
  normalizeField,
} from "@/app/editor/helpers/fillGapsLegacy";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  activeStudentId?: number | string | null;
  answers: Record<string, any>;
  writeAnswer: (q_id: number | string, answer: string) => Promise<void>;
  initialAnswer?: string;
}> = ({
  field,
  isTeacher,
  isPresentationMode,
  activeStudentId,
  answers,
  writeAnswer,
  initialAnswer,
}) => {
  const [selectedValue, setSelectedValue] = useState(initialAnswer || "");
  const [isIncorrect] = useState(false);
  const hydratedRef = useRef(false);

  const isCorrect = useMemo(() => {
    return !!field?.options?.find((o) => {
      const mappedValue = o.value.toLowerCase()?.trim()?.replaceAll("’", "'");
      const mappedSelectedValue = selectedValue
        .toLowerCase()
        ?.trim()
        ?.replaceAll("’", "'");
      return mappedValue === mappedSelectedValue;
    })?.isCorrect;
  }, [selectedValue, field?.options]);

  const onChangeSelection = useCallback((val: string) => {
    setSelectedValue(val);
  }, []);

  // Student: hydrate once from parent-loaded answers
  useEffect(() => {
    if (isTeacher || hydratedRef.current) return;
    const fromServer = answers?.[field?.id]?.answer || initialAnswer;
    if (fromServer) {
      setSelectedValue(fromServer);
      hydratedRef.current = true;
    }
  }, [answers, field?.id, initialAnswer, isTeacher]);

  // Student: persist
  useEffect(() => {
    if (isTeacher) return;
    if (selectedValue) {
      writeAnswer(field.id, selectedValue);
    }
  }, [field.id, isTeacher, selectedValue, writeAnswer]);

  // Teacher: live sync only when viewing a student (don't wipe solo practice)
  useEffect(() => {
    if (!isTeacher || isPresentationMode) return;
    if (!activeStudentId) return;
    setSelectedValue(answers?.[field?.id]?.answer || "");
  }, [isTeacher, answers, field?.id, isPresentationMode, activeStudentId]);
  return (
    <>
      <Input
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
  const rootsMapRef = useRef(
    new Map<Element, ReturnType<typeof ReactDOM.createRoot>>()
  );

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers } = useExAnswer({
    ex_id,
    lesson_id,
    student_id,
    isTeacher,
    activeStudentId: (rest as any)?.activeStudentId,
    isPresentationMode: (rest as any)?.isPresentationMode,
  });

  // One initial fetch for the whole exercise (not per gap)
  useEffect(() => {
    if (isPreview) return;
    const targetId = student_id || (rest as any)?.activeStudentId;
    if (!targetId) return;
    getAnswers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview, (rest as any)?.activeStudentId]);

  const renderContent = useCallback(() => {
    document
      .querySelectorAll(
        `${".answerWrapperArea-" + (data?.id || 0).toString()} .answerWrapper`
      )
      .forEach((el) => {
        const id = el.id;
        const rawField = data.fields.find((f) => f.id == id);
        const field = normalizeField(rawField);
        if (!field) return;
        const maxOptionLength = maxOptionTextLength(field.options);
        const safeLen = Number.isFinite(maxOptionLength) ? maxOptionLength : 8;
        el.setAttribute("index", field?.id?.toString());
        let root = rootsMapRef.current.get(el);
        if (!root) {
          root = ReactDOM.createRoot(el);
          rootsMapRef.current.set(el, root);
        }
        const toolTipContent = field.options
          .filter((o) => o.isCorrect)
          .map((o) => o.value)
          .join(", ");
        root.render(
          <div
            className="answer-wrapper mx-2 !bg-transparent"
            id={"answer-wrapper-" + field?.id}
            style={{
              display: "inline-block",
              maxWidth: safeLen * (safeLen < 5 ? 30 : 15),
              lineHeight: "initial",
            }}
          >
            <ResponsiveTooltip
              isDisabled={!isTeacher || (rest as any)?.isPresentationMode}
              content={toolTipContent}
            >
              <div className="">
                <AnswerField
                  field={field}
                  key={field?.id}
                  isTeacher={isTeacher}
                  isPresentationMode={(rest as any)?.isPresentationMode}
                  activeStudentId={(rest as any)?.activeStudentId}
                  answers={answers}
                  writeAnswer={writeAnswer}
                  initialAnswer={answers?.[field?.id]?.answer}
                />
              </div>
            </ResponsiveTooltip>
          </div>
        );
      });
  }, [
    data?.id,
    data.fields,
    isTeacher,
    rest,
    answers,
    writeAnswer,
  ]);

  useEffect(() => {
    const t = setTimeout(() => {
      renderContent();
    }, 300);
    return () => clearTimeout(t);
  }, [renderContent]);

  useEffect(() => {
    return () => {
      rootsMapRef.current.forEach((root) => {
        try {
          root.unmount();
        } catch {}
      });
      rootsMapRef.current.clear();
    };
  }, []);

  const textHtml = useMemo(() => {
    return data.dataText;
  }, [data]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div
        className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}
      >
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">{data.subtitle}</p>
        {!!data.description && (
          <p className="exercise-view-desc">{data.description}</p>
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
      <div
        className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}
      >
        <Card className={`p-4 sm:p-6 md:p-8 lg:p-10 min-w-0`}>
          <div
            style={{ margin: "0 auto", lineHeight: "230%" }}
            className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10"
          >
            <div
              className={
                "fill-gaps-input-area answerWrapperArea answerWrapperArea-" +
                (data?.id || 0).toString()
              }
              dangerouslySetInnerHTML={{ __html: textHtml }}
            ></div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const FillGapsInputExView = memo(FillGapsInputExViewComp);
