import {
  Button,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import ChevronIconDown from "@/assets/icons/chevron_down.svg";
import Image from "next/image";
import { TField } from "./types";

type TProps = {
  id: number;
  field: TField;
  onChangeFieldOption: (id: number, optionIndex: number) => void;
};

export const PopoverFields: FC<TProps> = ({
  id,
  field,
  onChangeFieldOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // useEffect(() => {
  //   setIsOpen(false);
  //   setTimeout(() => {
  //     setIsOpen(true);
  //   }, 300);
  // }, [field.options]);
  console.log('field?', field)
  return (
    <Popover
      placement="bottom"
      contentEditable="false"
      size="sm"
      data-index={id}
      key={id}
      isOpen={isOpen}
      onOpenChange={(open) => setIsOpen(open)}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            duration: 0,
            transition: {
              opacity: {
                duration: 0,
              },
            },
          },
          exit: {
            y: "10%",
            opacity: 0,
            duration: 0,
            transition: {
              opacity: {
                duration: 0,
              },
            },
          },
        },
      }}
    >
      <PopoverTrigger>
        <Button
          variant="light"
          color="default"
          endContent={<Image src={ChevronIconDown} alt="down" />}
        >
          <span style={{ color: "#3F28C6" }}>______</span>
        </Button>
        {/* <Select variant="bordered" size="sm" fullWidth={false} className="min-w-[100px]" /> */}
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Варианты для пропуска:</div>
          {field?.options?.map((option, optionIndex) => {
            console.log(
              "option???",
              option,
              optionIndex.toString() + option.isCorrect
            );
            return (
              <Checkbox
                key={optionIndex.toString() + option.isCorrect}
                isSelected={option.isCorrect}
                onValueChange={() => {
                  setIsOpen(false);
                  onChangeFieldOption(id, optionIndex);
                  setTimeout(() => {
                    const wrapper = document.getElementById(
                      "popover-wrapper-" + index
                    )?.firstChild;
                    console.log("wrapper?", wrapper);
                    document
                      .getElementById("popover-wrapper-" + index)
                      ?.firstChild?.click();
                  }, 50);
                }}
              >
                {option.value}
              </Checkbox>
            );
          })}
          <div className="text-tiny">This is the popover content</div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
