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

/**
 * Компонент PopoverFields
 *
 * Отображает поповер с опциями (вариантами ответов) для каждого пропуска.
 * Появляется при клике на элемент пропуска в редакторе.
 *
 * Функциональность:
 * - Отображение всех вариантов ответов для пропуска
 * - Для каждого варианта: checkbox (отмечить как правильный) и input (редактировать текст)
 * - Возможность добавления нового варианта ответа
 * - Возможность удаления варианта ответа
 *
 * Компоненты:
 * - PopoverInput: input для редактирования текста варианта ответа
 * - Для каждого варианта: Checkbox (правильный/неправильный) и кнопка удаления
 *
 * Триггер поповера: кнопка с иконкой chevron (стрелка вниз)
 */
type TProps = {
  /** Уникальный ID пропуска */
  id: number;
  /** Объект пропуска с его опциями */
  field: TField;
  /** Callback для переключения флага isCorrect опции */
  onChangeFieldOption: (id: number, optionIndex: number) => void;
  /** Callback для изменения текста опции */
  onChangeFieldValue: (id: number, optionIndex: number, value: string) => void;
  /** Callback для добавления новой опции */
  onAddFieldOption: (id: number) => void;
  /** Callback для удаления опции */
  deleteOption: (id: number, optionIndex: number) => void;
};

/**
 * Компонент PopoverInput
 *
 * Input для редактирования текста варианта ответа внутри поповера.
 *
 * Особенности:
 * - Инициализируется с начальным значением при первой загрузке
 * - При потере фокуса (onBlur) вызывает callback с новым значением
 * - Сохраняет стояние в локальном state для корректной работы
 */
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

  // При размонтировании компонента сохраняем новое значение через onBlur
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
      style={{ position: "relative", top: 2 }}
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
      {/* Триггер - кнопка с иконкой стрелка для открытия поповера */}
      <PopoverTrigger>
        <Button
          size="sm"
          variant="light"
          color="default"
          endContent={
            <Image
              src={ChevronIconDown}
              alt="down"
              style={{ position: "relative", top: 5 }}
            />
          }
        >
          <span style={{ color: "#3F28C6 important!" }}>______</span>
        </Button>
      </PopoverTrigger>
      
      {/* Содержимое поповера - список вариантов ответов */}
      <PopoverContent>
        <div className="px-1 py-2">
          <div className="text-small font-bold">Варианты для пропуска:</div>
          
          {/* Список всех вариантов ответов для этого пропуска */}
          {field?.options?.map((option, optionIndex) => {
            return (
              <div
                className="flex items-center gap-1"
                key={optionIndex.toString() + option.isCorrect}
              >
                {/* Checkbox для отметки правильного ответа */}
                <Checkbox
                  isSelected={option.isCorrect}
                  onValueChange={() => {
                    // Закрываем поповер и переключаем флаг правильности
                    setIsOpen(false);
                    onChangeFieldOption(id, optionIndex);
                    // Переоткрываем поповер через небольшую задержку для обновления
                    setTimeout(() => {
                      document
                        .getElementById("popover-wrapper-" + id)
                        ?.firstChild?.click();
                    }, 50);
                  }}
                >
                  {/* Label для checkbox */}
                </Checkbox>
                
                {/* Input для редактирования текста варианта ответа */}
                <PopoverInput
                  initialValue={option.value}
                  onBlur={(val) => {
                    // Обновляем текст варианта ответа
                    onChangeFieldValue(id, optionIndex, val);
                  }}
                />
                
                {/* Кнопка удаления варианта (видна только если вариантов больше 1) */}
                {field?.options.length > 1 && (
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      // Удаляем вариант ответа
                      deleteOption(id, optionIndex);
                      setTimeout(() => {
                        document
                          .getElementById("popover-wrapper-" + id)
                          ?.firstChild?.click();
                      }, 100);
                    }}
                    isIconOnly
                    size="sm"
                    variant="light"
                    className="hover:!bg-transparent"
                  >
                    <Image src={Close} alt="delete option" />
                  </Button>
                )}
              </div>
            );
          })}
          
          {/* Кнопка добавления нового варианта ответа */}
          <Button
            style={{
              padding: 10,
              background: "#fff",
              cursor: "pointer",
            }}
            onClick={(e) => {
              setIsOpen(false);
              // Добавляем новый вариант ответа
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
