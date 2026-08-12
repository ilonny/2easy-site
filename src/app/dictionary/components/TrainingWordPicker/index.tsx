"use client";

import { Checkbox } from "@nextui-org/react";
import { FC, useMemo } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { TDictionaryItem } from "../../types";
import { groupByLesson } from "../../utils/groupByLesson";
import { DictionarySelectionToolbar } from "../DictionarySelectionToolbar";
import { DictionaryWordCard } from "../DictionaryModal/DictionaryWordCard";
import {
  DICTIONARY_LIST_SCROLL_CLASS,
  DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS,
} from "../../constants";

type TProps = {
  items: TDictionaryItem[];
  selectedIds: number[];
  isLoading: boolean;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onToggleGroup: (ids: number[], select: boolean) => void;
};

export const TrainingWordPicker: FC<TProps> = ({
  items,
  selectedIds,
  isLoading,
  onToggle,
  onToggleAll,
  onToggleGroup,
}) => {
  const lessonGroups = useMemo(() => groupByLesson(items), [items]);
  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <DictionarySelectionToolbar
        totalCount={items.length}
        selectedCount={selectedIds.length}
        allSelected={allSelected}
        isDisabled={isLoading}
        onToggleAll={onToggleAll}
        selectAllLabelKey="dictionary.allWords"
        selectAllLabelDefault="Все слова"
      />

      <div className={`${DICTIONARY_LIST_SCROLL_CLASS} pb-2`}>
        {!isLoading && !items.length && (
          <p className="text-center text-[#767676] py-10 text-base">
            <T
              k="dictionary.training.emptyUnlearned"
              defaultText="Нет неизученных слов для тренировки"
            />
          </p>
        )}

        {!isLoading &&
          lessonGroups.map((group) => {
            const groupIds = group.items.map((item) => item.id);
            const groupSelected =
              groupIds.length > 0 &&
              groupIds.every((id) => selectedIds.includes(id));

            return (
              <div key={group.key} className="flex flex-col min-w-0 mb-3">
                <div className="flex items-center gap-2 py-2">
                  <p
                    className={`font-medium text-primary break-words flex-1 min-w-0 ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}
                  >
                    {group.label}
                  </p>
                  <Checkbox
                    isSelected={groupSelected}
                    onValueChange={(selected) =>
                      onToggleGroup(groupIds, selected)
                    }
                    isDisabled={isLoading || !groupIds.length}
                    aria-label={i18n.t("dictionary.training.selectLessonGroup", {
                      name: group.label,
                    })}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <DictionaryWordCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.includes(item.id)}
                      isLoading={isLoading}
                      showLessonBadge={false}
                      onToggle={onToggle}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
