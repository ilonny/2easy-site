"use client";

import {
  Button,
  Checkbox,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useEffect, useState } from "react";
import { TField, TFieldOption } from "./types";
import DeleteIcon from "@/assets/icons/delete.svg";
import SortIcon from "@/assets/icons/sort.svg";
import {
  sortableContainer,
  sortableElement,
  sortableHandle,
} from "react-sortable-hoc";
import { arrayMoveImmutable } from "array-move";

type TProps = {
  field: TField | undefined;
  isOpen: boolean;
  onClose: () => void;
  onSaveOptions: (fieldId: number | string, options: TFieldOption[]) => void;
};

const DragHandle = sortableHandle(() => (
  <span
    style={{ display: "flex", cursor: "grab", padding: "2px 0" }}
    title="Перетащите для изменения порядка"
  >
    <Image
      src={SortIcon.src}
      alt="sort"
      style={{ flexShrink: 0, width: 18, height: 18, opacity: 0.6 }}
    />
  </span>
));

const SortableOptionItem = sortableElement(
  ({
    option,
    optionIndex,
    optionsLength,
    onLocalOptionChange,
    onLocalDelete,
  }: {
    option: TFieldOption;
    optionIndex: number;
    optionsLength: number;
    onLocalOptionChange: (index: number, updater: (opt: TFieldOption) => TFieldOption) => void;
    onLocalDelete: (index: number) => void;
  }) => (
    <div className="flex items-center gap-2 py-1">
      <DragHandle />
      <Checkbox
        isSelected={option.isCorrect}
        onValueChange={() =>
          onLocalOptionChange(optionIndex, (opt) => ({
            ...opt,
            isCorrect: !opt.isCorrect,
          }))
        }
      />
      <Input
        size="sm"
        variant="underlined"
        color="primary"
        value={option.value}
        onValueChange={(val) =>
          onLocalOptionChange(optionIndex, (opt) => ({ ...opt, value: val }))
        }
        className="flex-1"
        autoComplete="off"
      />
      {optionsLength > 1 && (
        <Button
          onClick={() => onLocalDelete(optionIndex)}
          isIconOnly
          size="sm"
          variant="bordered"
          className="shrink-0 min-w-8 border-default-200 text-default-500 hover:text-danger hover:border-danger/50"
          title="Удалить вариант"
        >
          <Image
            src={DeleteIcon.src}
            alt="Удалить"
            width={14}
            height={14}
          />
        </Button>
      )}
    </div>
  )
);

const SortableOptionsList = sortableContainer(
  ({ children }: { children: React.ReactNode }) => (
    <div className="flex flex-col gap-1">{children}</div>
  )
);

export const FieldOptionsModal: FC<TProps> = ({
  field,
  isOpen,
  onClose,
  onSaveOptions,
}) => {
  const [localOptions, setLocalOptions] = useState<TFieldOption[]>([]);

  useEffect(() => {
    if (isOpen && field) {
      setLocalOptions(
        Array.isArray(field.options)
          ? field.options.map((o) => ({ ...o }))
          : []
      );
    }
  }, [isOpen, field?.id]);

  const handleLocalOptionChange = (
    index: number,
    updater: (opt: TFieldOption) => TFieldOption
  ) => {
    setLocalOptions((prev) =>
      prev.map((opt, i) => (i === index ? updater(opt) : opt))
    );
  };

  const handleLocalAdd = () => {
    setLocalOptions((prev) => [...prev, { value: "", isCorrect: false }]);
  };

  const handleLocalDelete = (index: number) => {
    setLocalOptions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocalReorder = (oldIndex: number, newIndex: number) => {
    setLocalOptions((prev) => arrayMoveImmutable(prev, oldIndex, newIndex));
  };

  const handleSave = () => {
    if (field) {
      onSaveOptions(field.id, localOptions);
      onClose();
    }
  };

  if (!field) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        <ModalHeader>Варианты для пропуска</ModalHeader>
        <ModalBody>
          <div className="flex flex-col gap-4">
            {localOptions.length > 0 ? (
              <SortableOptionsList
                onSortEnd={({ oldIndex, newIndex }) => {
                  if (oldIndex !== newIndex) {
                    handleLocalReorder(oldIndex, newIndex);
                  }
                }}
                useDragHandle
                helperClass="fill-gaps-sortable-helper"
              >
                {localOptions.map((option, index) => (
                  <SortableOptionItem
                    key={index}
                    index={index}
                    option={option}
                    optionIndex={index}
                    optionsLength={localOptions.length}
                    onLocalOptionChange={handleLocalOptionChange}
                    onLocalDelete={handleLocalDelete}
                  />
                ))}
              </SortableOptionsList>
            ) : null}
            <Button variant="flat" color="primary" onPress={handleLocalAdd}>
              + добавить вариант
            </Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            Отмена
          </Button>
          <Button color="primary" onPress={handleSave}>
            Сохранить
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
