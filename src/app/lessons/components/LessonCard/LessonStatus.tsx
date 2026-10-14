import CheckedIcon from "@/assets/icons/checked.svg";
import LessonOpenIcon from "@/assets/icons/lesson_open.svg";
import LessonCloseIcon from "@/assets/icons/lesson_close.svg";
import { Image } from "@nextui-org/react";
import { T } from "@/i18n/T";

export const LessonStatus = ({
  status,
  isCourses,
}: {
  status: "open" | "close" | "complete";
  isCourses?: boolean;
}) => {
  switch (status) {
    case "open":
      return (
        <div className="flex items-center gap-2">
          <Image
            src={LessonOpenIcon.src}
            alt="checked icon"
            style={{ borderRadius: 0 }}
          />
          <p className="text-[#3F28C6]" style={{ fontSize: 14 }}>
            {isCourses ? <T k="lessons.courseOpen" /> : <T k="lessons.lessonOpen" />}
          </p>
        </div>
      );
    case "complete":
      return (
        <div className="flex items-center gap-2">
          <Image src={CheckedIcon.src} alt="checked icon" />
          <p className="text-[#219F59]" style={{ fontSize: 14 }}>
            <T k="lessons.lessonComplete" />
          </p>
        </div>
      );
    case "close":
      return (
        <div className="flex items-center gap-2">
          <Image src={LessonCloseIcon.src} alt="checked icon" />
          <p className="text-[#C4C4C4]" style={{ fontSize: 14 }}>
            {isCourses ? <T k="lessons.courseClosed" /> : <T k="lessons.lessonClosed" />}
          </p>
        </div>
      );
    default:
      return <></>;
  }
};
