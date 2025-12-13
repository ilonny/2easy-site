/* eslint-disable @next/next/no-img-element */

import { FC, memo, useCallback, useContext, useEffect, useMemo } from "react";
import { TFillGapsSelectData } from "../../editor/FillGapsSelect/types";
import { Tooltip } from "@nextui-org/react";
import { createRoot } from "react-dom/client";
import { RENDER_DELAY } from "./constants";
import {
  getAnswerWrapperSelector,
  getMaxOptionLength,
  computeMaxWidth,
  getToolTipContent,
} from "./helpers";
import AnswerField from "./components/AnswerField";
import Header from "./components/Header";
import ImageView from "./components/ImageView";
import ContentCard from "./components/ContentCard";
import { AuthContext } from "@/auth";
import { useParams } from "next/navigation";

type TProps = {
  data: TFillGapsSelectData;
  isPreview?: boolean;
  isPresentationMode?: boolean;
  activeStudentId?: number;
};

export const FillGapsInputExViewComp: FC<TProps> = ({
  data,
  isPreview = false,
  isPresentationMode,
  activeStudentId,
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);

  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const renderContent = useCallback(() => {
    document.querySelectorAll(getAnswerWrapperSelector(data?.id)).forEach((el) => {
      const id = el.id;
      const idNum = Number(id);
      const field = data.fields.find((f) => f.id === idNum || f.id.toString() === id);
      const maxOptionLength = getMaxOptionLength(field);
      el.setAttribute("index", field?.id?.toString());
      const root = createRoot(el);
      const toolTipContent = getToolTipContent(field);
      root.render(
        <div
          className="answer-wrapper mx-2 !bg-transparent inline-block"
          id={"answer-wrapper-" + field?.id}
          style={{ maxWidth: computeMaxWidth(maxOptionLength) }}
        >
          <Tooltip isDisabled={!isTeacher || isPresentationMode} content={toolTipContent}>
            <div className="">
              <AnswerField
                field={field}
                key={field?.id}
                isTeacher={profile?.role_id === 2 || profile?.role_id === 1}
                isPresentationMode={isPresentationMode}
                ex_id={ex_id}
                lesson_id={lesson_id}
                student_id={student_id}
                activeStudentId={activeStudentId}
              />
            </div>
          </Tooltip>
        </div>
      );
    });
    }, [
    data?.id,
    data.fields,
    isTeacher,
    isPresentationMode,
    activeStudentId,
    profile?.role_id,
    ex_id,
    lesson_id,
    student_id,
  ]);

  useEffect(() => {
      const timerId = setTimeout(() => {
      renderContent();
    }, RENDER_DELAY);

      return ()=> {
          clearTimeout(timerId)
      }
  }, [renderContent]);

  const textHtml = useMemo(() => {
    return data.dataText;
  }, [data]);

  return (
    <>
      <Header title={data.title} subtitle={data.subtitle} description={data.description} titleColor={data.titleColor} />
      <ImageView image={image} />
      <ContentCard>
        <div
          className={
            "fill-gaps-input-area answerWrapperArea answerWrapperArea-" +
            (data?.id || 0).toString()
          }
          dangerouslySetInnerHTML={{ __html: textHtml }}
        ></div>
      </ContentCard>
    </>
  );
};

export const FillGapsInputExView = memo(FillGapsInputExViewComp);
