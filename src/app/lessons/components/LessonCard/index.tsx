import { FC } from "react";
import { TLesson } from "../../types";

type TProps = {
  lesson: TLesson;
};

export const LessonCard: FC<TProps> = ({ lesson }) => {
  return (
    <div style={{ width: "25%" }} className="p-2">
      <div style={{ backgroundColor: "red" }}>{lesson.title}</div>
    </div>
  );
};
