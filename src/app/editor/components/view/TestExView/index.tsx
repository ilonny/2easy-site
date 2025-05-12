/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useEffect,
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

type TProps = {
  data: TTestData;
  isPreview?: boolean;
};

type TTestStepProps = {
  question: TQuestion;
  onPressNext: () => void;
  setScore: Dispatch<SetStateAction<number>>;
};

export const TestStep = (props: TTestStepProps) => {
  const { question, onPressNext, setScore } = props;
  const isSingleAnswer =
    question?.options?.map((o) => o.isCorrect)?.filter(Boolean).length === 1;

  const [isSubmitted, setIsSubmitted] = useState(false);

  const selectedMap = useRef<Record<string, boolean>>({});
  const errorMap = useRef<Record<string, boolean>>({});

  const onSubmitResult = useCallback(() => {
    console.log("onSubmitResult: ", selectedMap.current);
    question?.options?.forEach((option) => {
      if (option.isCorrect && !selectedMap.current[option.id]) {
        errorMap.current[option.id] = true;
      }
      if (!option.isCorrect && selectedMap.current[option.id]) {
        errorMap.current[option.id] = true;
      }
    });
    setIsSubmitted(true);
    if (!Object.keys(errorMap.current).length) {
      setScore((s) => s + 1);
    }
  }, [question?.options, setScore]);

  if (!question) {
    return <></>;
  }
  const defaultValue = !Object.keys(errorMap).length
    ? undefined
    : Object.keys(errorMap.current)[0];
  return (
    <>
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
            const color = isCorrect
              ? "success"
              : isIncorrect
              ? "danger"
              : "primary";

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
                      lineHeight: "18px",
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

          return (
            <label
              className="flex items-start wrap"
              key={option.id}
              style={{ marginBottom: 30, cursor: "pointer" }}
            >
              <div className="mr-2">
                <Checkbox
                  color={
                    isMissed
                      ? "default"
                      : isCorrect
                      ? "success"
                      : isIncorrect
                      ? "danger"
                      : "primary"
                  }
                  isSelected={isMissed ? isMissed : undefined}
                  isDisabled={isSubmitted && !isCorrect}
                  size="lg"
                  className={`py-0 ${
                    isCorrect && "checkbox-test-option-success"
                  }`}
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
                    lineHeight: "18px",
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
    </>
  );
};

export const TestExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  const [activeIndex, setActiveIndex] = useState(0);
  const [score, setScore] = useState(0);
  const activeQuestion = data.questions[activeIndex];
  const currentStep = activeIndex + 1;
  const totalSteps = data?.questions?.length;
  const isLastStep = currentStep === totalSteps;
  const [isFinished, setIsFinished] = useState(false);

  const onPressNext = useCallback(() => {
    if (!isLastStep) {
      setActiveIndex((i) => i + 1);
      return;
    }
    setIsFinished(true);
  }, [isLastStep]);

  const onPressRestart = useCallback(() => {
    setScore(0);
    setActiveIndex(0);
    setIsFinished(false);
  }, []);

  const onGoBack = useCallback(() => {
    setActiveIndex((i) => (i - 1 < 0 ? 0 : i - 1));
  }, []);

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
