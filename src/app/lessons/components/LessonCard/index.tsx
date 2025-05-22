import { FC, useMemo, useState } from "react";
import { TLesson } from "../../types";
import { BASE_URL } from "@/api";
import styles from "./styles.module.css";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import Ellipse from "@/assets/icons/ellipse.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Bg from "@/assets/images/create_lesson_bg_card.png";

type TProps = {
  lesson: TLesson;
  onPressEdit?: (lesson: TLesson) => void;
  onPressDelete?: (lesson: TLesson) => void;
  onPressAttach?: (lesson: TLesson) => void;
};

export const LessonCard: FC<TProps> = ({
  lesson,
  onPressEdit,
  onPressDelete,
  onPressAttach,
}) => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const router = useRouter();
  const tags = useMemo(() => {
    if (lesson?.tags) {
      return (
        <div className="flex flex-wrap gap-2 items-center">
          {lesson?.tags?.split(",")?.map((tag) => {
            return (
              <Button
                size="sm"
                color="primary"
                radius="full"
                className="text-white"
                key={tag}
              >
                {tag.replaceAll("[", "").replaceAll("]", "")}
              </Button>
            );
          }, [])}
        </div>
      );
    }
  }, [lesson?.tags]);

  return (
    <div style={{ width: "25%" }} className={`p-2 ${styles["lesson-card"]}`}>
      <div
        onClick={() => {
          router.push("/editor/" + lesson?.id);
        }}
        className="image-wrapper"
        style={{
          width: "100%",
          height: 317,
          position: "relative",
          overflow: "hidden",
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        }}
      >
        <div
          className={styles["image-bg"]}
          style={{
            width: "100%",
            height: "100%",
            background: `url(${
              lesson.image_path ? BASE_URL + "/" + lesson.image_path : Bg.src
            })`,
            // backgroundPosition: "center",
            transition: "all 500ms ease",
            // backgroundSize: "cover",
          }}
        />
        <div className={styles["shadow"]} />
        <div className={styles["btn-wrapper"]}>
          <Popover
            color="foreground"
            placement="bottom-end"
            isOpen={popoverIsOpen}
            onOpenChange={(open) => setPopoverIsOpen(open)}
          >
            <PopoverTrigger>
              <Button isIconOnly variant="flat">
                <Image src={Ellipse} alt="icon" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white p-2">
              {!!onPressEdit && (
                <Button
                  size="sm"
                  variant="light"
                  className="w-full text-default-foreground py-1 p-x-4 text-left justify-start"
                  style={{ fontSize: 16 }}
                  onClick={() => {
                    setPopoverIsOpen(false);
                    onPressEdit(lesson);
                  }}
                >
                  Редактировать
                </Button>
              )}
              {!!onPressAttach && (
                <Button
                  size="sm"
                  variant="light"
                  className="w-full text-default-foreground py-1 p-x-4 text-left justify-start"
                  style={{ fontSize: 16 }}
                  onClick={() => {
                    setPopoverIsOpen(false);
                    onPressAttach(lesson);
                  }}
                >
                  Прикрепить к ученику
                </Button>
              )}
              {!!onPressDelete && (
                <Button
                  size="sm"
                  variant="light"
                  className="w-full text-default-foreground py-1 p-x-4 justify-start"
                  style={{ fontSize: 16 }}
                  endContent={<Image src={DeleteIcon} alt="icon" />}
                  onClick={() => {
                    setPopoverIsOpen(false);
                    onPressDelete(lesson);
                  }}
                >
                  Удалить
                </Button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        className="p-4 bg-white "
        style={{
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          // height: "135px",
        }}
      >
        <p className="text-black font-bold" style={{ fontSize: 18 }}>
          {lesson.title}
        </p>
        <div className="h-2" />
        {!!tags && tags}
        <div className="h-2" />
        {!!lesson.description && (
          <div style={{ whiteSpace: "break-spaces", fontSize: 14 }}>
            {lesson.description.length > 100
              ? lesson.description.slice(0, 110) + "..."
              : lesson.description}
          </div>
        )}
      </div>
    </div>
  );
};
