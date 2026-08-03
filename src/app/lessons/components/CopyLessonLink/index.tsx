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
          className="min-h-10 touch-manipulation"
        >
          <T k="lessons.lessonLink" defaultText="Ссылка на урок" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-[min(100vw-2rem,420px)] items-start bg-white p-3 sm:p-4 cursor-pointer">
        <div
          className="w-full min-w-0"
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
          <div className="flex items-center justify-between gap-3 sm:gap-4">
            <p className="text-sm sm:text-base">
              <T k="common.copyLink" defaultText="Скопировать ссылку" />
            </p>
            <img src={CopyIcon.src} alt="" className="shrink-0" />
          </div>
          <div className="mt-2 max-w-full overflow-hidden break-all border border-[#191919] p-2 text-xs sm:text-sm">
            {typeof window !== "undefined" ? window.location.href : ""}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
