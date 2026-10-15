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
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import {
  collectGapIds,
  maxOptionTextLength,
  normalizeField,
  parseLegacyGapHtml,
} from "@/app/editor/helpers/fillGapsLegacy";
import { LegacyGapHtml } from "../LegacyGapHtml";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const PERSIST_DEBOUNCE_MS = 450;

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  activeStudentId?: number | string | null;
  /** Snapshot / live map — student typing must not remount via parent portal churn */
  getAnswer: (fieldId: string | number) => string;
  writeAnswer: (q_id: number | string, answer: string) => Promise<any>;
  /** Bumps when teacher poll / remote reset should overwrite local value */
  syncToken?: string | number;
}> = ({
  field,
  isTeacher,
  isPresentationMode,
  activeStudentId,
  getAnswer,
  writeAnswer,
  syncToken,
}) => {
  const [selectedValue, setSelectedValue] = useState(
    () => getAnswer(field?.id) || "",
  );
  const [isIncorrect] = useState(false);
  const focusedRef = useRef(false);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestValueRef = useRef(selectedValue);
  const writeAnswerRef = useRef(writeAnswer);
  writeAnswerRef.current = writeAnswer;
  latestValueRef.current = selectedValue;

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

  const flushPersist = useCallback(() => {
    if (isTeacher) return;
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    const val = latestValueRef.current;
    void writeAnswerRef.current(field.id, val);
  }, [field.id, isTeacher]);

  const schedulePersist = useCallback(
    (val: string) => {
      if (isTeacher) return;
      latestValueRef.current = val;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        saveTimerRef.current = null;
        void writeAnswerRef.current(field.id, latestValueRef.current);
      }, PERSIST_DEBOUNCE_MS);
    },
    [field.id, isTeacher],
  );

  const onChangeSelection = useCallback(
    (val: string) => {
      dirtyRef.current = true;
      setSelectedValue(val);
      schedulePersist(val);
    },
    [schedulePersist],
  );

  // Student: apply remote value only when not editing locally
  useEffect(() => {
    if (isTeacher) return;
    if (focusedRef.current || dirtyRef.current) return;
    const fromServer = getAnswer(field?.id);
    if (fromServer !== undefined && fromServer !== latestValueRef.current) {
      setSelectedValue(fromServer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncToken, field?.id, getAnswer, isTeacher]);

  // Teacher: live sync only when viewing a student (don't wipe solo practice)
  useEffect(() => {
    if (!isTeacher || isPresentationMode) return;
    if (!activeStudentId) return;
    setSelectedValue(getAnswer(field?.id) || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isTeacher,
    syncToken,
    field?.id,
    isPresentationMode,
    activeStudentId,
    getAnswer,
  ]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
        if (!isTeacher && dirtyRef.current) {
          void writeAnswerRef.current(field.id, latestValueRef.current);
        }
      }
    };
  }, [field.id, isTeacher]);

  return (
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
      autoComplete="off"
      name={`fg-input-${field?.id}`}
      onFocus={() => {
        focusedRef.current = true;
      }}
      onBlur={() => {
        focusedRef.current = false;
        flushPersist();
        // Allow later boot/reset sync; ExList remount covers teacher reset.
        dirtyRef.current = false;
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          flushPersist();
        }
      }}
    />
  );
};

export const FillGapsInputExViewComp: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isPresentationMode = !!(rest as any)?.isPresentationMode;
  const activeStudentId = (rest as any)?.activeStudentId;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    ex_id,
    lesson_id,
    student_id,
    isTeacher,
    activeStudentId,
    isPresentationMode,
  });

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const writeAnswerRef = useRef(writeAnswer);
  writeAnswerRef.current = writeAnswer;

  const getAnswer = useCallback((fieldId: string | number) => {
    return String(answersRef.current?.[fieldId]?.answer ?? "");
  }, []);

  const stableWriteAnswer = useCallback(
    (q_id: number | string, answer: string) => {
      return writeAnswerRef.current(q_id, answer);
    },
    [],
  );

  /** Student: bump once after first answers load. Teacher: follow poll/reset. */
  const [bootVersion, setBootVersion] = useState(0);
  const teacherSyncToken =
    isTeacher && activeStudentId
      ? `${resetSeq}:${JSON.stringify(
          Object.keys(answers || {})
            .sort()
            .map((k) => [k, answers?.[k]?.answer]),
        )}`
      : `${resetSeq}:${bootVersion}`;

  useEffect(() => {
    if (isPreview) return;
    const targetId = student_id || activeStudentId;
    if (!targetId) return;
    let cancelled = false;
    getAnswers(true).finally(() => {
      if (!cancelled) setBootVersion((v) => v + 1);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id, isPreview, activeStudentId]);

  useEffect(() => {
    setBootVersion((v) => v + 1);
  }, [resetSeq]);

  const fields = data.fields || [];
  const fieldsById = useMemo(() => {
    const map = new Map<string, NonNullable<ReturnType<typeof normalizeField>>>();
    fields.forEach((field) => {
      const normalized = normalizeField(field);
      if (normalized?.id != null) map.set(String(normalized.id), normalized);
    });
    return map;
  }, [fields]);

  const gapNodes = useMemo(
    () => parseLegacyGapHtml(data.dataText || ""),
    [data.dataText],
  );
  const usedGapIds = useMemo(() => new Set(collectGapIds(gapNodes)), [gapNodes]);
  const missingFields = fields.filter(
    (field) => field?.id != null && !usedGapIds.has(String(field.id)),
  );

  const hideAnswerHints = !isTeacher || isPresentationMode;

  const renderGap = (id: string, key: string) => {
    const field = fieldsById.get(String(id));
    if (!field) return null;
    const safeLen = maxOptionTextLength(field.options);
    const ch = Math.min(Math.max(Number.isFinite(safeLen) ? safeLen : 8, 6), 24);
    const toolTipContent = hideAnswerHints
      ? ""
      : field.options
          .filter((o) => o.isCorrect)
          .map((o) => o.value)
          .join(", ");
    return (
      <span
        key={key}
        className={`${styles.gapSlot} answer-wrapper mx-2 !bg-transparent`}
        id={"answer-wrapper-" + field.id}
        style={{ width: `${ch + 2}ch` }}
      >
        <ResponsiveTooltip isDisabled={hideAnswerHints} content={toolTipContent}>
          <div>
            <AnswerField
              field={field}
              isTeacher={isTeacher}
              isPresentationMode={isPresentationMode}
              activeStudentId={activeStudentId}
              getAnswer={getAnswer}
              writeAnswer={stableWriteAnswer}
              syncToken={teacherSyncToken}
            />
          </div>
        </ResponsiveTooltip>
      </span>
    );
  };

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
            style={{ margin: "0 auto" }}
            className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 leading-[1.8] sm:leading-[2.3]"
          >
            <div
              className={
                "fill-gaps-input-area answerWrapperArea answerWrapperArea-" +
                (data?.id || 0).toString()
              }
            >
              <LegacyGapHtml html={data.dataText || ""} renderGap={renderGap} />
              {missingFields.map((raw) => {
                const field = normalizeField(raw);
                if (!field) return null;
                return (
                  <div key={String(field.id)} className="mt-2">
                    {renderGap(String(field.id), `missing-${field.id}`)}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export const FillGapsInputExView = memo(FillGapsInputExViewComp);
