"use client";

import { FC } from "react";
import {
  Button,
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
  Textarea,
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
  DICTIONARY_MODAL_INPUT_ROW_START_CLASS,
  DICTIONARY_MODAL_INPUTS_BLOCK_CLASS,
  DICTIONARY_MODAL_TEXTAREA_CLASS_NAMES,
  DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_TEXTAREA_ICON_ALIGN_CLASS,
  DICTIONARY_TEXTAREA_MAX_ROWS,
  DICTIONARY_MODAL_TABS_CLASS_NAMES,
  DICTIONARY_SEARCH_INPUT_CLASS_NAMES,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";
import { AddWordModal } from "../AddWordModal";
import { DeleteDictionaryConfirmModal } from "../DeleteDictionaryConfirmModal";
import { DictionaryWordFilterSegment } from "../DictionaryWordFilterSegment";
import { DictionarySelectionToolbar } from "../DictionarySelectionToolbar";
import { DictionaryWordCard } from "./DictionaryWordCard";
import { TrainingPanel } from "../TrainingPanel";

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
    createWordLessonId,
  } = useDictionaryModal({ isOpen, studentId, initialLessonId });

  const isTrainingTab = activeTab === "training";

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
                <Tab
                  key="training"
                  title={
                    <T
                      k="dictionary.trainingTab"
                      defaultText="Тренировка слов"
                    />
                  }
                />
              </Tabs>
            </div>

            {isTrainingTab ? (
              <div
                className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} flex flex-col flex-1 min-h-0 pb-2`}
              >
                <TrainingPanel
                  key={`${studentId}-${isOpen ? "open" : "closed"}`}
                  items={items}
                  isLoading={isLoading}
                />
              </div>
            ) : (
              <>
                <div
                  className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} ${DICTIONARY_MODAL_INPUTS_BLOCK_CLASS}`}
                >
                  <div className={DICTIONARY_MODAL_INPUT_ROW_START_CLASS}>
                    <Textarea
                      value={newWordText}
                      onValueChange={setNewWordText}
                      placeholder={i18n.t("dictionary.addWordPlaceholder")}
                      size="md"
                      minRows={1}
                      maxRows={DICTIONARY_TEXTAREA_MAX_ROWS}
                      classNames={DICTIONARY_MODAL_TEXTAREA_CLASS_NAMES}
                      startContent={
                        <DictionaryIcon
                          size={20}
                          className={`text-[#C4C4C4] ${DICTIONARY_TEXTAREA_ICON_ALIGN_CLASS}`}
                        />
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key === "Enter" &&
                          !event.shiftKey &&
                          newWordText.trim()
                        ) {
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
                        alt={i18n.t("dictionary.addWordAlt")}
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
                          alt={i18n.t("dictionary.searchAlt")}
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

                <DictionarySelectionToolbar
                  className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} py-1`}
                  totalCount={items.length}
                  selectedCount={selectedIds.length}
                  allSelected={allSelected}
                  isDisabled={isLoading}
                  onToggleAll={toggleSelectAll}
                />

                <div
                  className={`${DICTIONARY_LIST_SCROLL_CLASS} ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-2`}
                >
                  {isLoading && (
                    <div className="flex justify-center py-10">
                      <Spinner color="primary" />
                    </div>
                  )}

                  {!isLoading && !items.length && (
                    <p className="text-center text-[#767676] py-10 text-base">
                      <T k="dictionary.empty" defaultText="Слов пока нет" />
                    </p>
                  )}

                  {!isLoading &&
                    groupedItems.map((group) => (
                      <div key={group.key} className="flex flex-col min-w-0">
                        {groupedItems.length > 1 && (
                          <p
                            className={`font-bold text-primary uppercase py-2 break-words ${DICTIONARY_MODAL_RESPONSIVE_TEXT_CLASS}`}
                          >
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
                              showLessonBadge={!isLessonFilterActive}
                              onToggle={toggleItem}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </ModalBody>
          {!isTrainingTab && (
            <ModalFooter className={DICTIONARY_MODAL_FOOTER_CLASS}>
              <div className={DICTIONARY_MODAL_FOOTER_ACTIONS_CLASS}>
                <Button
                  variant="light"
                  size="md"
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
                      size="md"
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
                        size="md"
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
                        size="md"
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
                      size="md"
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
          )}
        </ModalContent>
      </Modal>

      <AddWordModal
        isVisible={addWordModalOpen}
        setIsVisible={setAddWordModalOpen}
        studentId={studentId}
        sourceWord={newWordText.trim()}
        lessonId={createWordLessonId}
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
