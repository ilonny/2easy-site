/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
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
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

type TProps = {
  data: TFreeInputFormData;
  isPreview?: boolean;
};

export const FreeInputFormExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const lesson_id = useParams()?.id;
  const profile = useContext(AuthContext)?.profile;
  const student_id = profile?.studentId;
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const ex_id = data?.id;
  const { writeAnswer, answers, getAnswers, setAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode
  });

  const onValueChange = useDebouncedCallback(
    (q_id: number | string, answer: string) => {
      writeAnswer(q_id, answer);
    },
    500
  );

  useEffect(() => {
    if (student_id) {
      getAnswers(true);
    }
  }, [student_id]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
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
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[540px] mx-auto min-w-0`}>
        {data.questions.map((question) => {
          const value = answers[question.id]
            ? answers[question.id].answer
            : undefined;
          return (
            <div key={question.id} className="mb-6 min-w-0">
              <p className="text-base sm:text-lg mb-4 sm:mb-5 font-medium whitespace-pre-line break-words">
                {question.value}
              </p>
              <Card>
                <Textarea
                  placeholder="Введите текст"
                  classNames={{ inputWrapper: "bg-white p-4" }}
                  minRows={1}
                  style={{ fontSize: 16 }}
                  onValueChange={(val) => {
                    if (!student_id) {
                      return;
                    }
                    onValueChange(question.id, val);
                    setAnswers((a) => {
                      const q_id = question.id;
                      return {
                        ...a,
                        [q_id]: {
                          ...[a.q_id],
                          answer: val,
                        },
                      };
                    });
                  }}
                  value={value}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};
