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
  const student_id = useContext(AuthContext)?.profile?.studentId;
  const ex_id = data?.id;
  const { writeAnswer } = useExAnswer({ student_id, lesson_id, ex_id });

  const onValueChange = useDebouncedCallback(
    (q_id: number | string, answer: string) => {
      console.log("onValueChange", q_id, answer);
      writeAnswer(q_id, answer);
    },
    500
  );
  console.log("data", data);
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
      <div className={`py-8 w-[540px] m-auto`}>
        {data.questions.map((question) => {
          console.log("question", question);
          return (
            <div key={question.id} className="mb-6">
              <p style={{ fontSize: 18, marginBottom: 20, fontWeight: 500 }}>
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
                  }}
                />
              </Card>
            </div>
          );
        })}
      </div>
    </>
  );
};
