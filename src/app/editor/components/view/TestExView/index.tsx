/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TQuestion, TTestData } from "../../editor/TestEx/types";
import { Button, Card, Checkbox, Radio, RadioGroup } from "@nextui-org/react";
import Close from "@/assets/icons/cross_white.png";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { AuthContext } from "@/auth";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";

import RoundDefaultTest from "@/assets/icons/round_default_test.svg";
import RoundHoverTest from "@/assets/icons/round_hover_test.svg";
import RoundChosenTest from "@/assets/icons/round_chosen_test.svg";
import RoundSuccessTest from "@/assets/icons/round_success_test.svg";
import RoundGrayTest from "@/assets/icons/round_gray_test.svg";
import RoundErrorTest from "@/assets/icons/round_error_test.svg";

import SquareDefaultTest from "@/assets/icons/square_default_test.svg";
import SquareHoverTest from "@/assets/icons/square_hover_test.svg";
import SquareChosenTest from "@/assets/icons/square_chosen_test.svg";
import SquareSuccessTest from "@/assets/icons/square_success_test.svg";
import SquareGrayTest from "@/assets/icons/square_gray_test.svg";
import SquareErrorTest from "@/assets/icons/square_error_test.svg";

type TProps = {
  data: TTestData;
  isPreview?: boolean;
};

type TTestStepProps = {
  question: TQuestion;
  onPressNext: () => void;
  setScore: Dispatch<SetStateAction<number>>;
  writeAnswer: any;
  answers: any; //ref maps in json format
  isPresentationMode?: boolean;
  onAnswerSubmitted?: (questionId: string, wasCorrect: boolean) => void;
};

export const TestStep = (props: TTestStepProps) => {
  const {
    question,
    onPressNext,
    setScore,
    writeAnswer,
    answers,
    isPresentationMode,
    onAnswerSubmitted,
  } = props;
  const { profile } = useContext(AuthContext);

  const [rerender, setRerender] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isSingleAnswer =
    question?.options?.map((o) => o.isCorrect)?.filter(Boolean).length === 1;

  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedMap = useRef<Record<string, boolean>>({});
  const errorMap = useRef<Record<string, boolean>>({});

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  useEffect(() => {
    try {
      const answersParsed = JSON.parse(answers.answer);
      if (!answersParsed) {
        return;
      }
      errorMap.current = answersParsed.errorMap;
      selectedMap.current = answersParsed.selectedMap;
      setIsSubmitted(true);
      setRerender((s) => s + 1);
    } catch (err) {}
  }, [answers]);

  const onSubmitResult = useCallback(() => {
    question?.options?.forEach((option) => {
      if (option.isCorrect && !selectedMap.current[option.id]) {
        errorMap.current[option.id] = true;
      }
      if (!option.isCorrect && selectedMap.current[option.id]) {
        errorMap.current[option.id] = true;
      }
    });
    writeAnswer(
      question?.id,
      JSON.stringify({
        errorMap: errorMap.current,
        selectedMap: selectedMap.current,
      })
    );
    setIsSubmitted(true);
    const wasCorrect = !Object.keys(errorMap.current).length;
    if (wasCorrect) {
      setScore((s) => s + 1);
    }
    onAnswerSubmitted?.(question?.id, wasCorrect);
  }, [question?.id, question?.options, setScore, writeAnswer, onAnswerSubmitted]);

  useEffect(() => {
    Array.from(
      document.getElementsByClassName("checkbox-test-option-success")
    ).forEach((el) => {
      if (!el?.dataset?.selected) {
        el?.click();
      }
    });
  }, [rerender]);

  if (!question) {
    return <></>;
  }
  const defaultValue = !Object.keys(errorMap).length
    ? undefined
    : Object.keys(errorMap.current)[0];

  const isAnySelected = !!Object.values(selectedMap.current)?.length;

  return (
    <div
      onMouseEnter={() => {
        if (isPresentationMode || isSubmitted) {
          return;
        }
        const isAnyCorrect = question.options.some((o) => o.isCorrect);
        if (isAnyCorrect) {
          setIsHovered(true);
        }
      }}
      onMouseLeave={() => {
        if (isPresentationMode) {
          return;
        }
        setIsHovered(false);
      }}
    >
      <p className="text-lg sm:text-xl font-semibold mb-6 sm:mb-8 break-words">
        {question.value}
      </p>
      {isSingleAnswer && (
        <RadioGroup
          onValueChange={(val) => {
            selectedMap.current = {
              [val]: true,
            };
            setRerender((r) => r + 1);
          }}
          value={defaultValue}
        >
          {question.options.map((option) => {
            const isSelected = selectedMap.current[option.id];
            const isError = errorMap.current[option.id];

            const isCorrect = isSubmitted && isSelected && !isError;
            const isIncorrect = isSubmitted && isSelected && isError;

            const isMissed =
              isSubmitted &&
              option.isCorrect &&
              !selectedMap.current[option.id];

            const isCorrectAndNotSelected =
              isSubmitted && !isSelected && option.isCorrect;

            let color = isMissed
              ? "gray"
              : isCorrectAndNotSelected || isCorrect
              ? "success"
              : isIncorrect
              ? "danger"
              : isSelected
              ? "chosen"
              : "default";
            if (isTeacher && isHovered && !isSubmitted) {
              if (option.isCorrect) {
                color = "success-hovered";
              } else {
                color = "default";
              }
            }

            return (
              <label
                className="flex items-start gap-2 sm:items-center"
                key={option.id}
                style={{ marginBottom: 30, cursor: "pointer" }}
              >
                <div className="relative top-[-2px] shrink-0">
                  <Radio
                    color={color}
                    value={option.id}
                    // className={`radio-force-${color}`}
                  />
                  <div
                    className="absolute left-0 top-[5px] bg-white"
                    style={{ zIndex: 49 }}
                  >
                    {color === "default" && (
                      <Image src={RoundDefaultTest} alt="text" />
                    )}
                    {color === "success-hovered" && (
                      <Image src={RoundHoverTest} alt="text" />
                    )}
                    {color === "chosen" && (
                      <Image src={RoundChosenTest} alt="text" />
                    )}
                    {color === "success" && (
                      <Image src={RoundSuccessTest} alt="text" />
                    )}
                    {color === "gray" && (
                      <Image src={RoundGrayTest} alt="text" />
                    )}
                    {color === "danger" && (
                      <Image src={RoundErrorTest} alt="text" />
                    )}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-base sm:text-[18px] leading-6 break-words">
                    {option.value}
                  </p>
                </div>
              </label>
            );
          })}
        </RadioGroup>
      )}
      {!isSingleAnswer &&
        question.options.map((option, optionIndex) => {
          const isCorrect =
            isSubmitted &&
            !errorMap.current[option.id] &&
            selectedMap.current[option.id];
          const isIncorrect =
            isSubmitted &&
            errorMap.current[option.id] &&
            selectedMap.current[option.id];
          const isMissed =
            isSubmitted && option.isCorrect && !selectedMap.current[option.id];

          const isSelected = selectedMap.current[option.id];

          let color = isMissed
            ? "gray"
            : isCorrect
            ? "success"
            : isIncorrect
            ? "danger"
            : isSelected
            ? "chosen"
            : "default";

          if (isTeacher && isHovered && !isSubmitted) {
            if (option.isCorrect) {
              color = "success-hovered";
            } else {
              color = "default";
            }
          }

          return (
            <label
              className="flex items-start gap-2"
              key={option.id}
              style={{
                marginBottom: 30,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div className="mr-2 shrink-0">
                <div className="relative top-[-4px]">
                  <Checkbox
                    color={color}
                    isSelected={isMissed ? isMissed : undefined}
                    isDisabled={isSubmitted && !isCorrect}
                    size="sm"
                    className={`py-0 ${
                      isCorrect && "checkbox-test-option-success"
                    } ${isIncorrect && "checkbox-test-option-danger"}`}
                    onValueChange={(val) => {
                      selectedMap.current[option.id] = val;
                      setRerender((r) => r + 1);
                    }}
                  />
                  <div
                    className="absolute left-0 top-[6px] bg-white"
                    style={{ zIndex: 49 }}
                  >
                    {color === "default" && (
                      <Image src={SquareDefaultTest} alt="text" />
                    )}
                    {color === "success-hovered" && (
                      <Image src={SquareHoverTest} alt="text" />
                    )}
                    {color === "chosen" && (
                      <Image src={SquareChosenTest} alt="text" />
                    )}
                    {color === "success" && (
                      <Image src={SquareSuccessTest} alt="text" />
                    )}
                    {color === "gray" && (
                      <Image src={SquareGrayTest} alt="text" />
                    )}
                    {color === "danger" && (
                      <Image src={SquareErrorTest} alt="text" />
                    )}
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-base sm:text-[18px] leading-6 break-words ${
                    isIncorrect ? "mt-0.5" : ""
                  }`}
                >
                  {option.value}
                </p>
              </div>
            </label>
          );
        }, [])}
      {!isSubmitted ? (
        <Button
          fullWidth
          color="primary"
          size="lg"
          onClick={() => onSubmitResult()}
        >
          Check
        </Button>
      ) : (
        <Button
          fullWidth
          color="primary"
          size="lg"
          onClick={() => onPressNext()}
        >
          Next →
        </Button>
      )}
    </div>
  );
};

export const TestExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const [activeIndex, setActiveIndex] = useState(0);
  const [score, setScore] = useState(0);
  const sessionAnswersRef = useRef<Record<string, boolean>>({});
  const activeQuestion = data.questions?.[activeIndex];
  const currentStep = activeIndex + 1;
  const totalSteps = data?.questions?.length;
  const isLastStep = currentStep === totalSteps;
  const [isFinished, setIsFinished] = useState(false);

  const { profile } = useContext(AuthContext);
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
    isPresentationMode: rest?.isPresentationMode,
  });

  // useEffect(() => {
  //   if (student_id) {
  //     getAnswers(true);
  //   }
  // }, [student_id]);

  const onPressNext = useCallback(() => {
    setActiveIndex((i) => i + 1);
    // if (!isLastStep) {
    //   return;
    // }
    setIsFinished(isLastStep);
  }, [isLastStep]);

  const onPressRestart = useCallback(() => {
    setScore(0);
    setActiveIndex(0);
    setIsFinished(false);
    sessionAnswersRef.current = {};
  }, []);

  const onAnswerSubmitted = useCallback(
    (questionId: string, wasCorrect: boolean) => {
      sessionAnswersRef.current[questionId] = wasCorrect;
    },
    []
  );

  const onGoBack = useCallback(() => {
    const prevIndex = activeIndex - 1;
    if (prevIndex >= 0) {
      const prevQuestion = data.questions?.[prevIndex];
      if (prevQuestion) {
        const wasCorrect = sessionAnswersRef.current[prevQuestion.id];
        if (wasCorrect === true) {
          setScore((s) => Math.max(0, s - 1));
        }
        delete sessionAnswersRef.current[prevQuestion.id];
        writeAnswer(prevQuestion.id, "");
        setAnswers((prev: Record<string, unknown>) => {
          const next = { ...prev };
          delete next[prevQuestion.id];
          return next;
        });
      }
    }
    setActiveIndex((i) => (i - 1 < 0 ? 0 : i - 1));
  }, [activeIndex, data.questions, writeAnswer, setAnswers]);

  useEffect(() => {
    writeAnswer("step", activeIndex.toString());
    writeAnswer("score", score.toString());
  }, [activeIndex, writeAnswer, score]);

  useEffect(() => {
    if (!isTeacher) {
      return;
    }
    const newActiveIndex = Number(answers["step"]?.answer);
    const newScore = Number(answers["score"]?.answer);
    if (!isNaN(newActiveIndex)) {
      setActiveIndex(newActiveIndex);
      setScore(newScore);
    }
    if (currentStep > totalSteps && newActiveIndex !== 0) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  }, [answers, currentStep, isTeacher, totalSteps]);

  const questionStepAnswers = useMemo(() => {
    return answers?.[activeQuestion?.id];
  }, [answers, activeQuestion?.id]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full exercise-view-head`}>
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
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full`}>
        <Card
          className="w-full max-w-[540px] min-w-0 mx-auto p-4 sm:p-6 md:p-8"
        >
          {isFinished ? (
            <>
              <p className="text-center text-xl sm:text-2xl md:text-[28px] font-semibold">
                Your score
              </p>
              <p className="text-center text-4xl sm:text-5xl md:text-[54px] font-semibold my-6 sm:my-8">
                {score}/{totalSteps}
              </p>
              <Button
                fullWidth
                color="primary"
                size="lg"
                onClick={() => onPressRestart()}
              >
                Restart
              </Button>
            </>
          ) : (
            <TestStep
              key={activeIndex}
              question={activeQuestion}
              onPressNext={onPressNext}
              setScore={setScore}
              writeAnswer={writeAnswer}
              answers={questionStepAnswers}
              isPresentationMode={rest?.isPresentationMode}
              onAnswerSubmitted={onAnswerSubmitted}
            />
          )}
          {!isFinished && (
            <div className="flex justify-between items-center gap-2 min-w-0">
              <div className="w-20 sm:w-[100px] min-w-0 shrink-0">
                {activeIndex !== 0 && (
                  <p
                    className="text-left mt-8 sm:mt-10 text-sm text-[#B7B7B7] cursor-pointer hover:underline"
                    onClick={onGoBack}
                  >
                    Back
                  </p>
                )}
              </div>
              <div className="w-20 sm:w-[100px] min-w-0 flex justify-center shrink-0">
                <p className="text-center mt-8 sm:mt-10 text-sm text-[#B7B7B7]">
                  {currentStep}/{totalSteps}
                </p>
              </div>
              <div className="w-20 sm:w-[100px] shrink-0" aria-hidden />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
