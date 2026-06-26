"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import i18n from "@/i18n/config";
import { DictionaryTab } from "../types";
import { groupByLanguagePair } from "../utils/groupByLanguagePair";
import { DICTIONARY_SEARCH_DEBOUNCE_MS } from "../constants";
import { useLanguages } from "./useLanguages";
import { useDictionary } from "./useDictionary";

type TParams = {
  isOpen: boolean;
  studentId: number;
  initialLessonId?: number;
};

export const useDictionaryModal = ({
  isOpen,
  studentId,
  initialLessonId,
}: TParams) => {
  const { items, isLoading, getDictionary, updateLearned, deleteWords } =
    useDictionary(studentId);
  const { languages, getLanguages } = useLanguages();

  const [activeTab, setActiveTab] = useState<DictionaryTab>("unlearned");
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

    return getDictionary({
      search: debouncedSearch.trim() || undefined,
      isLearned: activeTab === "learned",
      lessonId: lessonFilterId,
    });
  }, [activeTab, debouncedSearch, getDictionary, lessonFilterId, studentId]);

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
    }, DICTIONARY_SEARCH_DEBOUNCE_MS);

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
    setSelectedIds(allSelected ? [] : items.map((item) => item.id));
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
              ? "dictionary.markedAsLearned"
              : "dictionary.markedAsUnlearned"
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
      setSelectedIds([]);
      toast(i18n.t("dictionary.wordsDeleted"), { type: "success" });
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

  const setLessonWordFilterMode = useCallback(
    (mode: "all" | "lesson") => {
      setLessonFilterId(mode === "lesson" ? initialLessonId : undefined);
    },
    [initialLessonId]
  );

  const createWordLessonId = hasLessonContext ? initialLessonId : lessonFilterId;

  return {
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
    createWordLessonId,
  };
};
