"use client";

/* eslint-disable @next/next/no-img-element */

import { Button, Card } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
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
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { AuthContext } from "@/auth";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import {
  isTrueFalseSentenceValid,
  TTrueFalseData,
  TTrueFalseSentence,
} from "../../editor/TrueFalse/types";
import styles from "./styles.module.css";

type TAnswerStatus = "correct" | "incorrect" | "neutral";
type TAnswersMap = Record<
  string,
  { value?: boolean; status?: TAnswerStatus }
>;

const TrueFalseExViewImpl: FC<{
  data: TTrueFalseData;
  isPreview?: boolean;
}> = ({ data, isPreview = false, ...rest }) => {
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isViewMode = !!(rest as any)?.isView;
  const isPresentationMode = !!(rest as any)?.isPresentationMode;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const sentences = useMemo(
    () =>
      (data?.sentences || []).filter((s) =>
        isTrueFalseSentenceValid(s),
      ) as TTrueFalseSentence[],
    [data?.sentences],
  );

  const sentencesById = useMemo(() => {
    const m = new Map<string, TTrueFalseSentence>();
    sentences.forEach((s) => m.set(s.id, s));
    return m;
  }, [sentences]);

  const canInteract =
    isPreview ||
    !isViewMode ||
    (!!student_id && !isTeacher) ||
    (isTeacher && isPresentationMode);
  const shouldPersistAnswers =
    !isPreview && isViewMode && !!student_id && !isTeacher;

  const [answersVersion, setAnswersVersion] = useState(0);
  const answersRef = useRef<TAnswersMap>({});
  const [statusById, setStatusById] = useState<Record<string, TAnswerStatus>>(
    {},
  );
  const saveTimerRef = useRef<number | null>(null);
  const [hoveredSentenceId, setHoveredSentenceId] = useState<string | null>(
    null,
  );

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: (rest as any).activeStudentId,
    isTeacher,
    isPresentationMode,
  });

  useEffect(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    answersRef.current = {};
    setStatusById({});
    setAnswersVersion((v) => v + 1);
  }, [resetSeq]);

  const hydrateFromRaw = useCallback((raw: string | undefined | null) => {
    if (!raw) {
      answersRef.current = {};
      setStatusById({});
      setAnswersVersion((v) => v + 1);
      return;
    }
    try {
      const parsedRaw = JSON.parse(raw);
      const parsed: TAnswersMap = {};
      Object.keys(parsedRaw || {}).forEach((k) => {
        const v = parsedRaw[k];
        if (v && typeof v === "object") {
          parsed[k] = {
            value: typeof v.value === "boolean" ? v.value : undefined,
            status: v.status,
          };
        }
      });
      answersRef.current = parsed;
      const m: Record<string, TAnswerStatus> = {};
      Object.keys(parsed).forEach((k) => {
        const s = parsed[k]?.status;
        if (s) m[k] = s;
      });
      setStatusById(m);
      setAnswersVersion((v) => v + 1);
    } catch {}
  }, []);

  useEffect(() => {
    if (isPreview || !student_id) return;
    getAnswers(true).then((a) => {
      hydrateFromRaw(a?.[data.id as number]?.answer);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview]);

  useEffect(() => {
    if (isPreview || !answers || !isTeacher) return;
    if (!(rest as any)?.activeStudentId) return;
    hydrateFromRaw((answers as any)?.[data.id as number]?.answer);
  }, [
    answers,
    data.id,
    hydrateFromRaw,
    isPreview,
    isTeacher,
    (rest as any)?.activeStudentId,
  ]);

  const schedulePersist = useCallback(() => {
    if (!shouldPersistAnswers) return;
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      try {
        writeAnswer(data.id as any, JSON.stringify(answersRef.current));
      } catch {}
    }, 400);
  }, [data.id, shouldPersistAnswers, writeAnswer]);

  const writeAnswerRef = useRef(writeAnswer);
  writeAnswerRef.current = writeAnswer;
  const shouldPersistRef = useRef(shouldPersistAnswers);
  shouldPersistRef.current = shouldPersistAnswers;

  useEffect(() => {
    return () => {
      if (!saveTimerRef.current) return;
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      if (!shouldPersistRef.current) return;
      try {
        writeAnswerRef.current(
          data.id as any,
          JSON.stringify(answersRef.current),
        );
      } catch {}
    };
  }, [data.id]);

  const onChoose = useCallback(
    (sentenceId: string, value: boolean) => {
      if (!canInteract) return;
      const sentence = sentencesById.get(sentenceId);
      if (!sentence) return;
      const current = answersRef.current?.[sentenceId];
      if (current?.status === "correct") return;

      const ok = sentence.answer === value;
      answersRef.current = {
        ...answersRef.current,
        [sentenceId]: {
          value,
          status: ok ? "correct" : "incorrect",
        },
      };
      setStatusById((m) => ({
        ...m,
        [sentenceId]: ok ? "correct" : "incorrect",
      }));
      schedulePersist();
      setAnswersVersion((v) => v + 1);
    },
    [canInteract, schedulePersist, sentencesById],
  );

  const image = (data as any)?.images?.[0];

  const choiceClass = (
    sentenceId: string,
    option: boolean,
  ): string => {
    const selected = answersRef.current?.[sentenceId]?.value;
    const status = statusById?.[sentenceId] || "neutral";
    const isSelected = selected === option;
    const teacherHint =
      isTeacher &&
      !isPresentationMode &&
      hoveredSentenceId === sentenceId &&
      sentencesById.get(sentenceId)?.answer === option;

    if (teacherHint)
      return `${styles.choiceBtn} ${styles.choiceHint} ${styles.choiceCorrect}`;
    if (status === "correct" && isSelected)
      return `${styles.choiceBtn} ${styles.choiceCorrect}`;
    if (status === "incorrect" && isSelected)
      return `${styles.choiceBtn} ${styles.choiceIncorrect}`;
    if (isSelected) return `${styles.choiceBtn} ${styles.choiceSelected}`;
    return `${styles.choiceBtn} ${styles.choiceNeutral}`;
  };

  return (
    <div className={`${styles.root} exercise-view-shell`}>
      <div
        className={`py-4 sm:py-5 md:py-6 w-full max-w-[900px] mx-auto exercise-view-head`}
      >
        {!!data?.title && (
          <p
            className="exercise-view-title lg:text-[34px]"
            style={{
              color: (data as any)?.titleColor || "#3F28C6",
            }}
          >
            {data.title}
          </p>
        )}
        {!!data?.subtitle && (
          <p className="exercise-view-subtitle">{data.subtitle}</p>
        )}
        {!!data?.description && (
          <p className="exercise-view-desc text-[17px] lg:text-[18px]">
            {data.description}
          </p>
        )}
      </div>

      {!!image?.dataURL && (
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

      <Card className={styles.card}>
        {sentences.map((sentence) => {
          const teacherHintActive = isTeacher && !isPresentationMode;
          const inner = (
            <div
              className={styles.sentenceBlock}
              onMouseEnter={() => {
                if (teacherHintActive) setHoveredSentenceId(sentence.id);
              }}
              onMouseLeave={() => {
                setHoveredSentenceId((id) =>
                  id === sentence.id ? null : id,
                );
              }}
            >
              <p className={styles.sentenceText}>{sentence.text}</p>
              <div className={styles.buttons}>
                <Button
                  className={choiceClass(sentence.id, true)}
                  variant="flat"
                  isDisabled={!canInteract}
                  onPress={() => onChoose(sentence.id, true)}
                >
                  True
                </Button>
                <Button
                  className={choiceClass(sentence.id, false)}
                  variant="flat"
                  isDisabled={!canInteract}
                  onPress={() => onChoose(sentence.id, false)}
                >
                  False
                </Button>
              </div>
            </div>
          );

          if (!teacherHintActive) {
            return (
              <div key={sentence.id} className={styles.sentenceWrap}>
                {inner}
              </div>
            );
          }

          return (
            <ResponsiveTooltip
              key={sentence.id}
              content={
                <div>
                  Correct:{" "}
                  <span className="font-semibold text-[#15803D]">
                    {sentence.answer ? "True" : "False"}
                  </span>
                </div>
              }
            >
              <div className={`${styles.sentenceWrap} cursor-help`}>
                {inner}
              </div>
            </ResponsiveTooltip>
          );
        })}
      </Card>
      <span className="hidden" aria-hidden>
        {answersVersion}
      </span>
    </div>
  );
};

export const TrueFalseExView = memo(TrueFalseExViewImpl);
