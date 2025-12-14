import {
  Button,
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

/**
 * TProps для компонента PopoverFields
 */
type TProps = {
  /** ID пропуска */
  id: string;
  /** Объект пропуска с вариантами ответов */
  field: TField;
  /** Обработчик изменения текста варианта ответа */
  onChangeFieldValue: (id: string, optionIndex: number, value: string) => void;
  /** Обработчик добавления нового варианта ответа */
  onAddFieldOption: (id: string) => void;
  /** Обработчик удаления варианта ответа */
  deleteOption: (id: string, optionIndex: number) => void;
};

/**
 * PopoverInput - входное поле внутри попавера для редактирования варианта ответа
 * Автоматически сохраняет значение при потере фокуса или нажатии Enter
 */
const PopoverInput = ({
  onBlur,
  initialValue,
}: {
  /** Обработчик потери фокуса с новым значением */
  onBlur: (val: string) => void;
  /** Начальное значение поля */
  initialValue: string;
}) => {
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    setInputValue(initialValue);
  }, []);

  /** Отправляет значение когда фокус теряется или пользователь выходит */
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
      size="sm"
      variant="underlined"
      color="primary"
      onKeyDown={(e) => {
        /** Отправляет значение при нажатии Enter */
        if (e.key.toLowerCase() === "enter") {
          onBlur(inputValue);
        }
      }}
    />
  );
};

/**
 * PopoverFields - компонент попавера для управления вариантами ответов пропуска
 * Позволяет редактировать, добавлять и удалять варианты ответов
 */
export const PopoverFields: FC<TProps> = ({
  id,
  field,
  onChangeFieldValue,
  onAddFieldOption,
  deleteOption,
}) => {
  /** Состояние открытости попавера */
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
            transition: {
              opacity: {
                duration: 0,
              },
            },
          },
          exit: {
            y: "10%",
            opacity: 0,
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
          endContent={
            <Image
              src={ChevronIconDown}
              alt="down"
              className="relative top-1"
            />
          }
        >
          <span className="text-[#3F28C6]">______</span>
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
                <PopoverInput
                  initialValue={option.value}
                  onBlur={(val) => {
                    onChangeFieldValue(id, optionIndex, val);
                  }}
                />
                {field.options.length > 1 && (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      deleteOption(id, optionIndex);
                      setTimeout(() => {
                        const element = document.getElementById("popover-wrapper-" + id)?.firstChild as HTMLElement | null;
                        element?.click();
                      }, 100);
                    }}
                    isIconOnly
                    variant="light"
                    className="hover:!bg-transparent"
                    size="sm"
                  >
                    <Image src={Close} alt="delete option" />
                  </Button>
                )}

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
            className="p-2.5 bg-white cursor-pointer hover:bg-gray-100"
            onClick={(e) => {
              setIsOpen(false);
              onAddFieldOption(id);
              setTimeout(() => {
                const element = document.getElementById("popover-wrapper-" + id)?.firstChild as HTMLElement | null;
                element?.click();
              }, 50);
            }}
          >
            <p className="text-[#3F28C6]">+ добавить вариант</p>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
