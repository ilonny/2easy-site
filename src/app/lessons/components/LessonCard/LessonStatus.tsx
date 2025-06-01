import CheckedIcon from "@/assets/icons/checked.svg";
import LessonOpenIcon from "@/assets/icons/lesson_open.svg";
import LessonCloseIcon from "@/assets/icons/lesson_close.svg";
import { Image } from "@nextui-org/react";

export const LessonStatus = ({
  status,
}: {
  status: "open" | "close" | "complete";
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
            Урок открыт
          </p>
        </div>
      );
    case "complete":
      return (
        <div className="flex items-center gap-2">
          <Image src={CheckedIcon.src} alt="checked icon" />
          <p className="text-[#219F59]" style={{ fontSize: 14 }}>
            Урок пройден
          </p>
        </div>
      );
    case "close":
      return (
        <div className="flex items-center gap-2">
          <Image src={LessonCloseIcon.src} alt="checked icon" />
          <p className="text-[#C4C4C4]" style={{ fontSize: 14 }}>
            Урок закрыт
          </p>
        </div>
      );
    default:
      return <></>;
  }
};
