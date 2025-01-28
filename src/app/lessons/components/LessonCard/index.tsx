import { FC, useMemo } from "react";
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

type TProps = {
  lesson: TLesson;
};

export const LessonCard: FC<TProps> = ({ lesson }) => {
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
        className="image-wrapper"
        style={{
          width: "100%",
          height: 317,
          position: "relative",
          overflow: "hidden",
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
          <Popover color="foreground" placement="bottom-end">
            <PopoverTrigger>
              <Button isIconOnly variant="flat">
                <Image src={Ellipse} alt="icon" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="bg-white p-2">
              <Button
                variant="light"
                className="w-full text-default-foreground py-1 p-x-4 text-left"
                style={{ fontSize: 16 }}
              >
                Редактировать
              </Button>
              <Button
                variant="light"
                className="w-full text-default-foreground py-1 p-x-4"
                style={{ fontSize: 16 }}
                endContent={<Image src={DeleteIcon} alt="icon" />}
              >
                Удалить
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="p-4 bg-white ">
        <p className="text-black font-bold">LESSON PLAN {lesson.title}</p>
        <div className="h-2" />
        {!!tags && tags}
        <div className="h-2" />
        {!!lesson.description && <div>{lesson.description}</div>}
      </div>
    </div>
  );
};
