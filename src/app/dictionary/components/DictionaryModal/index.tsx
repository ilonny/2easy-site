"use client";

import { FC, KeyboardEvent } from "react";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tab,
  Tabs,
} from "@nextui-org/react";
import Loupe from "@/assets/icons/loupe.svg";
import ArrowRightIcon from "@/assets/icons/arrow_right.svg";
import { DictionaryIcon } from "@/components/icons/DictionaryIcon";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { DictionaryTab } from "../../types";
import { useDictionaryModal } from "../../hooks/useDictionaryModal";
import {
  DICTIONARY_LIST_HEIGHT_CLASS,
  DICTIONARY_MODAL_INPUT_CLASS_NAMES,
  DICTIONARY_SEARCH_INPUT_CLASS_NAMES,
} from "../../constants";
import { AddWordModal } from "../AddWordModal";
import { DeleteDictionaryConfirmModal } from "../DeleteDictionaryConfirmModal";
import { DictionaryWordCard } from "./DictionaryWordCard";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  initialLessonId?: number;
};

export const DictionaryModal: FC<TProps> = ({
  isOpen,
  onClose,
  studentId,
  initialLessonId,
}) => {
  const {
    items,
    isLoading,
    activeTab,
    setActiveTab,
    searchInput,
    setSearchInput,
    selectedIds,
    setSelectedIds,
    lessonFilterId,
    actionsPopoverOpen,
    setActionsPopoverOpen,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    newWordText,
    setNewWordText,
    addWordModalOpen,
    setAddWordModalOpen,
    hasLessonContext,
    isLessonFilterActive,
    groupedItems,
    allSelected,
    toggleSelectAll,
    toggleItem,
    handleMarkLearned,
    handleDelete,
    openAddWordModal,
    handleWordAdded,
    toggleLessonFilter,
  } = useDictionaryModal({ isOpen, studentId, initialLessonId });

  const handleSelectAllKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isLoading || !items.length) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleSelectAll();
    }
  };

  return (
    <>
      <Modal
        size="xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[85vh]",
          body: "overflow-hidden py-0",
        }}
      >
        <ModalContent className="max-h-[85vh]">
          <ModalHeader className="flex flex-col gap-1 shrink-0">
            <T k="dictionary.title" defaultText="Словарь" />
          </ModalHeader>
          <ModalBody className="gap-4 px-0 text-sm flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 pt-2 shrink-0">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as DictionaryTab)}
                color="primary"
                variant="underlined"
                classNames={{
                  tabList: "gap-6 w-full border-b border-[#eee] p-0",
                  cursor: "w-full bg-primary",
                  tab: "px-0 h-10 text-sm",
                }}
              >
                <Tab
                  key="unlearned"
                  title={
                    <T
                      k="dictionary.unlearnedTab"
                      defaultText="Неизученные слова"
                    />
                  }
                />
                <Tab
                  key="learned"
                  title={
                    <T k="dictionary.learnedTab" defaultText="Изученные слова" />
                  }
                />
              </Tabs>
            </div>

            <div className="px-6 pt-1 pb-4 border-b border-[#eee] shrink-0">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={newWordText}
                  onValueChange={setNewWordText}
                  placeholder={i18n.t("dictionary.addWordPlaceholder")}
                  size="md"
                  classNames={DICTIONARY_MODAL_INPUT_CLASS_NAMES}
                  startContent={
                    <DictionaryIcon size={18} className="text-[#C4C4C4]" />
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && newWordText.trim()) {
                      event.preventDefault();
                      openAddWordModal();
                    }
                  }}
                />
                <Button
                  isIconOnly
                  color="primary"
                  radius="lg"
                  size="md"
                  className="shrink-0 !w-10 !h-10 !min-w-10 self-center"
                  isDisabled={!newWordText.trim()}
                  onClick={openAddWordModal}
                >
                  <Image
                    src={ArrowRightIcon.src}
                    alt="add"
                    style={{ borderRadius: 0 }}
                  />
                </Button>
              </div>

              <div className="pt-4">
                <Input
                  value={searchInput}
                  onValueChange={setSearchInput}
                  placeholder={i18n.t("dictionary.searchPlaceholder")}
                  size="md"
                  classNames={DICTIONARY_SEARCH_INPUT_CLASS_NAMES}
                  startContent={
                    <Image
                      src={Loupe.src}
                      alt="search"
                      style={{ borderRadius: 0 }}
                    />
                  }
                />
              </div>
            </div>

            <div className="px-6 py-1 flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 shrink-0">
                <p className="text-[#767676] whitespace-nowrap">
                  <T
                    k="dictionary.wordsCount"
                    values={{ count: items.length }}
                    defaultText="Всего слов {{count}}"
                  />
                </p>
                {selectedIds.length > 0 && (
                  <p className="text-primary font-medium whitespace-nowrap">
                    <T
                      k="dictionary.selectedCount"
                      values={{ count: selectedIds.length }}
                      defaultText="Выбрано: {{count}}"
                    />
                  </p>
                )}
              </div>
              <div className="flex-1 border-t border-dotted border-[#ccc] min-w-[24px]" />
              <div
                role="button"
                tabIndex={isLoading || !items.length ? -1 : 0}
                onClick={() => {
                  if (!isLoading && items.length) {
                    toggleSelectAll();
                  }
                }}
                onKeyDown={handleSelectAllKeyDown}
                className={`flex items-center gap-2 shrink-0 ${
                  isLoading || !items.length
                    ? "pointer-events-none"
                    : "cursor-pointer"
                }`}
              >
                <span className="text-[#767676]">
                  <T k="dictionary.selectAll" defaultText="Выбрать все" />
                </span>
                <div onClick={(event) => event.stopPropagation()}>
                  <Checkbox
                    isSelected={allSelected}
                    onValueChange={toggleSelectAll}
                    isDisabled={isLoading || !items.length}
                    aria-label={i18n.t("dictionary.selectAll")}
                  />
                </div>
              </div>
            </div>

            <div
              className={`px-6 pb-2 flex flex-col overflow-y-auto ${DICTIONARY_LIST_HEIGHT_CLASS}`}
            >
              {isLoading && (
                <div className="flex justify-center py-10">
                  <Spinner color="primary" />
                </div>
              )}

              {!isLoading && !items.length && (
                <p className="text-center text-[#767676] py-10 text-sm">
                  <T k="dictionary.empty" defaultText="Слов пока нет" />
                </p>
              )}

              {!isLoading &&
                groupedItems.map((group) => (
                  <div key={group.key} className="flex flex-col">
                    {groupedItems.length > 1 && (
                      <p className="font-bold text-primary uppercase py-2">
                        {group.label}
                      </p>
                    )}
                    <div className="flex flex-col gap-2">
                      {group.items.map((item) => (
                        <DictionaryWordCard
                          key={item.id}
                          item={item}
                          isSelected={selectedIds.includes(item.id)}
                          isLoading={isLoading}
                          onToggle={toggleItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </ModalBody>
          <ModalFooter className="relative flex min-h-10 items-center text-sm shrink-0 px-6">
            <div className="flex w-full flex-wrap items-center justify-center gap-2">
              <Button
                variant="light"
                size="sm"
                onClick={() => setSelectedIds([])}
                isDisabled={!selectedIds.length}
              >
                <T k="dictionary.resetSelection" defaultText="Сбросить" />
              </Button>
              <Popover
                isOpen={actionsPopoverOpen}
                onOpenChange={setActionsPopoverOpen}
                placement="top"
              >
                <PopoverTrigger>
                  <Button
                    color="primary"
                    size="sm"
                    isDisabled={!selectedIds.length}
                  >
                    <T k="dictionary.actions" defaultText="Действия" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="flex w-full flex-col items-stretch bg-white p-2 text-sm">
                  {activeTab === "unlearned" && (
                    <Button
                      variant="light"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleMarkLearned(true)}
                    >
                      <T
                        k="dictionary.markLearned"
                        defaultText="Отметить как выученное"
                      />
                    </Button>
                  )}
                  {activeTab === "learned" && (
                    <Button
                      variant="light"
                      size="sm"
                      className="justify-start"
                      onClick={() => handleMarkLearned(false)}
                    >
                      <T
                        k="dictionary.markUnlearned"
                        defaultText="Отметить как невыученное"
                      />
                    </Button>
                  )}
                  <Button
                    variant="light"
                    size="sm"
                    color="danger"
                    className="w-full justify-start"
                    onClick={() => {
                      setActionsPopoverOpen(false);
                      setDeleteConfirmOpen(true);
                    }}
                  >
                    <T k="common.delete" />
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
            {hasLessonContext && (
              <Button
                color="primary"
                radius="lg"
                size="sm"
                className="absolute left-6 shrink-0 font-medium"
                variant={isLessonFilterActive ? "solid" : "flat"}
                onClick={toggleLessonFilter}
              >
                {isLessonFilterActive ? (
                  <T k="dictionary.allWords" defaultText="Все слова" />
                ) : (
                  <T k="dictionary.lessonWords" defaultText="Слова урока" />
                )}
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AddWordModal
        isVisible={addWordModalOpen}
        setIsVisible={setAddWordModalOpen}
        studentId={studentId}
        sourceWord={newWordText.trim()}
        lessonId={lessonFilterId}
        onSuccess={handleWordAdded}
      />

      <DeleteDictionaryConfirmModal
        isVisible={deleteConfirmOpen}
        setIsVisible={setDeleteConfirmOpen}
        count={selectedIds.length}
        onConfirm={handleDelete}
      />
    </>
  );
};
