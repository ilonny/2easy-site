"use client";

import { FC, useCallback, useEffect, useMemo, useState } from "react";
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
import VocabularyIcon from "@/assets/icons/vocabulary.svg";
import ArrowRightIcon from "@/assets/icons/arrow_right.svg";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useVocabulary } from "../../hooks/useVocabulary";
import { useLanguages } from "../../hooks/useLanguages";
import { TVocabularyItem } from "../../types";
import { AddWordModal } from "../AddWordModal";
import { DeleteVocabularyConfirmModal } from "../DeleteVocabularyConfirmModal";
import { toast } from "react-toastify";

type TProps = {
  isOpen: boolean;
  onClose: () => void;
  studentId: number;
  initialLessonId?: number;
};

const groupByLanguagePair = (
  items: TVocabularyItem[],
  getLanguageName: (code: string) => string
) => {
  const groups = new Map<string, TVocabularyItem[]>();

  for (const item of items) {
    const key = `${item.sourceLanguageCode}:${item.targetLanguageCode}`;
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key)!.push(item);
  }

  return Array.from(groups.entries()).map(([key, groupItems]) => {
    const [sourceCode, targetCode] = key.split(":");
    return {
      key,
      label: `${getLanguageName(sourceCode)} → ${getLanguageName(targetCode)}`,
      items: groupItems,
    };
  });
};

export const VocabularyModal: FC<TProps> = ({
  isOpen,
  onClose,
  studentId,
  initialLessonId,
}) => {
  const { items, isLoading, getVocabulary, updateLearned, deleteWords } =
    useVocabulary(studentId);
  const { languages, getLanguages } = useLanguages();

  const [activeTab, setActiveTab] = useState<"unlearned" | "learned">(
    "unlearned"
  );
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lessonFilterId, setLessonFilterId] = useState<number | undefined>(
    initialLessonId
  );
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newWordText, setNewWordText] = useState("");
  const [addWordModalOpen, setAddWordModalOpen] = useState(false);

  const hasLessonContext = !!initialLessonId;
  const isLessonFilterActive =
    hasLessonContext && lessonFilterId === initialLessonId;

  const getLanguageName = useCallback(
    (code: string) => {
      const language = languages.find((item) => item.code === code);
      return language?.nativeName || language?.name || code;
    },
    [languages]
  );

  const fetchList = useCallback(() => {
    if (!studentId) {
      return Promise.resolve();
    }

    return getVocabulary({
      search: debouncedSearch.trim() || undefined,
      isLearned: activeTab === "learned",
      lessonId: lessonFilterId,
    });
  }, [activeTab, debouncedSearch, getVocabulary, lessonFilterId, studentId]);

  useEffect(() => {
    if (!isOpen) {
      setActiveTab("unlearned");
      setSearchInput("");
      setDebouncedSearch("");
      setSelectedIds([]);
      setNewWordText("");
      setAddWordModalOpen(false);
      setLessonFilterId(undefined);
      return;
    }

    setLessonFilterId(initialLessonId);
    getLanguages();
  }, [getLanguages, initialLessonId, isOpen]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (!isOpen || !studentId) {
      return;
    }

    fetchList();
    setSelectedIds([]);
  }, [isOpen, studentId, activeTab, lessonFilterId, debouncedSearch, fetchList]);

  const groupedItems = useMemo(
    () => groupByLanguagePair(items, getLanguageName),
    [getLanguageName, items]
  );

  const allSelected =
    items.length > 0 && items.every((item) => selectedIds.includes(item.id));

  const toggleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(items.map((item) => item.id));
  }, [allSelected, items]);

  const toggleItem = useCallback((id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }, []);

  const handleMarkLearned = useCallback(
    async (isLearned: boolean) => {
      if (!selectedIds.length) {
        return;
      }

      const success = await updateLearned(selectedIds, isLearned);
      setActionsPopoverOpen(false);

      if (success) {
        setSelectedIds([]);
        toast(
          i18n.t(
            isLearned
              ? "vocabulary.markedAsLearned"
              : "vocabulary.markedAsUnlearned"
          ),
          { type: "success" }
        );
        await fetchList();
      }
    },
    [fetchList, selectedIds, updateLearned]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedIds.length) {
      return;
    }

    const success = await deleteWords(selectedIds);

    if (success) {
      toast(i18n.t("vocabulary.wordsDeleted"), { type: "success" });
      await fetchList();
    }
  }, [deleteWords, fetchList, selectedIds]);

  const openAddWordModal = useCallback(() => {
    if (!newWordText.trim()) {
      return;
    }

    setAddWordModalOpen(true);
  }, [newWordText]);

  const handleWordAdded = useCallback(async () => {
    setNewWordText("");
    await fetchList();
  }, [fetchList]);

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
            <T k="vocabulary.title" defaultText="Словарь" />
          </ModalHeader>
          <ModalBody className="gap-4 px-0 text-sm flex flex-col min-h-0 overflow-hidden">
            <div className="px-6 pt-2 shrink-0">
              <Tabs
                selectedKey={activeTab}
                onSelectionChange={(key) => {
                  setActiveTab(key as "unlearned" | "learned");
                }}
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
                  title={<T k="vocabulary.unlearnedTab" defaultText="Неизученные слова" />}
                />
                <Tab
                  key="learned"
                  title={<T k="vocabulary.learnedTab" defaultText="Изученные слова" />}
                />
              </Tabs>
            </div>

            <div className="px-6 pt-1 pb-4 border-b border-[#eee] shrink-0">
              <div className="flex items-center gap-3 w-full">
                <Input
                  value={newWordText}
                  onValueChange={setNewWordText}
                  placeholder={i18n.t("vocabulary.addWordPlaceholder")}
                  size="md"
                  classNames={{
                    base: "flex-1 min-w-0",
                    inputWrapper: "bg-white hove min-w-0",
                    input: "text-sm",
                  }}
                  startContent={
                    <Image
                      src={VocabularyIcon.src}
                      alt="vocabulary"
                      style={{ borderRadius: 0 }}
                    />
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newWordText.trim()) {
                      e.preventDefault();
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
                  placeholder={i18n.t("vocabulary.searchPlaceholder")}
                  size="md"
                  classNames={{
                    base: "w-full min-w-0",
                    inputWrapper: "bg-white hove min-w-0",
                    input: "text-sm",
                  }}
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
                    k="vocabulary.wordsCount"
                    values={{ count: items.length }}
                    defaultText="Всего слов {{count}}"
                  />
                </p>
                {selectedIds.length > 0 && (
                  <p className="text-primary font-medium whitespace-nowrap">
                    <T
                      k="vocabulary.selectedCount"
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
                onKeyDown={(e) => {
                  if (isLoading || !items.length) {
                    return;
                  }
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleSelectAll();
                  }
                }}
                className={`flex items-center gap-2 shrink-0 ${
                  isLoading || !items.length
                    ? "pointer-events-none"
                    : "cursor-pointer"
                }`}
              >
                <span className="text-[#767676]">
                  <T k="vocabulary.selectAll" defaultText="Выбрать все" />
                </span>
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    isSelected={allSelected}
                    onValueChange={toggleSelectAll}
                    isDisabled={isLoading || !items.length}
                    aria-label={i18n.t("vocabulary.selectAll")}
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-2 flex flex-col h-[300px] min-h-[300px] overflow-y-auto">
              {isLoading && (
                <div className="flex justify-center py-10">
                  <Spinner color="primary" />
                </div>
              )}

              {!isLoading && !items.length && (
                <p className="text-center text-[#767676] py-10 text-sm">
                  <T k="vocabulary.empty" defaultText="Слов пока нет" />
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
                      {group.items.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <div
                            key={item.id}
                            role="button"
                            tabIndex={isLoading ? -1 : 0}
                            onClick={() => {
                              if (!isLoading) {
                                toggleItem(item.id);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (isLoading) {
                                return;
                              }
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleItem(item.id);
                              }
                            }}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#eeebff] border-primary/30"
                                : "border-[#eee] bg-[#fafafa]"
                            } ${isLoading ? "pointer-events-none" : ""}`}
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-medium break-words text-[#231F20] text-sm">
                                {item.sourceWord}
                              </p>
                              <p className="text-[#767676] break-words mt-0.5 text-sm">
                                {item.translatedWord}
                              </p>
                            </div>
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                className="shrink-0"
                                isSelected={isSelected}
                                onValueChange={() => toggleItem(item.id)}
                                isDisabled={isLoading}
                                aria-label={item.sourceWord}
                              />
                            </div>
                          </div>
                        );
                      })}
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
                <T k="vocabulary.resetSelection" defaultText="Сбросить" />
              </Button>
              <Popover
                isOpen={actionsPopoverOpen}
                onOpenChange={setActionsPopoverOpen}
                placement="top"
              >
                <PopoverTrigger>
                  <Button color="primary" size="sm" isDisabled={!selectedIds.length}>
                    <T k="vocabulary.actions" defaultText="Действия" />
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
                        k="vocabulary.markLearned"
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
                        k="vocabulary.markUnlearned"
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
                onClick={() => {
                  if (isLessonFilterActive) {
                    setLessonFilterId(undefined);
                    return;
                  }
                  setLessonFilterId(initialLessonId);
                }}
              >
                {isLessonFilterActive ? (
                  <T k="vocabulary.allWords" defaultText="Все слова" />
                ) : (
                  <T k="vocabulary.lessonWords" defaultText="Слова урока" />
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

      <DeleteVocabularyConfirmModal
        isVisible={deleteConfirmOpen}
        setIsVisible={setDeleteConfirmOpen}
        count={selectedIds.length}
        onConfirm={handleDelete}
      />
    </>
  );
};
