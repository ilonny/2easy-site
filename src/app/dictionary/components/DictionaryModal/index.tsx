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
  DICTIONARY_ACTIONS_POPOVER_CLASS,
  DICTIONARY_LIST_SCROLL_CLASS,
  DICTIONARY_MODAL_ADD_WORD_BUTTON_CLASS,
  DICTIONARY_MODAL_BLOCK_SPACING_CLASS,
  DICTIONARY_MODAL_BODY_CLASS,
  DICTIONARY_MODAL_CENTERED_BLOCK_CLASS,
  DICTIONARY_MODAL_CLASS_NAMES,
  DICTIONARY_MODAL_CONTENT_CLASS,
  DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS,
  DICTIONARY_MODAL_FOOTER_CLASS,
  DICTIONARY_MODAL_INPUT_ROW_CLASS,
  DICTIONARY_MODAL_INPUTS_BLOCK_CLASS,
  DICTIONARY_MODAL_INPUT_CLASS_NAMES,
  DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_MODAL_SELECT_ALL_DIVIDER_CLASS,
  DICTIONARY_MODAL_TABS_CLASS_NAMES,
  DICTIONARY_SEARCH_INPUT_CLASS_NAMES,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";
import { AddWordModal } from "../AddWordModal";
import { DeleteDictionaryConfirmModal } from "../DeleteDictionaryConfirmModal";
import { DictionaryWordFilterSegment } from "../DictionaryWordFilterSegment";
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
    setLessonWordFilterMode,
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
        placement="center"
        classNames={DICTIONARY_MODAL_CLASS_NAMES}
      >
        <ModalContent className={DICTIONARY_MODAL_CONTENT_CLASS}>
          <ModalHeader
            className={`flex flex-col gap-1 shrink-0 ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-2`}
          >
            <T k="dictionary.title" defaultText="Словарь" />
          </ModalHeader>
          <ModalBody className={DICTIONARY_MODAL_BODY_CLASS}>
            <div className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pt-1 shrink-0`}>
              <Tabs
                fullWidth
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as DictionaryTab)}
                color="primary"
                variant="underlined"
                classNames={DICTIONARY_MODAL_TABS_CLASS_NAMES}
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

            <div
              className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} ${DICTIONARY_MODAL_INPUTS_BLOCK_CLASS}`}
            >
              <div className={DICTIONARY_MODAL_INPUT_ROW_CLASS}>
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
                  className={DICTIONARY_MODAL_ADD_WORD_BUTTON_CLASS}
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

              <div className={DICTIONARY_MODAL_BLOCK_SPACING_CLASS}>
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

              {hasLessonContext && (
                <div className={DICTIONARY_MODAL_CENTERED_BLOCK_CLASS}>
                  <DictionaryWordFilterSegment
                    isLessonFilterActive={isLessonFilterActive}
                    onChange={setLessonWordFilterMode}
                  />
                </div>
              )}
            </div>

            <div
              className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} py-1 flex flex-wrap items-center gap-x-3 gap-y-2 shrink-0`}
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                <p className={`text-[#767676] ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
                  <T
                    k="dictionary.wordsCount"
                    values={{ count: items.length }}
                    defaultText="Всего слов {{count}}"
                  />
                </p>
                {selectedIds.length > 0 && (
                  <p className={`text-primary font-medium ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
                    <T
                      k="dictionary.selectedCount"
                      values={{ count: selectedIds.length }}
                      defaultText="Выбрано: {{count}}"
                    />
                  </p>
                )}
              </div>
              <div className={DICTIONARY_MODAL_SELECT_ALL_DIVIDER_CLASS} />
              <div
                role="button"
                tabIndex={isLoading || !items.length ? -1 : 0}
                onClick={() => {
                  if (!isLoading && items.length) {
                    toggleSelectAll();
                  }
                }}
                onKeyDown={handleSelectAllKeyDown}
                className={`ml-auto flex items-center gap-2 shrink-0 touch-manipulation ${
                  isLoading || !items.length
                    ? "pointer-events-none"
                    : "cursor-pointer"
                }`}
              >
                <span className={`text-[#767676] ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
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

            <div className={`${DICTIONARY_LIST_SCROLL_CLASS} ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-2`}>
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
                  <div key={group.key} className="flex flex-col min-w-0">
                    {groupedItems.length > 1 && (
                      <p className={`font-bold text-primary uppercase py-2 break-words ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}>
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
          <ModalFooter className={DICTIONARY_MODAL_FOOTER_CLASS}>
            <div className={DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS}>
              <Button
                variant="light"
                size="sm"
                className={DICTIONARY_TOUCH_BUTTON_CLASS}
                onClick={() => setSelectedIds([])}
                isDisabled={!selectedIds.length}
              >
                <T k="dictionary.resetSelection" defaultText="Сбросить" />
              </Button>
              <Popover
                isOpen={actionsPopoverOpen}
                onOpenChange={setActionsPopoverOpen}
                placement="top"
                offset={8}
              >
                <PopoverTrigger>
                  <Button
                    color="primary"
                    size="sm"
                    className={DICTIONARY_TOUCH_BUTTON_CLASS}
                    isDisabled={!selectedIds.length}
                  >
                    <T k="dictionary.actions" defaultText="Действия" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className={DICTIONARY_ACTIONS_POPOVER_CLASS}>
                  {activeTab === "unlearned" && (
                    <Button
                      variant="light"
                      size="sm"
                      className="justify-start touch-manipulation"
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
                      className="justify-start touch-manipulation"
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
                    className="w-full justify-start touch-manipulation"
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
