/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { FC, useContext, useEffect } from "react";
import { Card, Checkbox } from "@nextui-org/react";
import { TTextStickerData } from "../../editor/TextSticker/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import { AuthContext } from "@/auth";

type TProps = {
  data: TTextStickerData;
  isPreview?: boolean;
};

export const TextChecklistExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];

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
    isPresentationMode: rest?.isPresentationMode,
  });

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
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <div className="flex flex-col md:flex-row items-stretch justify-center flex-wrap mx-auto w-full min-w-0 gap-3 md:gap-2">
          <div className="w-full md:w-1/2 min-w-0 shrink-0 p-2">
            <Card className={`w-full p-3 sm:p-4 flex-col gap-2 h-full min-w-0`}>
              {data.stickers?.map((sticker, index) => {
                if (!sticker) {
                  return <></>;
                }
                const answerString = answers[sticker]?.answer;
                const isChecked = answerString
                  ? JSON.parse(answerString)
                  : false;
                return (
                  <label
                    className="flex items-baseline gap-2"
                    key={index}
                    style={{ cursor: "pointer" }}
                  >
                    {rest.isView && !rest.isPresentationMode ? (
                      <Checkbox
                        size="lg"
                        color="primary"
                        onValueChange={(val) => {
                          writeAnswer(sticker, JSON.stringify(val));
                        }}
                        isSelected={isTeacher ? isChecked : undefined}
                      />
                    ) : (
                      <Checkbox size="lg" color="primary" />
                    )}
                    <p className="text-base sm:text-lg break-words">{sticker}</p>
                  </label>
                );
              })}
            </Card>
          </div>
          {!!editorImage && (
            <div className="w-full md:w-1/2 min-w-0 shrink-0 p-2">
              <Card className={`w-full h-full min-w-0`}>
                {!!editorImage && (
                  <img
                    src={editorImage.dataURL}
                    alt=""
                    className="mx-auto w-full max-w-full h-auto object-contain"
                  />
                )}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
