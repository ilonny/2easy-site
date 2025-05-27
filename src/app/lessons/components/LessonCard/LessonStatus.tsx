import CheckedIcon from "@/assets/icons/checked.svg";
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
          <Image src={CheckedIcon.src} alt="checked icon" />
          <p className="text-[#219F59]" style={{ fontSize: 14 }}>
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
          <p className="text-[#A42929]" style={{ fontSize: 14 }}>
            Урок закрыт
          </p>
        </div>
      );
    default:
      return <></>;
  }
};
