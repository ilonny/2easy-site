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
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TAiLessonDraft } from "@/app/lessons/components/CreateLessonWithAiModal/types";
import { canUseAi } from "@/app/ai/canUseAi";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";

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
  "Привет! Я AI-помощник по этому уроку. Напиши, что изменить: добавить задание, упростить язык, переписать warm-up, заменить тест и т.д.";

const slimExerciseData = (raw: Record<string, any>) =>
  JSON.parse(
    JSON.stringify(raw, (key, value) => {
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
          "path",
        ].includes(key)
      ) {
        return Array.isArray(value) ? [] : undefined;
      }
      if (typeof value === "string" && value.length > 2500) {
        return value.slice(0, 2500) + "…";
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
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, open]);

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
          data: slimExerciseData(raw),
        };
      }),
    }),
    [lesson, exList],
  );

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
      const refineRes = await fetchPostJson({
        path: "/ai/refine-lesson",
        isSecure: true,
        data: {
          instruction: text,
          lesson_id: Number(lessonId) || undefined,
          current: currentDraft,
          conversation: messages
            .slice(-10)
            .map((m) => ({ role: m.role, content: m.content })),
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

      const applyRes = await fetchPostJson({
        path: "/ai/apply-lesson",
        isSecure: true,
        data: {
          lesson_id: Number(lessonId),
          draft: {
            assistantMessage: refined.assistantMessage,
            lesson: refined.lesson,
            exercises: refined.exercises,
          },
          updateMeta: true,
        },
      });
      const applied = await applyRes.json();
      if (!applied?.success) {
        checkResponse(applied);
        const msg = applied?.message || "Не удалось применить правки";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: msg },
        ]);
        return;
      }

      const beforeCount = currentDraft.exercises.length;
      const afterCount = Array.isArray(refined.exercises)
        ? refined.exercises.length
        : beforeCount;
      let assistantText =
        refined.assistantMessage ||
        "Готово — обновил урок. Можешь проверить задания и написать следующую правку.";
      if (
        /добав|add\b|создай.*задан/i.test(text) &&
        afterCount <= beforeCount
      ) {
        assistantText +=
          "\n\n⚠️ Количество заданий не увеличилось — попробуй сформулировать точнее, например: «добавь match-word-word с 6 парами слово–определение».";
      } else if (afterCount > beforeCount) {
        assistantText += `\n\n(+${afterCount - beforeCount} задание, сейчас ${afterCount})`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: assistantText,
        },
      ]);
      onApplied();
    } catch (e) {
      setError("Ошибка сети");
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: "Ошибка сети. Попробуй ещё раз.",
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
    onApplied,
    messages,
  ]);

  if (!canEdit || !canUseAi(profile)) return null;

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
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
            <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto py-1">
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
                  "Например: добавь ещё один тест / сделай проще для A2 / перепиши warm-up",
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
