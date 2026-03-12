/* eslint-disable @next/next/no-img-element */
import { useTranslation } from "react-i18next";
import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
} from "@nextui-org/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import LinkIcon from "@/assets/icons/link.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { useParams } from "next/navigation";
import { fetchPostJson } from "@/api";

export const ShareLessonLink = () => {
  const { t } = useTranslation();
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const lessonId = useParams()?.id;

  const [link, setLink] = useState("");

  const getLink = useCallback(async () => {
    const res = await fetchPostJson({
      path: "/lesson-share/get",
      data: {
        lesson_id: Number(lessonId),
      },
      isSecure: true,
    });

    const data = await res.json();
    console.log("data??", data);
    if (data.link) {
      setLink(data.link);
    }
  }, [lessonId]);

  useEffect(() => {
    getLink();
  }, [getLink]);

  const createLink = useCallback(async () => {
    const res = await fetchPostJson({
      path: "/lesson-share/create",
      data: {
        lesson_id: Number(lessonId),
      },
      isSecure: true,
    });

    const data = await res.json();
    if (data.link) {
      setLink(data.link);
    }
  }, [lessonId]);

  useEffect(() => {
    if (!link && popoverIsOpen) {
      createLink();
    }
  }, [createLink, link, popoverIsOpen]);

  return (
    <Popover
      color="foreground"
      placement="bottom-end"
      isOpen={popoverIsOpen}
      onOpenChange={(open) => {
        setPopoverIsOpen(open);
      }}
    >
      <PopoverTrigger>
        <Button
          endContent={<img src={LinkIcon.src} alt="icon" />}
          variant="light"
        >
          {t("lessons.shareLessonWithTeacher")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 bg-white items-start cursor-pointer">
        <p style={{ whiteSpace: "pre-line" }}>
          {t("lessons.shareLessonHint")}
        </p>
        <br />
        <div
          className=""
          onClick={() => {
            navigator.clipboard.writeText(link).then(() => {
              toast.success(
                t("lessons.lessonLinkCopied"),
              );
              setPopoverIsOpen(false);
            });
          }}
        >
          <div className="flex gap-2 items-center">
            <div
              className="p-2 mt-2"
              style={{ border: "1px solid #191919", overflowWrap: "anywhere" }}
            >
              {link}
            </div>
            <div className="flex justify-between items-center gap-4">
              <img src={CopyIcon.src} alt="fds" />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
