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
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { useVocabulary } from "../../hooks/useVocabulary";
import { useLanguages } from "../../hooks/useLanguages";
import { TVocabularyItem } from "../../types";
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
  const { items, isLoading, getVocabulary, updateLearned, deleteWords, translateWord, createWord } =
    useVocabulary(studentId);
  const { languages, getLanguages } = useLanguages();

  const [activeTab, setActiveTab] = useState<"unlearned" | "learned">(
    "unlearned"
  );
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [lessonFilterId, setLessonFilterId] = useState<number | undefined>(
    initialLessonId
  );
  const [actionsPopoverOpen, setActionsPopoverOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [newWordText, setNewWordText] = useState("");
  const [isAddingWord, setIsAddingWord] = useState(false);

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

  const loadVocabulary = useCallback(async () => {
    if (!studentId) {
      return;
    }

    await getVocabulary({
      search: search.trim() || undefined,
      isLearned: activeTab === "learned",
      lessonId: lessonFilterId,
    });
    setSelectedIds([]);
  }, [
    activeTab,
    getVocabulary,
    lessonFilterId,
    search,
    studentId,
  ]);

  useEffect(() => {
    if (isOpen) {
      getLanguages();
    }
  }, [getLanguages, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setLessonFilterId(initialLessonId);
      setActiveTab("unlearned");
      setSearch("");
      setSelectedIds([]);
      setNewWordText("");
    }
  }, [initialLessonId, isOpen]);

  useEffect(() => {
    if (!isOpen || !studentId) {
      return;
    }

    loadVocabulary();
  }, [isOpen, studentId, activeTab, lessonFilterId, loadVocabulary]);

  useEffect(() => {
    if (!isOpen || !studentId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      loadVocabulary();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [search]);

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
        toast(
          i18n.t(
            isLearned
              ? "vocabulary.markedAsLearned"
              : "vocabulary.markedAsUnlearned"
          ),
          { type: "success" }
        );
        await loadVocabulary();
      }
    },
    [loadVocabulary, selectedIds, updateLearned]
  );

  const handleDelete = useCallback(async () => {
    if (!selectedIds.length) {
      return;
    }

    const success = await deleteWords(selectedIds);

    if (success) {
      toast(i18n.t("vocabulary.wordsDeleted"), { type: "success" });
      await loadVocabulary();
    }
  }, [deleteWords, loadVocabulary, selectedIds]);

  const handleAddWord = useCallback(async () => {
    const sourceWord = newWordText.trim();

    if (!sourceWord) {
      return;
    }

    setIsAddingWord(true);

    try {
      const translation = await translateWord(sourceWord);
      if (!translation?.translatedWord) {
        return;
      }

      const created = await createWord({
        sourceWord,
        translatedWord: translation.translatedWord,
        lessonId: lessonFilterId,
      });

      if (created) {
        toast(i18n.t("vocabulary.wordAdded"), { type: "success" });
        setNewWordText("");
        await loadVocabulary();
      }
    } finally {
      setIsAddingWord(false);
    }
  }, [
    createWord,
    lessonFilterId,
    loadVocabulary,
    newWordText,
    translateWord,
  ]);

  return (
    <>
      <Modal
        size="3xl"
        isOpen={isOpen}
        onClose={onClose}
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <T k="vocabulary.title" defaultText="Словарь" />
          </ModalHeader>
          <ModalBody className="gap-4">
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => {
                setActiveTab(key as "unlearned" | "learned");
                setSelectedIds([]);
              }}
              color="primary"
              variant="underlined"
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

            <div className="flex flex-col gap-3">
              <Input
                value={search}
                onValueChange={setSearch}
                placeholder={i18n.t("vocabulary.searchPlaceholder")}
                size="lg"
                classNames={{ inputWrapper: "bg-white min-w-0" }}
                isDisabled={isLoading}
                startContent={
                  <Image
                    src={Loupe.src}
                    alt="search"
                    style={{ borderRadius: 0 }}
                  />
                }
              />
              <div className="flex flex-col xs:flex-row gap-2 w-full">
                <Input
                  value={newWordText}
                  onValueChange={setNewWordText}
                  placeholder={i18n.t("vocabulary.addWordPlaceholder")}
                  size="lg"
                  classNames={{ inputWrapper: "bg-white min-w-0 flex-1" }}
                  isDisabled={isAddingWord || isLoading}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddWord();
                    }
                  }}
                />
                <Button
                  color="primary"
                  size="lg"
                  className="shrink-0 w-full sm:w-auto"
                  isLoading={isAddingWord}
                  isDisabled={!newWordText.trim() || isLoading}
                  onClick={handleAddWord}
                >
                  <T k="common.add" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 flex-wrap py-1 border-y border-[#eee]">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <p className="text-sm text-[#767676]">
                  <T
                    k="vocabulary.wordsCount"
                    values={{ count: items.length }}
                    defaultText="Слов: {{count}}"
                  />
                </p>
                {selectedIds.length > 0 && (
                  <p className="text-sm text-primary font-medium">
                    <T
                      k="vocabulary.selectedCount"
                      values={{ count: selectedIds.length }}
                      defaultText="Выбрано: {{count}}"
                    />
                  </p>
                )}
              </div>
              <Checkbox
                isSelected={allSelected}
                onValueChange={toggleSelectAll}
                isDisabled={isLoading || !items.length}
              >
                <T k="vocabulary.selectAll" defaultText="Выбрать все" />
              </Checkbox>
            </div>

            {isLoading && (
              <div className="flex justify-center py-10">
                <Spinner color="primary" />
              </div>
            )}

            {!isLoading && !items.length && (
              <p className="text-center text-[#767676] py-10">
                <T k="vocabulary.empty" defaultText="Слов пока нет" />
              </p>
            )}

            {!isLoading &&
              groupedItems.map((group) => (
                <div key={group.key} className="flex flex-col gap-2">
                  <p className="text-sm font-bold text-primary uppercase">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-2">
                    {group.items.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                      <div
                        key={item.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                          isSelected
                            ? "bg-[#eeebff] border-primary/30"
                            : "bg-[#fafafa] border-[#eee]"
                        }`}
                      >
                        <Checkbox
                          isSelected={isSelected}
                          onValueChange={() => toggleItem(item.id)}
                          isDisabled={isLoading}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium break-words text-[#231F20]">
                            {item.sourceWord}
                          </p>
                          <p className="text-[#767676] break-words mt-1">
                            {item.translatedWord}
                          </p>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </div>
              ))}
          </ModalBody>
          <ModalFooter className="flex flex-wrap gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              {hasLessonContext && (
                <Button
                  variant="flat"
                  color={isLessonFilterActive ? "primary" : "default"}
                  onClick={() => {
                    if (isLessonFilterActive) {
                      setLessonFilterId(undefined);
                      return;
                    }
                    setLessonFilterId(initialLessonId);
                  }}
                >
                  {isLessonFilterActive ? (
                    <T
                      k="vocabulary.allWords"
                      defaultText="Все слова"
                    />
                  ) : (
                    <T
                      k="vocabulary.lessonWords"
                      defaultText="Слова урока"
                    />
                  )}
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
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
                  <Button
                    color="primary"
                    isDisabled={!selectedIds.length}
                  >
                    <T k="vocabulary.actions" defaultText="Действия" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-white p-2 items-start">
                  {activeTab === "unlearned" && (
                    <Button
                      variant="light"
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
                    color="danger"
                    className="justify-start"
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

      <DeleteVocabularyConfirmModal
        isVisible={deleteConfirmOpen}
        setIsVisible={setDeleteConfirmOpen}
        count={selectedIds.length}
        onConfirm={handleDelete}
      />
    </>
  );
};
