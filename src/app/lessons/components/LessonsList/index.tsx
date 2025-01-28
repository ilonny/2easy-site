import { FC } from "react";
import { TLesson } from "../../types";
import { LessonCard } from "../LessonCard";

type TProps = {
  lessons: TLesson[];
};

export const LessonsList: FC<TProps> = ({ lessons }) => {
  return (
    <div className="flex items-start justify-start w-full flex-wrap">
      {lessons?.map((lesson) => {
        return <LessonCard key={lesson.id} lesson={lesson} />;
      })}
    </div>
  );
};
