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

type TProps = {
  lesson: TLesson;
  onPressEdit?: (lesson: TLesson) => void;
  onPressDelete?: (lesson: TLesson) => void;
};

export const LessonCard: FC<TProps> = ({
  lesson,
  onPressEdit,
  onPressDelete,
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
                color="warning"
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
              BASE_URL + "/" + lesson.image_path
            }) center center no-repeat #fff`,
            backgroundSize: "cover",
            transition: "all 500ms ease",
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
                  variant="light"
                  className="w-full text-default-foreground py-1 p-x-4 text-left"
                  style={{ fontSize: 16 }}
                  onClick={() => {
                    setPopoverIsOpen(false);
                    onPressEdit(lesson);
                  }}
                >
                  Редактировать
                </Button>
              )}
              {!!onPressDelete && (
                <Button
                  variant="light"
                  className="w-full text-default-foreground py-1 p-x-4"
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
      <div className="p-4 bg-white ">
        <p className="text-black font-bold">{lesson.title}</p>
        <div className="h-2" />
        {!!tags && tags}
        <div className="h-2" />
        {!!lesson.description && (
          <div style={{ whiteSpace: "break-spaces" }}>{lesson.description}</div>
        )}
      </div>
    </div>
  );
};
