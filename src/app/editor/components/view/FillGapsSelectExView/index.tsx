/* eslint-disable @next/next/no-img-element */

import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TField, TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Card, Select, SelectItem } from "@nextui-org/react";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import {
  collectGapIds,
  computeSelectWrapperMinWidth,
  maxOptionTextLength,
  normalizeField,
  parseLegacyGapHtml,
} from "@/app/editor/helpers/fillGapsLegacy";
import { LegacyGapHtml } from "../LegacyGapHtml";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
};

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  localAnswers: { id: number | string; word: string; isCorrect: boolean }[];
  setLocalAnswers: React.Dispatch<
    React.SetStateAction<
      { id: number | string; word: string; isCorrect: boolean }[]
    >
  >;
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

  const onChangeSelection = useCallback(
    (val: string) => {
      if (!field) return;
      setSelectedValue(val);
      setCount((c) => c + 1);
      const correct = !!field.options?.find((o) => o.value === val)?.isCorrect;
      setLocalAnswers((a) =>
        a.concat({
          id: field.id,
          isCorrect: correct,
          word: val,
        })
      );
    },
    [field, setLocalAnswers]
  );

  useEffect(() => {
    if (!field?.options?.length || field.options.length === 1) {
      return;
    }
    if (count >= field.options.length - 1 && !isCorrect) {
      setIsDisabled(true);
      setSelectedValue(field.options.find((o) => o.isCorrect)?.value || "");
    }
  }, [count, field?.options, isCorrect, selectedValue, field]);

  const selectedKeys = useMemo(() => {
    if (
      !field?.options?.length ||
      !selectedValue ||
      !field.options.some((o) => o.value === selectedValue)
    ) {
      return new Set<string>();
    }
    return new Set([selectedValue]);
  }, [field?.options, selectedValue]);

  if (!field) return null;

  if (!field.options?.length) {
    return (
      <span className="inline-block min-h-8 min-w-[72px] rounded-lg bg-default-100 px-2 py-1 text-left text-xs text-default-400">
        —
      </span>
    );
  }

  return (
    <>
      <Select
        className={`${styles["answer-wrapper"]} font-normal min-w-[72px] w-auto max-w-full`}
        classNames={{
          base: "min-w-[72px] w-auto max-w-full data-[focus=true]:z-30",
          mainWrapper: "min-w-[72px] w-auto",
          trigger: "min-w-[72px] w-auto max-w-full shrink-0",
        }}
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
        onSelectionChange={(keys) => {
          const v = Array.from(keys)[0];
          if (v != null) onChangeSelection(String(v));
        }}
        selectedKeys={selectedKeys}
        isDisabled={isDisabled}
        popoverProps={{ shouldFlip: true }}
      >
        {field.options.map((o) => {
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

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;
  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode
  });

  const skipPersistRef = useRef(false);

  useEffect(() => {
    skipPersistRef.current = true;
    setLocalAnswers([]);
  }, [resetSeq]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          skipPersistRef.current = true;
          setLocalAnswers(JSON.parse(a[data.id].answer));
        } catch (err) {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  useEffect(() => {
    if (!isTeacher) {
      return;
    }
    // Only mirror student answers when viewing a student —
    // otherwise empty poll wipes local practice progress.
    if (!rest.activeStudentId) {
      return;
    }
    try {
      const raw = answers[data.id]?.answer;
      skipPersistRef.current = true;
      if (!raw) {
        setLocalAnswers([]);
        return;
      }
      setLocalAnswers(JSON.parse(raw));
    } catch (err) {
      skipPersistRef.current = true;
      setLocalAnswers([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher, rest.activeStudentId]);

  useEffect(() => {
    if (skipPersistRef.current) {
      skipPersistRef.current = false;
      return;
    }
    if (localAnswers.length) {
      void writeAnswer(data.id, JSON.stringify(localAnswers));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAnswers, writeAnswer]);

  const fields = data.fields || [];
  const fieldsById = useMemo(() => {
    const map = new Map<string, TField>();
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

  const renderGap = (id: string, key: string) => {
    const field = fieldsById.get(String(id));
    if (!field) return null;
    const minWidth = computeSelectWrapperMinWidth(
      maxOptionTextLength(field.options),
    );
    return (
      <span
        key={key}
        className={`${styles["answer-wrapper"]} answer-wrapper mx-2 select-answer-wrapper`}
        id={"answer-wrapper-" + field.id}
        style={{
          display: "inline-block",
          width: minWidth,
          maxWidth: "100%",
          verticalAlign: "middle",
        }}
      >
        <AnswerField
          field={field}
          isTeacher={isTeacher}
          localAnswers={localAnswers}
          setLocalAnswers={setLocalAnswers}
          isPresentationMode={rest?.isPresentationMode}
        />
      </span>
    );
  };

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
            style={{ margin: "0 auto" }}
            className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10 leading-[1.8] sm:leading-[2.3]"
          >
            <div className="answerWrapperArea">
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
