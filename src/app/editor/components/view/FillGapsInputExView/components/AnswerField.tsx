import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TField } from "../../../editor/FillGapsSelect/types";
import { Input } from "@nextui-org/react";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import styles from "../styles.module.css";

export interface AnswerFieldProps {
  field: TField;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  ex_id?: number;
  lesson_id?: number | string | string[];
  student_id?: number | string | string[];
  activeStudentId?: number;
}

const AnswerField: FC<AnswerFieldProps> = ({
  field,
  isTeacher,
  isPresentationMode,
  ex_id,
  lesson_id,
  student_id,
  activeStudentId,
}) => {
  const params = {
    ex_id: typeof ex_id === "string" ? Number(ex_id) : ex_id,
    lesson_id: typeof lesson_id === "string" ? Number(lesson_id) : lesson_id,
    student_id: typeof student_id === "string" ? Number(student_id) : student_id,
    isTeacher,
    activeStudentId,
    isPresentationMode,
    sleepDelay: 2000,
  } as any;

  const { getAnswers, writeAnswer, answers } = useExAnswer(params);

  const [selectedValue, setSelectedValue] = useState("");
  const [isIncorrect, setIsIncorrect] = useState(false);

  const isCorrect = useMemo(() => {
    return !!field?.options?.find(
      (o) => o.value.toLowerCase() === selectedValue.toLowerCase()
    )?.isCorrect;
  }, [selectedValue, field?.options]);

  const onChangeSelection = useCallback((val: string) => {
    setSelectedValue(val);
    return;
  }, []);

  useEffect(() => {
    if (!isTeacher) {
      getAnswers(true).then((a) => {
        if (a?.[field?.id]?.answer) {
          setSelectedValue(a?.[field?.id]?.answer);
        }
      });
    }
  }, [field?.id, getAnswers, isTeacher]);

  useEffect(() => {
    if (isTeacher) {
      return;
    }
    if (selectedValue) {
      writeAnswer(field.id, selectedValue);
    }
  }, [field?.id, isTeacher, selectedValue, writeAnswer]);

  useEffect(() => {
    if (!isTeacher || isPresentationMode) {
      return;
    }
    if (answers?.[field?.id]?.answer) {
      setSelectedValue(answers?.[field?.id]?.answer);
    }
  }, [isTeacher, answers, field?.id, isPresentationMode]);

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
    />
  );
};

export default AnswerField;
