"use client";

import { fetchPostJson } from "@/api";
import { canUseAi } from "@/app/ai/canUseAi";
import {
  fetchAiLimits,
  formatAiAvailableLimit,
  handleAiLimitError,
} from "@/app/ai/aiLimits";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { ExerciseComponentPreview } from "@/app/editor/components/view/ExList";
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
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import AiIcon from "@/assets/icons/ai.svg";
import Image from "next/image";
import { getAiUiLanguage } from "@/app/ai/uiLanguage";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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

/** Keep media; backend slims for the model and restores images/videos after */
const prepareExerciseDataForAi = (raw: Record<string, any>) =>
  JSON.parse(
    JSON.stringify(raw || {}, (key, value) => {
      if (["id", "sortIndex"].includes(key)) {
        return undefined;
      }
      if (typeof value === "string" && value.length > 8000) {
        return value.slice(0, 8000) + "…";
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
  const [pendingData, setPendingData] = useState<Record<string, any> | null>(
    null,
  );
  const isCreate = !currentData?.id;
  const [messages, setMessages] = useState<TChatMessage[]>([]);
  const [limitRemaining, setLimitRemaining] = useState<number | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const latestDataRef = useRef<Record<string, any>>(currentData || {});

  useEffect(() => {
    latestDataRef.current = currentData || {};
  }, [currentData]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setInstruction("");
    setError(null);
    setPendingData(null);
    setLimitRemaining(null);
    setMessages([
      {
        id: makeId(),
        role: "assistant",
        content: i18n.t(
          isCreate ? "ai.welcomeExCreate" : "ai.welcomeExEdit",
          {
            defaultValue: isCreate
              ? "Привет! Опиши тему и что должно быть в задании — я заполню поля. Например: warm-up про travel для A2, 5 вопросов с вариантами."
              : "Привет! Я помогу отредактировать это задание. Например: упростить текст, добавить вопросы, поменять тон, переписать примеры.",
          },
        ),
      },
    ]);
    (async () => {
      const limits = await fetchAiLimits();
      if (cancelled) return;
      const remaining = limits?.refine_exercise?.remaining ?? null;
      setLimitRemaining(remaining);
      setMessages([
        {
          id: makeId(),
          role: "assistant",
          content: `${i18n.t(
            isCreate ? "ai.welcomeExCreate" : "ai.welcomeExEdit",
            {
              defaultValue: isCreate
                ? "Привет! Опиши тему и что должно быть в задании — я заполню поля. Например: warm-up про travel для A2, 5 вопросов с вариантами."
                : "Привет! Я помогу отредактировать это задание. Например: упростить текст, добавить вопросы, поменять тон, переписать примеры.",
            },
          )}\n\n${formatAiAvailableLimit(remaining)}`,
        },
      ]);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, isCreate]);

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
          currentData: prepareExerciseDataForAi(latestDataRef.current),
          lesson_id: lessonId ? Number(lessonId) : undefined,
          lessonContext,
          ui_language: getAiUiLanguage(),
          conversation: messages
            .slice(-8)
            .map((m) => ({ role: m.role, content: m.content })),
        },
      });
      const json = await res.json();
      if (!json?.success) {
        handleAiLimitError(json);
        const msg =
          json?.message ||
          i18n.t("ai.failedUpdateExercise", {
            defaultValue: "Не удалось обновить задание",
          });
        setError(msg);
        setMessages((prev) => [
          ...prev,
          { id: makeId(), role: "assistant", content: msg },
        ]);
        return;
      }

      if (typeof json?.aiLimit?.remaining === "number") {
        setLimitRemaining(json.aiLimit.remaining);
      }

      const assistantText =
        json.assistantMessage ||
        (json.refused
          ? i18n.t("ai.refusedExHelp", {
              defaultValue:
                "Я помогаю только с уроками и упражнениями. Напиши, что изменить в задании.",
            })
          : i18n.t("ai.doneUpdatedExercise", {
              defaultValue: "Готово — обновил задание.",
            }));

      const remaining =
        typeof json?.aiLimit?.remaining === "number"
          ? json.aiLimit.remaining
          : limitRemaining;

      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: `${assistantText}\n\n${formatAiAvailableLimit(remaining)}`,
        },
      ]);

      if (!json.refused && json.data && typeof json.data === "object") {
        setPendingData(json.data);
      }
    } catch (e) {
      setError(
        i18n.t("ai.networkError", { defaultValue: "Ошибка сети" }),
      );
      setMessages((prev) => [
        ...prev,
        {
          id: makeId(),
          role: "assistant",
          content: i18n.t("ai.networkErrorRetry", {
            defaultValue: "Ошибка сети. Попробуй ещё раз.",
          }),
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
    limitRemaining,
  ]);

  if (!canUseAi(profile)) {
    return null;
  }

  if (!AI_SUPPORTED_EX_TYPES.includes(type as any)) {
    return null;
  }

  return (
    <>
      <div className="mt-3">
        <ResponsiveTooltip
          content={
            isCreate ? (
              <T k="ai.createExWithAi" defaultText="Создать с помощью ИИ" />
            ) : (
              <T
                k="ai.editExWithAi"
                defaultText="Отредактировать с помощью ИИ"
              />
            )
          }
        >
          <Button
            variant="bordered"
            color="secondary"
            size="md"
            className="min-w-0 px-3 gap-1.5 font-semibold"
            aria-label={
              isCreate
                ? "Создать с помощью ИИ"
                : "Отредактировать с помощью ИИ"
            }
            onPress={() => {
              if (!requireAiSubscription()) return;
              setOpen(true);
            }}
            endContent={
              <Image src={AiIcon} alt="" width={16} height={16} />
            }
          >
            <T k="ai.exAssistant" defaultText="AI помощник" />
          </Button>
        </ResponsiveTooltip>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="5xl"
        scrollBehavior="inside"
        classNames={{
          wrapper:
            "items-center justify-center overflow-y-auto overscroll-none p-2 sm:p-3",
          base:
            "!max-h-[calc(100dvh-1rem)] !my-0 overflow-hidden",
          body: "p-0 !overflow-hidden min-h-0 flex-1",
          header: "shrink-0",
        }}
      >
        <ModalContent className="max-h-[calc(100dvh-1rem)] min-h-0 flex flex-col overflow-hidden">
          <ModalHeader className="flex flex-col gap-1 border-b border-default-100 shrink-0">
            {isCreate ? (
              <T k="ai.createExWithAi" defaultText="Создать с помощью ИИ" />
            ) : (
              <T
                k="ai.editExWithAi"
                defaultText="Отредактировать с помощью ИИ"
              />
            )}
            <p className="text-sm font-normal text-default-500">
              {isCreate ? (
                <T
                  k="ai.createExWithAiHint"
                  defaultText="Опиши тему и что должно быть в задании — AI заполнит поля"
                />
              ) : (
                <T
                  k="ai.editExWithAiHint"
                  defaultText="Чат по этому заданию — опиши правку, и поля обновятся"
                />
              )}
            </p>
          </ModalHeader>
          <ModalBody className="flex-1 min-h-0 overflow-hidden p-0 flex flex-col gap-0">
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 py-3 space-y-3">
              <div className="flex flex-col gap-3 py-1">
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

              {pendingData && (
                <div className="rounded-xl border border-secondary-200 bg-secondary-50/50 p-3 sm:p-4">
                  <p className="text-sm font-semibold">Превью нового варианта</p>
                  <p className="mt-1 text-xs text-default-500">
                    Так задание будет выглядеть после применения.
                  </p>
                  <div className="mt-3 rounded-xl border border-default-200 bg-content1 p-2 sm:p-4">
                    <div className="mx-auto max-w-4xl">
                      <ExerciseComponentPreview
                        type={type}
                        data={pendingData}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-default-100 px-6 py-3 space-y-3 bg-content1">
              <p className="text-xs text-default-500">
                {formatAiAvailableLimit(limitRemaining)}
              </p>
              {!pendingData && (
                <Textarea
                  minRows={2}
                  maxRows={4}
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
              )}
              {error && <p className="text-sm text-danger">{error}</p>}
              {pendingData ? (
                <div className="flex gap-2">
                  <Button
                    variant="flat"
                    className="flex-1"
                    onPress={() => setPendingData(null)}
                  >
                    Отменить
                  </Button>
                  <Button
                    color="primary"
                    className="flex-1"
                    onPress={() => {
                      latestDataRef.current = pendingData;
                      onApply(pendingData);
                      setPendingData(null);
                      setOpen(false);
                    }}
                  >
                    Применить
                  </Button>
                </div>
              ) : (
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  isDisabled={!instruction.trim()}
                  onPress={onSubmit}
                >
                  Отправить
                </Button>
              )}
              {!pendingData && (
                <p className="text-xs text-default-400 text-center">
                  ⌘/Ctrl + Enter — отправить
                </p>
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
