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
          Ссылка на урок
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-4 bg-white items-start cursor-pointer">
        <div
          className=""
          onClick={() => {
            navigator.clipboard.writeText(window.location.href).then(() => {
              toast.success(
                "Ссылка на урок скопирована в буфер обмена. Вы можете поделиться ей с учеником"
              );
              setPopoverIsOpen(false);
            });
          }}
        >
          <div className="flex justify-between items-center gap-4">
            <p>Скопировать ссылку</p>
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
