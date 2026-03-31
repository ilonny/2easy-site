"use client";

import { uuidv4 } from "@/app/editor/helpers";
import {
  Button,
  Checkbox,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Chip,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { TFillGapsNewGap, TFillGapsNewOption } from "./types";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  gapId: string;
  initialCorrectText?: string;
  currentGap?: TFillGapsNewGap;
  onSave: (gap: TFillGapsNewGap) => void;
};

export const GapOptionsModal: FC<TProps> = ({
  isOpen,
  onClose,
  gapId,
  initialCorrectText,
  currentGap,
  onSave,
}) => {
  const initialGap = useMemo<TFillGapsNewGap>(() => {
    if (currentGap) return currentGap;
    return {
      id: gapId,
      options: [
        {
          id: uuidv4(),
          value: initialCorrectText || "",
          isCorrect: true,
        },
        {
          id: uuidv4(),
          value: "",
          isCorrect: false,
        },
      ],
    };
  }, [currentGap, gapId, initialCorrectText]);

  const [localGap, setLocalGap] = useState<TFillGapsNewGap>(initialGap);

  useEffect(() => {
    if (isOpen) {
      setLocalGap(initialGap);
    }
  }, [initialGap, isOpen]);

  const setOption = useCallback(
    (idx: number, patch: Partial<TFillGapsNewOption>) => {
      setLocalGap((g) => {
        const options = [...(g.options || [])];
        options[idx] = { ...options[idx], ...patch };
        return { ...g, options };
      });
    },
    [],
  );

  const addOption = useCallback(() => {
    setLocalGap((g) => ({
      ...g,
      options: (g.options || []).concat({
        id: uuidv4(),
        value: "",
        isCorrect: false,
      }),
    }));
  }, []);

  const removeOption = useCallback((idx: number) => {
    setLocalGap((g) => {
      const options = (g.options || []).filter((_o, i) => i !== idx);
      return { ...g, options };
    });
  }, []);

  const canSave = useMemo(() => {
    const options = (localGap.options || []).filter((o) => o.value?.trim());
    const hasCorrect = options.some((o) => o.isCorrect);
    return options.length >= 1 && hasCorrect;
  }, [localGap.options]);

  const correctCount = useMemo(() => {
    return (localGap.options || []).filter((o) => o.value?.trim() && o.isCorrect)
      .length;
  }, [localGap.options]);

  const onPressSave = useCallback(() => {
    const normalized: TFillGapsNewGap = {
      ...localGap,
      options: (localGap.options || [])
        .map((o) => ({ ...o, value: o.value || "" }))
        .filter((o) => o.value.trim().length > 0),
    };
    onSave(normalized);
    onClose();
  }, [localGap, onClose, onSave]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      placement="center"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[85dvh]",
      }}
    >
      <ModalContent>
        <ModalHeader className="justify-between items-center">
          <div className="flex flex-col">
            <div className="font-semibold">Варианты ответа</div>
            <div className="text-small text-gray-500">
              Отметьте правильные варианты. Минимум один.
            </div>
          </div>
          <div>
            <Chip
              size="sm"
              color={correctCount > 0 ? "success" : "warning"}
              variant="flat"
            >
              Правильных: {correctCount}
            </Chip>
          </div>
        </ModalHeader>
        <ModalBody className="overflow-y-auto">
          <div className="flex flex-col gap-2 pb-2">
            {(localGap.options || []).map((o, idx) => {
              return (
                <div
                  key={o.id}
                  className="flex items-start gap-3 bg-white rounded-xl p-3"
                  style={{
                    boxShadow: "0px 8px 24px 0px #908BA826",
                    border: o.isCorrect
                      ? "1px solid rgba(22, 163, 74, 0.35)"
                      : "1px solid rgba(17, 24, 39, 0.08)",
                  }}
                >
                  <div className="pt-1">
                    <Checkbox
                      isSelected={o.isCorrect}
                      onValueChange={(val) =>
                        setOption(idx, { isCorrect: val })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={o.value}
                      onValueChange={(val) => setOption(idx, { value: val })}
                      placeholder={idx === 0 ? "Правильный ответ" : "Вариант ответа"}
                      classNames={{
                        // iOS Safari auto-zooms inputs with font-size < 16px, which can "crop" fixed modals.
                        input: "text-[16px] leading-5",
                        inputWrapper: "bg-white",
                      }}
                      variant="bordered"
                    />
                    <div className="mt-1 flex items-center justify-between">
                      <div className="text-tiny text-gray-500">
                        {o.isCorrect ? "Правильный" : "Неправильный"}
                      </div>
                      {(localGap.options || []).length > 1 && (
                        <Button
                          size="sm"
                          variant="light"
                          color="danger"
                          onPress={() => removeOption(idx)}
                        >
                          Удалить
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div>
              <Button variant="flat" onPress={addOption} className="w-full">
                + Добавить вариант
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button
            color="primary"
            isDisabled={!canSave}
            onPress={onPressSave}
            className="min-w-[260px]"
          >
            Сохранить варианты
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

