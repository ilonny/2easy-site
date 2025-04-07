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
  id: number;
  field: TField;
};

export const PopoverFields: FC<TProps> = ({ id, field }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="drag-word">
      <div className="flex items-center gap-1">{field?.value}</div>
    </div>
  );
};
