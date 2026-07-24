"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { canUseAi } from "@/app/ai/canUseAi";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { AuthContext } from "@/auth";
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
import { FC, useCallback, useContext, useEffect, useRef, useState } from "react";

export const AI_SUPPORTED_EX_TYPES = [
  "text-default",
  "text-2-col",
  "text-sticker",
  "text-checklist",
  "note",
  "FILL_GAPS_NEW",
  "test",
  "match-word-word",
  "match-word-column",
  "free-input-form",
] as const;

type TChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type TProps = {
  type: string;
  /** Current exercise fields from the editor (without id/sortIndex if preferred) */
  currentData?: Record<string, any> | null;
  onApply: (data: Record<string, any>) => void;
  lessonContext?: {
    title?: string;
    description?: string;
    tags?: string;
  };
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME =
  "Привет! Я помогу отредактировать это задание. Напиши, что изменить: упростить текст, добавить вопросы, поменять тон, переписать примеры и т.д.\n\nЯ отвечаю только про уроки и упражнения 2easy.";

const slimExerciseData = (raw: Record<string, any>) =>
  JSON.parse(
    JSON.stringify(raw || {}, (key, value) => {
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
          "id",
          "sortIndex",
        ].includes(key)
      ) {
        return Array.isArray(value) ? [] : undefined;
      }
      if (typeof value === "string" && value.length > 2000) {
        return value.slice(0, 2000) + "…";
      }
      return value;
    }),
  );

export const CreateExWithAiButton: FC<TProps> = ({
  type,
  currentData,
  onApply,
  lessonContext,
}) => {
  const { profile } = useContext(AuthContext);
  const { requireAiSubscription } = useCheckSubscription();
  const lessonId = useEditorLessonId();
  const [open, setOpen] = useState(false);
  const [instruction, setInstruction] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<TChatMessage[]>([
    { id: makeId(), role: "assistant", content: WELCOME },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const latestDataRef = useRef<Record<string, any>>(currentData || {});

  useEffect(() => {
    latestDataRef.current = currentData || {};
  }, [currentData]);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, open]);

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
      const res = await fetchPostJson({
        path: "/ai/refine-exercise",
        isSecure: true,
        data: {
          type,
          instruction: text,
          currentData: slimExerciseData(latestDataRef.current),
          lesson_id: lessonId ? Number(lessonId) : undefined,
          lessonContext,
          conversation: messages
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      const json = await res.json();
      if (!json?.success) {
        checkResponse(json);
        const msg = json?.message || "Не удалось обновить задание";
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: msg },
        ]);
        return;
      }

      const assistantText =
        json.assistantMessage ||
        (json.refused
          ? "Я помогаю только с уроками и упражнениями. Напиши, что изменить в задании."
          : "Готово — обновил задание.");

      setMessages((prev) => [
        ...prev,
        { id: makeId(), role: "assistant", content: assistantText },
      ]);

      if (!json.refused && json.data && typeof json.data === "object") {
        latestDataRef.current = json.data;
        onApply(json.data);
      }
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
    type,
    lessonId,
    lessonContext,
    messages,
    onApply,
  ]);

  if (!canUseAi(profile)) {
    return null;
  }

  if (!AI_SUPPORTED_EX_TYPES.includes(type as any)) {
    return null;
  }

  return (
    <>
      <div className="flex justify-center mt-3">
        <Button
          variant="bordered"
          color="secondary"
          className="w-full max-w-[310px] min-w-0 lg:min-w-[310px]"
          size="lg"
          onPress={() => {
            if (!requireAiSubscription()) return;
            setOpen(true);
          }}
        >
          <T k="ai.editExWithAi" defaultText="Отредактировать с помощью ИИ" />
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="2xl"
        scrollBehavior="inside"
        classNames={{ base: "max-h-[90dvh]" }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 border-b border-default-100">
            <T k="ai.editExWithAi" defaultText="Отредактировать с помощью ИИ" />
            <p className="text-sm font-normal text-default-500">
              <T
                k="ai.editExWithAiHint"
                defaultText="Чат по этому заданию — опиши правку, и поля обновятся"
              />
            </p>
          </ModalHeader>
          <ModalBody className="pb-6 gap-3">
            <div className="flex flex-col gap-3 max-h-[45vh] overflow-y-auto overscroll-contain py-1">
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
              placeholder={i18n.t("ai.editExPlaceholder", {
                defaultValue:
                  "Например: сделай проще для A2 / добавь 2 вопроса / перепиши примеры",
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
              size="lg"
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
