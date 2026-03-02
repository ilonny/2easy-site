"use client";

import { Button, Image } from "@nextui-org/react";
import { FC } from "react";
import ChevronIconDown from "@/assets/icons/chevron_down.svg";

type TProps = {
  fieldId: number | string;
  onOpenOptions: (fieldId: number | string) => void;
};

export const GapFieldTrigger: FC<TProps> = ({ fieldId, onOpenOptions }) => (
    <div
      className="popover-wrapper"
      id={"popover-wrapper-" + fieldId}
      contentEditable={false}
      suppressContentEditableWarning
    >
      <Button
        size="sm"
        variant="light"
        color="default"
        onClick={() => onOpenOptions(fieldId)}
        endContent={
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image
              src={ChevronIconDown.src}
              alt="down"
              width={16}
              height={16}
            />
          </span>
        }
      >
        <span style={{ color: "#3F28C6" }}>______</span>
      </Button>
    </div>
);
