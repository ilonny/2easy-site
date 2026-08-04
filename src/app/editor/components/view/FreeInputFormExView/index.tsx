/* eslint-disable @next/next/no-img-element */
import { FC, useCallback, useContext, useEffect } from "react";
import { Card, Textarea } from "@nextui-org/react";
import { TFreeInputFormData } from "../../editor/FreeInputFormEx/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { FreeInputAnswerEditor } from "./FreeInputAnswerEditor";

/** Per-student task prompt, separate from the answer HTML for the same question. */
export const freeInputPromptQId = (questionId: string | number) =>
  `${questionId}:prompt`;

type TProps = {
  data: TFreeInputFormData;
  isPreview?: boolean;
  activeStudentId?: number;
  isPresentationMode?: boolean;
};

export const FreeInputFormExView: FC<TProps> = ({
  data,
  isPreview = false,
  activeStudentId,
  isPresentationMode,
}) => {
  const image = data?.images?.[0];
  const lesson_id = useParams()?.id;
  const profile = useContext(AuthContext)?.profile;
  const student_id = profile?.studentId;
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers, setAnswers } = useExAnswer({
    student_id,
    lesson_id: Number(lesson_id),
    ex_id: Number(ex_id),
    activeStudentId,
    isTeacher,
    isPresentationMode,
    syncRemoteToStudent: true,
  });

  const isLocked = isPreview || !!isPresentationMode;
  const canPersist =
    !isLocked && (!!student_id || (isTeacher && !!activeStudentId));
  const canEditPrompt = isTeacher && !isLocked && !!activeStudentId;
  const showTeacherToolbar = canEditPrompt;

  const persistAnswer = useDebouncedCallback(
    (q_id: number | string, answer: string) => {
      if (!canPersist) return;
      writeAnswer(q_id, answer);
    },
    500
  );

  useEffect(() => {
    if (isPreview) return;
    if (student_id || activeStudentId) {
      getAnswers(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, activeStudentId, isPreview]);

  const handleChange = useCallback(
    (q_id: number | string, val: string) => {
      setAnswers((prev) => ({
        ...prev,
        [q_id]: {
          ...(prev[q_id] || {}),
          answer: val,
        },
      }));
      persistAnswer(q_id, val);
    },
    [persistAnswer, setAnswers]
  );

  const getPromptText = useCallback(
    (questionId: string | number, fallback: string) => {
      const saved = answers[freeInputPromptQId(questionId)]?.answer;
      if (saved !== undefined && saved !== null) return saved;
      return fallback || "";
    },
    [answers]
  );

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className="py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head">
        <p className="exercise-view-title" style={{ color: data.titleColor }}>
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

      <div className="py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[540px] mx-auto min-w-0">
        {data.questions.map((question) => {
          const promptText = getPromptText(question.id, question.value);
          return (
            <div key={question.id} className="mb-6 min-w-0">
              {canEditPrompt ? (
                <Textarea
                  value={promptText}
                  onValueChange={(val) =>
                    handleChange(freeInputPromptQId(question.id), val)
                  }
                  minRows={1}
                  className="mb-4 sm:mb-5"
                  classNames={{
                    inputWrapper: "bg-transparent shadow-none px-0",
                    input:
                      "text-base sm:text-lg font-medium whitespace-pre-line",
                  }}
                />
              ) : (
                !!promptText && (
                  <p className="text-base sm:text-lg mb-4 sm:mb-5 font-medium whitespace-pre-line break-words">
                    {promptText}
                  </p>
                )
              )}
              <Card className="overflow-visible">
                <FreeInputAnswerEditor
                  value={answers[question.id]?.answer || ""}
                  onChange={(html) => handleChange(question.id, html)}
                  showToolbar={showTeacherToolbar}
                  readOnly={isLocked}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
