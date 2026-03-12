import { useTranslation } from "react-i18next";
import CheckedIcon from "@/assets/icons/checked.svg";
import LessonOpenIcon from "@/assets/icons/lesson_open.svg";
import LessonCloseIcon from "@/assets/icons/lesson_close.svg";
import { Image } from "@nextui-org/react";

export const LessonStatus = ({
  status,
  isCourses,
}: {
  status: "open" | "close" | "complete";
  isCourses?: boolean;
}) => {
  const { t } = useTranslation();
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
            {isCourses ? t("lessons.courseOpen") : t("lessons.lessonOpen")}
          </p>
        </div>
      );
    case "complete":
      return (
        <div className="flex items-center gap-2">
          <Image src={CheckedIcon.src} alt="checked icon" />
          <p className="text-[#219F59]" style={{ fontSize: 14 }}>
            {t("lessons.lessonComplete")}
          </p>
        </div>
      );
    case "close":
      return (
        <div className="flex items-center gap-2">
          <Image src={LessonCloseIcon.src} alt="checked icon" />
          <p className="text-[#C4C4C4]" style={{ fontSize: 14 }}>
            {isCourses ? t("lessons.courseClosed") : t("lessons.lessonClosed")}
          </p>
        </div>
      );
    default:
      return <></>;
  }
};
