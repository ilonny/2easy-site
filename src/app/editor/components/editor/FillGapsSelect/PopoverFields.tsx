import {
  Button,
  Checkbox,
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
  onChangeFieldOption: (id: number, optionIndex: number) => void;
  onChangeFieldValue: (id: number, optionIndex: number, value: string) => void;
  onAddFieldOption: (id: number) => void;
  deleteOption: (id: number, optionIndex: number) => void;
};

const PopoverInput = ({
  onBlur,
  initialValue,
}: {
  onBlur: (val: string) => void;
  initialValue: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(initialValue);
  }, []);

  useEffect(() => {
    return () => {
      if (!inputValue) {
        return;
      }
      onBlur(inputValue);
    };
  }, [inputValue]);
  return (
    <Input
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onBlur={(e) => onBlur(inputValue)}
      // onChange={(e) => onBlur(inputValue)}
      size="sm"
      variant="underlined"
      color="primary"
      onKeyDown={(e) => {
        if (e.key.toLowerCase() === "enter") {
          onBlur(inputValue);
        }
      }}
    />
  );
};

export const PopoverFields: FC<TProps> = ({
  id,
  field,
  onChangeFieldOption,
  onChangeFieldValue,
  onAddFieldOption,
  deleteOption,
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
          <span style={{ color: "#3F28C6 important!" }}>______</span>
        </Button>
        {/* <Select variant="bordered" size="sm" fullWidth={false} className="min-w-[100px]" /> */}
      </PopoverTrigger>
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Варианты для пропуска:</div>
          {field?.options?.map((option, optionIndex) => {
            return (
              <div
                className="flex items-center gap-1"
                key={optionIndex.toString() + option.isCorrect}
              >
                <Checkbox
                  isSelected={option.isCorrect}
                  onValueChange={() => {
                    setIsOpen(false);
                    onChangeFieldOption(id, optionIndex);
                    setTimeout(() => {
                      document
                        .getElementById("popover-wrapper-" + id)
                        ?.firstChild?.click();
                    }, 50);
                  }}
                >
                  {/* {option.value} */}
                </Checkbox>
                <PopoverInput
                  initialValue={option.value}
                  onBlur={(val) => {
                    onChangeFieldValue(id, optionIndex, val);
                  }}
                />
                <Button
                  onClick={() => {
                    setIsOpen(false);
                    deleteOption(id, optionIndex);
                    setTimeout(() => {
                      document
                        .getElementById("popover-wrapper-" + id)
                        ?.firstChild?.click();
                    }, 100);
                  }}
                  isIconOnly
                  variant="flat"
                  size="sm"
                >
                  <Image src={Close} alt="delete option" />
                </Button>

                {/* <Input
                  value={option.value}
                  onChange={(e) =>
                    onChangeFieldValue(id, optionIndex, e.target.value)
                  }
                /> */}
              </div>
            );
          })}
          <Button
            style={{
              padding: 10,
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={(e) => {
              setIsOpen(false);
              onAddFieldOption(id);
              setTimeout(() => {
                const wrapper = document.getElementById(
                  "popover-wrapper-" + id
                )?.firstChild;
                document
                  .getElementById("popover-wrapper-" + id)
                  ?.firstChild?.click();
              }, 50);
            }}
          >
            <p style={{ color: "#3F28C6" }}>+ добавить вариант</p>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
