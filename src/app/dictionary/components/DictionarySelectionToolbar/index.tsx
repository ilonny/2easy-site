"use client";

import { Checkbox } from "@nextui-org/react";
import { FC, KeyboardEvent } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS,
  DICTIONARY_MODAL_SELECT_ALL_DIVIDER_CLASS,
} from "../../constants";

type TProps = {
  totalCount: number;
  selectedCount: number;
  allSelected: boolean;
  isDisabled?: boolean;
  onToggleAll: () => void;
  selectAllLabelKey?: string;
  selectAllLabelDefault?: string;
  className?: string;
};

export const DictionarySelectionToolbar: FC<TProps> = ({
  totalCount,
  selectedCount,
  allSelected,
  isDisabled = false,
  onToggleAll,
  selectAllLabelKey = "dictionary.selectAll",
  selectAllLabelDefault = "Выбрать все",
  className = "",
}) => {
  const canToggle = !isDisabled && totalCount > 0;

  const handleSelectAllKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!canToggle) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onToggleAll();
    }
  };

  return (
    <div
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 shrink-0 ${className}`.trim()}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
        <p className={`text-[#767676] ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
          <T
            k="dictionary.wordsCount"
            values={{ count: totalCount }}
            defaultText="Всего слов {{count}}"
          />
        </p>
        {selectedCount > 0 && (
          <p
            className={`text-primary font-medium ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}
          >
            <T
              k="dictionary.selectedCount"
              values={{ count: selectedCount }}
              defaultText="Выбрано: {{count}}"
            />
          </p>
        )}
      </div>
      <div className={DICTIONARY_MODAL_SELECT_ALL_DIVIDER_CLASS} />
      <div
        role="button"
        tabIndex={canToggle ? 0 : -1}
        onClick={() => {
          if (canToggle) {
            onToggleAll();
          }
        }}
        onKeyDown={handleSelectAllKeyDown}
        className={`ml-auto flex items-center gap-2 shrink-0 touch-manipulation ${
          canToggle ? "cursor-pointer" : "pointer-events-none"
        }`}
      >
        <span className={`text-[#767676] ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
          <T k={selectAllLabelKey} defaultText={selectAllLabelDefault} />
        </span>
        <div onClick={(event) => event.stopPropagation()}>
          <Checkbox
            isSelected={allSelected}
            onValueChange={onToggleAll}
            isDisabled={!canToggle}
            aria-label={i18n.t(selectAllLabelKey, {
              defaultValue: selectAllLabelDefault,
            })}
          />
        </div>
      </div>
    </div>
  );
};
