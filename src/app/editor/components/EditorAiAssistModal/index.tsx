"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { TAiLessonDraft } from "@/app/lessons/components/CreateLessonWithAiModal/types";
import { canUseAi } from "@/app/ai/canUseAi";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";
import {
  cloneDraft,
  formatHistoryTime,
  isUndoInstruction,
  loadHistory,
  pushHistoryEntry,
  saveHistory,
  shortInstruction,
  TAiHistoryEntry,
} from "./aiHistory";

type TProps = {
  lessonId: number | string;
  lesson?: {
    title?: string;
    description?: string;
    tags?: string;
  } | null;
  exList: Array<{
    type?: string;
    sortIndex?: number;
    data?: Record<string, any>;
  }>;
  onApplied: () => void;
  canEdit: boolean;
};

type TChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME =
  "Привет! Я AI-помощник по этому уроку. Напиши, что изменить: добавить задание, упростить язык, переписать warm-up, заменить тест и т.д.\n\nЕсли правка неудачная — нажми «Отменить последнюю правку» или напиши «верни обратно».";

/** Keep media; only truncate huge strings so the request stays reasonable */
const prepareExerciseDataForAi = (raw: Record<string, any>) =>
  JSON.parse(
    JSON.stringify(raw, (_key, value) => {
      if (typeof value === "string" && value.length > 8000) {
        return value.slice(0, 8000) + "…";
      }
      return value;
    }),
  );

/** Drop media blobs from refine request — server restores from DB on apply */
const stripMediaForRefineRequest = (draft: TAiLessonDraft): TAiLessonDraft =>
  JSON.parse(
    JSON.stringify(draft, (key, value) => {
      if (
        [
          "bgAttachments",
          "editorAttachments",
          "secondEditorAttachments",
          "attachments",
          "images",
          "videos",
          "editorImages",
          "dataURL",
        ].includes(key)
      ) {
        return Array.isArray(value) ? [] : undefined;
      }
      return value;
    }),
  );

export const EditorAiAssistModal: FC<TProps> = ({
  lessonId,
  lesson,
  exList,
  onApplied,
  canEdit,
}) => {
  const { profile } = useContext(AuthContext);
  const { requireAiSubscription } = useCheckSubscription();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TChatMessage[]>([
    { id: makeId(), role: "assistant", content: WELCOME },
  ]);
  const [history, setHistory] = useState<TAiHistoryEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const draftRef = useRef<TAiLessonDraft | null>(null);

  useEffect(() => {
    setHistory(loadHistory(lessonId));
  }, [lessonId]);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, open, showHistory]);

  const currentDraft: TAiLessonDraft = useMemo(
    () => ({
      assistantMessage: "",
      lesson: {
        title: lesson?.title || "",
        description: lesson?.description || "",
        tags: lesson?.tags || "",
      },
      exercises: (exList || []).map((ex, index) => {
        const raw = (ex.data || {}) as Record<string, any>;
        return {
          type: String(ex.type || "text-default"),
          sortIndex:
            Number.isInteger(ex.sortIndex) && (ex.sortIndex as number) >= 0
              ? (ex.sortIndex as number)
              : index,
          data: prepareExerciseDataForAi(raw),
        };
      }),
    }),
    [lesson, exList],
  );

  useEffect(() => {
    draftRef.current = currentDraft;
  }, [currentDraft]);

  const applyDraft = useCallback(
    async (draft: TAiLessonDraft, updateMeta = true) => {
      const applyRes = await fetchPostJson({
        path: "/ai/apply-lesson",
        isSecure: true,
        data: {
          lesson_id: Number(lessonId),
          draft: {
            assistantMessage: draft.assistantMessage || "",
            lesson: draft.lesson,
            exercises: draft.exercises,
          },
          updateMeta,
        },
      });
      const applied = await applyRes.json();
      if (!applied?.success) {
        checkResponse(applied);
        throw new Error(applied?.message || "Не удалось применить правки");
      }
      onApplied();
    },
    [lessonId, onApplied],
  );

  const restoreEntry = useCallback(
    async (entry: TAiHistoryEntry, opts?: { removeFromHistory?: boolean }) => {
      setIsLoading(true);
      setError(null);
      try {
        await applyDraft(cloneDraft(entry.draft), true);
        if (opts?.removeFromHistory !== false) {
          // Drop this entry and newer ones above it (we're restoring to this point)
          setHistory((prev) => {
            const idx = prev.findIndex((e) => e.id === entry.id);
            if (idx < 0) return prev;
            const next = prev.slice(idx + 1);
            saveHistory(lessonId, next);
            return next;
          });
        }
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "assistant",
            content: `Вернула урок к состоянию до правки «${shortInstruction(entry.instruction)}» (${formatHistoryTime(entry.at)}).`,
          },
        ]);
        setShowHistory(false);
      } catch (e: any) {
        const msg = e?.message || "Не удалось откатить правку";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: msg },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [applyDraft, lessonId],
  );

  const undoLast = useCallback(async () => {
    const last = history[0];
    if (!last || isLoading) return;
    setMessages((prev) => [
      ...prev,
      {
        id: makeId(),
        role: "user",
        content: "Отменить последнюю правку AI",
      },
    ]);
    await restoreEntry(last);
  }, [history, isLoading, restoreEntry]);

  const onSubmit = useCallback(async () => {
    if (!instruction.trim() || isLoading) return;
    const text = instruction.trim();
    setInstruction("");
    setIsLoading(true);
    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "user", content: text },
    ]);

    try {
      // Undo via chat — restore last snapshot, don't call the model
      if (isUndoInstruction(text)) {
        const last = history[0];
        if (!last) {
          setMessages((prev) => [
            ...prev,
            {
              id: makeId(),
              role: "assistant",
              content:
                "Пока нечего откатывать — истории правок AI для этого урока нет. Сначала внеси правку через чат.",
            },
          ]);
          return;
        }
        await restoreEntry(last);
        return;
      }

      const snapshotBefore = cloneDraft(draftRef.current || currentDraft);

      const refineRes = await fetchPostJson({
        path: "/ai/refine-lesson",
        isSecure: true,
        data: {
          instruction: text,
          lesson_id: Number(lessonId) || undefined,
          current: stripMediaForRefineRequest(snapshotBefore),
          conversation: messages
            .slice(-6)
            .map((m) => ({
              role: m.role,
              content: String(m.content || "").slice(0, 400),
            })),
        },
      });
      const refined = await refineRes.json();
      if (!refined?.success) {
        checkResponse(refined);
        const msg = refined?.message || "Не удалось получить правки от AI";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: msg },
        ]);
        return;
      }

      // Save state BEFORE apply so we can roll back
      setHistory((prev) =>
        pushHistoryEntry(lessonId, prev, {
          instruction: text,
          draft: snapshotBefore,
        }),
      );

      try {
        await applyDraft(
          {
            assistantMessage: refined.assistantMessage,
            lesson: refined.lesson,
            exercises: refined.exercises || [],
          },
          /заголовок|назван|title|description|описан|тег|\btags\b|переимен|уровен|level|A1|A2|B1|B2|C1/i.test(
            text,
          ),
        );
      } catch (applyErr: any) {
        // Apply failed — drop the history entry we just pushed
        setHistory((prev) => {
          const next = prev.slice(1);
          saveHistory(lessonId, next);
          return next;
        });
        throw applyErr;
      }

      const beforeCount = snapshotBefore.exercises.length;
      const afterCount = Array.isArray(refined.exercises)
        ? refined.exercises.length
        : beforeCount;
      let assistantText =
        refined.assistantMessage ||
        "Готово — обновила урок. Если что-то не так — нажми «Отменить последнюю правку».";
      if (
        /добав|add\b|создай.*задан/i.test(text) &&
        afterCount <= beforeCount
      ) {
        assistantText +=
          "\n\n⚠️ Количество заданий не увеличилось — попробуй сформулировать точнее, например: «добавь match-word-word с 6 парами слово–определение».";
      } else if (afterCount > beforeCount) {
        assistantText += `\n\n(+${afterCount - beforeCount} задание, сейчас ${afterCount})`;
      }
      assistantText +=
        "\n\n↩️ Можно откатить: кнопка «Отменить последнюю правку» или напиши «верни обратно».";

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: assistantText,
        },
      ]);
    } catch (e: any) {
      const msg = e?.message || "Ошибка сети";
      setError(msg);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: msg === "Ошибка сети" ? "Ошибка сети. Попробуй ещё раз." : msg,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [
    instruction,
    isLoading,
    currentDraft,
    lessonId,
    messages,
    history,
    restoreEntry,
    applyDraft,
  ]);

  if (!canEdit || !canUseAi(profile)) return null;

  return (
    <>
      <div className="hidden">
        <Button
          color="secondary"
          size="lg"
          radius="full"
          className="shadow-lg"
          onPress={() => {
            if (!requireAiSubscription()) return;
            setOpen(true);
          }}
        >
          <T k="ai.editorAssist" defaultText="AI-помощник" />
        </Button>
      </div>
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{
          base: "max-h-[90dvh]",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-default-100">
            <T k="ai.editorAssistTitle" defaultText="AI-помощник по уроку" />
            <p className="text-sm font-normal text-default-500">
              {lesson?.title
                ? `«${lesson.title}»`
                : i18n.t("ai.editorAssistHint", {
                    defaultValue:
                      "Опиши правку — AI обновит задания урока",
                  })}
            </p>
          </ModalHeader>
          <ModalBody className="pb-6 gap-3">
            {history.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <Button
                  size="sm"
                  variant="flat"
                  color="warning"
                  isDisabled={isLoading}
                  onPress={undoLast}
                >
                  ↩️ Отменить последнюю правку
                </Button>
                <Button
                  size="sm"
                  variant="light"
                  isDisabled={isLoading}
                  onPress={() => setShowHistory((v) => !v)}
                >
                  {showHistory
                    ? "Скрыть историю"
                    : `История (${history.length})`}
                </Button>
              </div>
            )}

            {showHistory && history.length > 0 && (
              <div className="rounded-xl border border-default-200 bg-default-50 p-2 max-h-[28vh] overflow-y-auto flex flex-col gap-1.5">
                <p className="text-xs text-default-500 px-1 pb-1">
                  Состояния до правок AI — можно вернуться к любому
                </p>
                {history.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-start justify-between gap-2 rounded-lg bg-content1 px-2.5 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">
                        {index === 0 ? "Последняя: " : ""}
                        {shortInstruction(entry.instruction)}
                      </p>
                      <p className="text-xs text-default-400">
                        {formatHistoryTime(entry.at)} ·{" "}
                        {entry.draft.exercises?.length || 0} заданий
                      </p>
                    </div>
                    <Button
                      size="sm"
                      color="secondary"
                      variant="flat"
                      isDisabled={isLoading}
                      onPress={() => restoreEntry(entry)}
                    >
                      Вернуть
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3 max-h-[40vh] overflow-y-auto py-1">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm whitespace-pre-wrap ${
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-default-100 text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-default-500">
                  <Spinner size="sm" />
                  <T k="ai.thinking" defaultText="AI думает…" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <Textarea
              minRows={3}
              value={instruction}
              onValueChange={setInstruction}
              placeholder={i18n.t("ai.refinePlaceholder", {
                defaultValue:
                  "Например: добавь ещё один тест / сделай проще для A2 / верни обратно",
              })}
              isDisabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  onSubmit();
                }
              }}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              color="primary"
              className="w-full"
              isLoading={isLoading}
              isDisabled={!instruction.trim()}
              onPress={onSubmit}
            >
              <T k="ai.applyChanges" defaultText="Отправить правку AI" />
            </Button>
            <p className="text-xs text-default-400 text-center">
              ⌘/Ctrl + Enter — отправить
            </p>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
