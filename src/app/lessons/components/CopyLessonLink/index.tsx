/* eslint-disable @next/next/no-img-element */
import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
} from "@nextui-org/react";
import { useState } from "react";
import { toast } from "react-toastify";
import LinkIcon from "@/assets/icons/link.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

export const CopyLessonLink = () => {
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
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
          <T k="lessons.lessonLink" defaultText="Ссылка на урок" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 bg-white items-start cursor-pointer">
        <div
          className=""
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              toast.success(
                i18n.t("lessons.lessonLinkCopied", {
                  defaultValue:
                    "Ссылка на урок скопирована в буфер обмена. Вы можете поделиться ей с учеником",
                })
              );
              setPopoverIsOpen(false);
            });
          }}
        >
          <div className="flex justify-between items-center gap-4">
            <p>
              <T k="common.copyLink" defaultText="Скопировать ссылку" />
            </p>
            <img src={CopyIcon.src} alt="fds" />
          </div>
          <div className="p-2 mt-2" style={{ border: "1px solid #191919" }}>
            {window.location.href}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
