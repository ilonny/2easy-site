import {
  Button,
  Checkbox,
  Chip,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import ChevronIconDown from "@/assets/icons/chevron_down.svg";
import Image from "next/image";
import { TField } from "./types";
import Close from "@/assets/icons/close.svg";

type TProps = {
  id: string;
  field: TField;
};

export const PopoverFields: FC<TProps> = ({ id, field }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="drag-word">
      <div className="flex items-center gap-1">
        <span>{field?.value}</span>
        <Button
          onClick={(e) => {
            e.target?.closest(".answerWrapper")?.remove();
          }}
          isIconOnly
          size="sm"
          variant="light"
          className="hover:!bg-transparent"
        >
          <Image
            src={Close}
            alt="delete option"
            style={{ position: "relative", top: 1 }}
          />
        </Button>
      </div>
    </div>
  );
};
