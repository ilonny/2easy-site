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
import CheckedIcon from "@/assets/icons/checked.svg";

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
};

export const TestStep = (props: TTestStepProps) => {
  const { question, onPressNext, setScore, writeAnswer, answers } = props;
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
    if (!Object.keys(errorMap.current).length) {
      setScore((s) => s + 1);
    }
  }, [question?.id, question?.options, setScore, writeAnswer]);

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

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
      }}
    >
      <p style={{ fontSize: 20, fontWeight: 600, marginBottom: 30 }}>
        {question.value}
      </p>
      {isSingleAnswer && (
        <RadioGroup
          onValueChange={(val) => {
            selectedMap.current = {
              [val]: true,
            };
          }}
          value={defaultValue}
        >
          {question.options.map((option) => {
            const isSelected = selectedMap.current[option.id];
            const isError = errorMap.current[option.id];

            const isCorrect = isSubmitted && isSelected && !isError;
            const isIncorrect = isSubmitted && isSelected && isError;

            const isCorrectAndNotSelected =
              isSubmitted && !isSelected && option.isCorrect;
            let color =
              isCorrectAndNotSelected || isCorrect
                ? "success"
                : isIncorrect
                ? "danger"
                : "primary";
            if (isTeacher && isHovered && !isSubmitted) {
              if (option.isCorrect) {
                color = "success";
              }
            }
            return (
              <label
                className="flex items-start wrap"
                key={option.id}
                style={{ marginBottom: 30, cursor: "pointer" }}
              >
                <Radio
                  color={color}
                  value={option.id}
                  className={`radio-force-${color}`}
                />
                <div>
                  <p
                    style={{
                      fontSize: 18,
                      lineHeight: "24px",
                    }}
                  >
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
          const color = isMissed
            ? "default"
            : isCorrect
            ? "success"
            : isIncorrect
            ? "danger"
            : "primary";
          const isHoverByTeacher = isTeacher && !isSubmitted && isHovered;
          return (
            <label
              className="flex items-start wrap"
              key={option.id}
              style={{
                marginBottom: 30,
                cursor: "pointer",
                position: "relative",
              }}
            >
              <div
                className="mr-2"
                style={{
                  width: 24,
                  height: 24,
                  zIndex: 333,
                  flexShrink: 0,
                  position: "absolute",
                  background: isHoverByTeacher ? "#fff" : "transparent",
                }}
              >
                {isHoverByTeacher && option.isCorrect && (
                  <img
                    src={CheckedIcon.src}
                    style={{ width: 26, height: 26, zIndex: 2 }}
                  />
                )}
              </div>
              <div className="mr-2">
                <Checkbox
                  color={color}
                  isSelected={isMissed ? isMissed : undefined}
                  isDisabled={isSubmitted && !isCorrect}
                  size="lg"
                  className={`py-0 ${
                    isCorrect && "checkbox-test-option-success"
                  } ${isIncorrect && "checkbox-test-option-danger"}`}
                  onValueChange={(val) => {
                    selectedMap.current[option.id] = val;
                  }}
                  icon={
                    isIncorrect ? (
                      <Image
                        alt="close icon"
                        src={Close}
                        style={{ width: 10, height: 10 }}
                      />
                    ) : undefined
                  }
                />
              </div>
              <div>
                <p
                  style={{
                    fontSize: 18,
                    lineHeight: "24px",
                    marginTop: isIncorrect ? 2 : 0,
                  }}
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
  }, []);

  const onGoBack = useCallback(() => {
    setActiveIndex((i) => (i - 1 < 0 ? 0 : i - 1));
  }, []);

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
    <>
      <div className={`py-8 w-[100%] max-w-[100%] max-w-[886px] m-auto`}>
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
      <div className={`py-8 w-[100%] max-w-[100%] max-w-[886px] m-auto`}>
        <Card
          className={`max-w-[540px]`}
          style={{ margin: "0 auto", padding: 30 }}
        >
          {isFinished ? (
            <>
              <p style={{ fontSize: 28, fontWeight: 600, textAlign: "center" }}>
                Your score
              </p>
              <p
                style={{
                  fontSize: 54,
                  fontWeight: 600,
                  marginTop: 30,
                  marginBottom: 30,
                  textAlign: "center",
                }}
              >
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
            />
          )}
          {!isFinished && (
            <div className="flex justify-between items-center">
              <div className="w-[100px]">
                {activeIndex !== 0 && (
                  <p
                    style={{
                      color: "#B7B7B7",
                      textAlign: "left",
                      marginTop: 40,
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                    className="hover:underline"
                    onClick={onGoBack}
                  >
                    Back
                  </p>
                )}
              </div>
              <div className="w-[100px]">
                <p
                  style={{
                    color: "#B7B7B7",
                    textAlign: "center",
                    marginTop: 40,
                    fontSize: 14,
                  }}
                >
                  {currentStep}/{totalSteps}
                </p>
              </div>
              <div className="w-[100px]"></div>
            </div>
          )}
        </Card>
      </div>
    </>
  );
};
