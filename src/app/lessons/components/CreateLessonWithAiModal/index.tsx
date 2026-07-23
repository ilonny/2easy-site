"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { TCourse } from "@/app/course/hooks/useCourses";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  Button,
  Chip,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Spinner,
  Textarea,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AI_EXERCISE_TYPE_OPTIONS,
  AI_LEVELS,
  getExerciseTypeLabel,
  toCapitalizeLabel,
  TAiChatMessage,
  TAiLessonDraft,
  TAiLevel,
} from "./types";
import { AiLessonConstructorPreview } from "./AiLessonConstructorPreview";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: (createdLessonId: number) => void;
  currentCourse?: TCourse;
};

type TStep = "collect" | "confirmTopic" | "preview";

type TSuggestedTopic = {
  topic: string;
  title: string;
  description: string;
  tags: string;
  assistantMessage: string;
};

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const WELCOME_MESSAGE =
  "Привет! Давай соберём урок в стиле 2easy. Выбери уровень и типы заданий. Тему можно не указывать — я придумаю сам и спрошу, подходит ли она.";

export const CreateLessonWithAiModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  currentCourse,
}) => {
  const [step, setStep] = useState<TStep>("collect");
  const [level, setLevel] = useState<TAiLevel | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    "text-default",
    "FILL_GAPS_NEW",
    "test",
    "free-input-form",
  ]);
  const [topic, setTopic] = useState("");
  const [description, setDescription] = useState("");
  const [messages, setMessages] = useState<TAiChatMessage[]>([
    { id: makeId(), role: "assistant", content: WELCOME_MESSAGE },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [draft, setDraft] = useState<TAiLessonDraft | null>(null);
  const [savedLessonId, setSavedLessonId] = useState<number | null>(null);
  const [previewReloadKey, setPreviewReloadKey] = useState(0);
  const [suggestedTopic, setSuggestedTopic] = useState<TSuggestedTopic | null>(
    null,
  );
  const [rejectedTopics, setRejectedTopics] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const resetState = useCallback(() => {
    setStep("collect");
    setLevel(null);
    setSelectedTypes([
      "text-default",
      "FILL_GAPS_NEW",
      "test",
      "free-input-form",
    ]);
    setTopic("");
    setDescription("");
    setMessages([
      { id: makeId(), role: "assistant", content: WELCOME_MESSAGE },
    ]);
    setChatInput("");
    setDraft(null);
    setSavedLessonId(null);
    setPreviewReloadKey(0);
    setSuggestedTopic(null);
    setRejectedTopics([]);
    setIsGenerating(false);
    setError(null);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    resetState();
  }, [isVisible, resetState]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating, draft, suggestedTopic]);

  const canGenerate = useMemo(
    () => Boolean(level && selectedTypes.length > 0),
    [level, selectedTypes],
  );

  const toggleType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const appendAssistant = (content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role: "assistant", content },
    ]);
  };

  const appendUser = (content: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role: "user", content }]);
  };

  const conversationPayload = (list: TAiChatMessage[]) =>
    list
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-12)
      .map((m) => ({ role: m.role, content: m.content }));

  const runGenerateLesson = useCallback(
    async (topicToUse: string) => {
      if (!level) return;
      setError(null);
      setIsGenerating(true);
      appendAssistant("Генерирую урок… это может занять минуту.");

      try {
        const res = await fetchPostJson({
          path: "/ai/generate-lesson",
          isSecure: true,
          data: {
            level,
            topic: topicToUse.trim(),
            description: description.trim(),
            exerciseTypes: selectedTypes,
            conversation: conversationPayload(messages),
          },
        });
        const json = await res.json();
        if (!json?.success) {
          checkResponse(json);
          setError(json?.message || "Не удалось сгенерировать урок");
          appendAssistant(
            json?.message ||
              "Не получилось сгенерировать урок. Попробуй ещё раз или упрости запрос.",
          );
          return;
        }

        const nextDraft: TAiLessonDraft = {
          assistantMessage: json.assistantMessage,
          lesson: json.lesson,
          exercises: json.exercises || [],
        };

        appendAssistant("Сохраняю черновик, чтобы открыть полноценный конструктор…");
        const saveRes = await fetchPostJson({
          path: "/ai/save-lesson",
          isSecure: true,
          data: {
            draft: nextDraft,
            course_id: currentCourse?.id,
          },
        });
        const saved = await saveRes.json();
        if (!saved?.success) {
          checkResponse(saved);
          setError(saved?.message || "Не удалось сохранить урок");
          appendAssistant(
            saved?.message ||
              "Урок сгенерирован, но сохранить не удалось. Попробуй ещё раз.",
          );
          setDraft(nextDraft);
          return;
        }

        const lessonId = Number(
          saved.id ??
            saved.createdLesson?.id ??
            saved.createdLesson?.dataValues?.id,
        );
        if (!lessonId) {
          setError("Не удалось получить id урока");
          appendAssistant(
            "Урок сохранился странно — обнови страницу и открой последний созданный урок, либо попробуй ещё раз.",
          );
          return;
        }

        window?.ym?.(103955671, "reachGoal", "lesson-create");
        setDraft(nextDraft);
        setSavedLessonId(Number(lessonId));
        setTopic(topicToUse.trim() || json.lesson?.title || "");
        setStep("preview");
        setPreviewReloadKey((k) => k + 1);
        appendAssistant(
          json.assistantMessage ||
            `Готово: «${json.lesson?.title}». Справа полный конструктор — правь вручную или через чат.`,
        );
      } catch (e) {
        setError("Ошибка сети при генерации урока");
        appendAssistant("Ошибка сети. Проверь соединение и попробуй снова.");
      } finally {
        setIsGenerating(false);
      }
    },
    [level, description, selectedTypes, messages, currentCourse?.id],
  );

  const runSuggestTopic = useCallback(
    async (rejectList: string[]) => {
      if (!level) return;
      setError(null);
      setIsGenerating(true);
      appendAssistant("Тему не указали — сейчас придумаю и спрошу, ок ли она.");

      try {
        const res = await fetchPostJson({
          path: "/ai/suggest-topic",
          isSecure: true,
          data: {
            level,
            description: description.trim(),
            exerciseTypes: selectedTypes,
            rejectTopics: rejectList,
          },
        });
        const json = await res.json();
        if (!json?.success) {
          checkResponse(json);
          setError(json?.message || "Не удалось придумать тему");
          appendAssistant(
            json?.message || "Не получилось придумать тему. Попробуй ещё раз.",
          );
          return;
        }

        const suggestion: TSuggestedTopic = {
          topic: json.topic || json.title,
          title: json.title || json.topic,
          description: json.description || "",
          tags: json.tags || level,
          assistantMessage: json.assistantMessage,
        };
        setSuggestedTopic(suggestion);
        setStep("confirmTopic");
        appendAssistant(
          json.assistantMessage ||
            `Я придумал тему «${suggestion.title}». Подходит?`,
        );
      } catch (e) {
        setError("Ошибка сети при подборе темы");
        appendAssistant("Ошибка сети. Проверь соединение и попробуй снова.");
      } finally {
        setIsGenerating(false);
      }
    },
    [level, description, selectedTypes],
  );

  const handleGenerate = useCallback(async () => {
    if (!canGenerate || !level) return;

    const summary = [
      `Уровень: ${level}`,
      topic.trim() ? `Тема: ${topic.trim()}` : "Тема: (придумай сам)",
      description.trim() ? `Описание: ${description.trim()}` : "",
      `Задания: ${selectedTypes.map(getExerciseTypeLabel).join(", ")}`,
    ]
      .filter(Boolean)
      .join("\n");

    appendUser(summary);

    if (!topic.trim()) {
      await runSuggestTopic(rejectedTopics);
      return;
    }

    await runGenerateLesson(topic.trim());
  }, [
    canGenerate,
    level,
    topic,
    description,
    selectedTypes,
    rejectedTopics,
    runSuggestTopic,
    runGenerateLesson,
  ]);

  const handleAcceptTopic = useCallback(async () => {
    if (!suggestedTopic) return;
    appendUser("Да, тема подходит");
    const topicToUse = suggestedTopic.title || suggestedTopic.topic;
    setTopic(topicToUse);
    await runGenerateLesson(topicToUse);
  }, [suggestedTopic, runGenerateLesson]);

  const handleRejectTopic = useCallback(async () => {
    if (!suggestedTopic) return;
    const rejected = [
      ...rejectedTopics,
      suggestedTopic.title,
      suggestedTopic.topic,
    ].filter(Boolean);
    setRejectedTopics(rejected);
    appendUser("Нет, придумай другую тему");
    setSuggestedTopic(null);
    await runSuggestTopic(rejected);
  }, [suggestedTopic, rejectedTopics, runSuggestTopic]);

  const handleRefine = useCallback(async () => {
    if (!draft || !chatInput.trim() || isGenerating) return;
    const instruction = chatInput.trim();
    setChatInput("");
    setError(null);
    setIsGenerating(true);
    appendUser(instruction);

    try {
      const res = await fetchPostJson({
        path: "/ai/refine-lesson",
        isSecure: true,
        data: {
          instruction,
          lesson_id: savedLessonId || undefined,
          current: draft,
          conversation: conversationPayload(messages),
        },
      });
      const json = await res.json();
      if (!json?.success) {
        checkResponse(json);
        setError(json?.message || "Не удалось обновить урок");
        appendAssistant(
          json?.message || "Не получилось внести правки. Попробуй ещё раз.",
        );
        return;
      }
      const nextDraft: TAiLessonDraft = {
        assistantMessage: json.assistantMessage,
        lesson: json.lesson,
        exercises: json.exercises || [],
      };
      setDraft(nextDraft);

      if (savedLessonId) {
        const applyRes = await fetchPostJson({
          path: "/ai/apply-lesson",
          isSecure: true,
          data: {
            lesson_id: savedLessonId,
            draft: nextDraft,
            updateMeta: true,
          },
        });
        const applied = await applyRes.json();
        if (!applied?.success) {
          checkResponse(applied);
          setError(applied?.message || "Не удалось применить правки к уроку");
          appendAssistant(
            applied?.message ||
              "Правки сгенерированы, но не применились к уроку.",
          );
          return;
        }
        setPreviewReloadKey((k) => k + 1);
      }

      appendAssistant(
        json.assistantMessage || "Обновил урок по твоим правкам.",
      );
    } catch (e) {
      setError("Ошибка сети при обновлении урока");
      appendAssistant("Ошибка сети при обновлении. Попробуй снова.");
    } finally {
      setIsGenerating(false);
    }
  }, [draft, chatInput, isGenerating, messages, savedLessonId]);

  const handleDone = useCallback(() => {
    if (!savedLessonId) return;
    setIsVisible(false);
    onSuccess(savedLessonId);
  }, [savedLessonId, onSuccess, setIsVisible]);

  // Prevent background page scroll while modal (and nested panels) are scrolling
  useEffect(() => {
    if (!isVisible) return;
    const body = document.body;
    const html = document.documentElement;
    const prevBody = body.style.overflow;
    const prevHtml = html.style.overflow;
    const prevBodyOverscroll = body.style.overscrollBehavior;
    body.style.overflow = "hidden";
    html.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    return () => {
      body.style.overflow = prevBody;
      html.style.overflow = prevHtml;
      body.style.overscrollBehavior = prevBodyOverscroll;
    };
  }, [isVisible]);

  return (
    <Modal
      size="5xl"
      isOpen={isVisible}
      shouldBlockScroll
      onClose={() => {
        if (savedLessonId) {
          handleDone();
          return;
        }
        setIsVisible(false);
      }}
      scrollBehavior="inside"
      placement="center"
      classNames={{
        // size=full forces h-[100dvh] + my-0 (stuck to top). 5xl keeps margins; we widen + cap height.
        wrapper: "overflow-hidden items-center overscroll-none",
        backdrop: "overscroll-none",
        base:
          "!max-w-[min(1400px,96vw)] !w-[min(1400px,96vw)] !h-[min(900px,calc(100dvh-5rem))] !max-h-[min(900px,calc(100dvh-5rem))] !min-h-0 !my-6 sm:!my-10 overflow-hidden overscroll-none",
        body: "p-0 !overflow-hidden min-h-0 flex-1 overscroll-none",
        header: "shrink-0 py-3 sm:py-4",
      }}
    >
      <ModalContent className="h-full max-h-full min-h-0 flex flex-col overflow-hidden">
        <ModalHeader className="flex flex-col gap-1 border-b border-default-100 shrink-0">
          <div className="flex items-center justify-between gap-3 w-full pr-8">
            <div className="min-w-0">
              <p>
                <T k="ai.createWithAi" defaultText="Создать урок с помощью AI" />
              </p>
              <p className="text-sm font-normal text-default-500">
                {step === "preview" ? (
                  <T
                    k="ai.previewConstructorHint"
                    defaultText="Полный конструктор справа — правь задания как обычно или через чат"
                  />
                ) : (
                  <T
                    k="ai.createWithAiHint"
                    defaultText="Собери пожелания → получи черновик → правь в чате или в конструкторе"
                  />
                )}
              </p>
            </div>
            {step === "preview" && savedLessonId && (
              <Button color="primary" onPress={handleDone} className="shrink-0">
                <T k="ai.doneOpenEditor" defaultText="Готово" />
              </Button>
            )}
          </div>
        </ModalHeader>
        <ModalBody className="flex-1 min-h-0 overflow-hidden p-0">
          <div
            className={`grid min-h-0 h-full overflow-hidden ${
              step === "preview"
                ? "grid-cols-1 xl:grid-cols-[320px_minmax(0,1fr)]"
                : "grid-cols-1 lg:grid-cols-2"
            }`}
          >
            <div className="flex flex-col border-b xl:border-b-0 xl:border-r border-default-100 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4 space-y-3 min-h-0">
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
                {isGenerating && (
                  <div className="flex items-center gap-2 text-default-500 text-sm">
                    <Spinner size="sm" />
                    <span>
                      <T k="ai.thinking" defaultText="AI думает…" />
                    </span>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-default-100 space-y-2">
                {step === "preview" ? (
                  <>
                    <Textarea
                      value={chatInput}
                      onValueChange={setChatInput}
                      minRows={2}
                      maxRows={4}
                      placeholder={i18n.t("ai.refinePlaceholder", {
                        defaultValue:
                          "Например: добавь ещё один тест / сделай проще для A2 / перепиши warm-up",
                      })}
                      isDisabled={isGenerating}
                    />
                    <Button
                      color="primary"
                      className="w-full"
                      onPress={handleRefine}
                      isLoading={isGenerating}
                      isDisabled={!chatInput.trim()}
                    >
                      <T k="ai.sendRefine" defaultText="Отправить правку в AI" />
                    </Button>
                  </>
                ) : step === "confirmTopic" ? (
                  <div className="flex flex-col gap-2">
                    <Button
                      color="primary"
                      className="w-full"
                      isLoading={isGenerating}
                      onPress={handleAcceptTopic}
                    >
                      <T k="ai.topicAccept" defaultText="Да, тема подходит" />
                    </Button>
                    <Button
                      variant="bordered"
                      className="w-full"
                      isDisabled={isGenerating}
                      onPress={handleRejectTopic}
                    >
                      <T
                        k="ai.topicReject"
                        defaultText="Нет, придумай другую"
                      />
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-default-400">
                    <T
                      k="ai.fillFormHint"
                      defaultText="Заполни параметры справа и нажми «Сгенерировать урок». Тему можно оставить пустой."
                    />
                  </p>
                )}
              </div>
            </div>

            <div
              className={`flex flex-col px-4 py-4 gap-4 overflow-y-auto overscroll-contain min-h-0 ${
                step === "preview" ? "h-full" : ""
              }`}
            >
              {step === "collect" && (
                <>
                  <div>
                    <p className="text-sm font-medium mb-2">
                      <T k="ai.level" defaultText="Уровень" />
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AI_LEVELS.map((l) => (
                        <Chip
                          key={l}
                          variant={level === l ? "solid" : "bordered"}
                          color={level === l ? "primary" : "default"}
                          className="cursor-pointer"
                          onClick={() => setLevel(l)}
                        >
                          {l}
                        </Chip>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">
                      <T k="ai.exerciseTypes" defaultText="Типы заданий" />
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {AI_EXERCISE_TYPE_OPTIONS.map((opt) => {
                        const selected = selectedTypes.includes(opt.type);
                        return (
                          <Chip
                            key={opt.type}
                            variant={selected ? "solid" : "bordered"}
                            color={selected ? "secondary" : "default"}
                            className="cursor-pointer"
                            onClick={() => toggleType(opt.type)}
                          >
                            {toCapitalizeLabel(
                              i18n.t(opt.titleKey, {
                                defaultValue: opt.titleDefault,
                              }),
                            )}
                          </Chip>
                        );
                      })}
                    </div>
                  </div>

                  <Input
                    label={
                      <T
                        k="ai.topic"
                        defaultText="Тема урока (необязательно)"
                      />
                    }
                    placeholder={i18n.t("ai.topicPlaceholder", {
                      defaultValue:
                        "Можно оставить пустым — AI придумает сам",
                    })}
                    value={topic}
                    onValueChange={setTopic}
                    radius="sm"
                    size="lg"
                  />
                  <Textarea
                    label={
                      <T
                        k="ai.description"
                        defaultText="Что хочешь видеть в уроке"
                      />
                    }
                    placeholder={i18n.t("ai.descriptionPlaceholder", {
                      defaultValue:
                        "Например: разговорный warm-up, новая лексика, грамматика Present Perfect, дискуссия в конце",
                    })}
                    value={description}
                    onValueChange={setDescription}
                    minRows={3}
                    radius="sm"
                    size="lg"
                  />

                  {error && (
                    <p className="text-danger text-sm">{error}</p>
                  )}

                  <Button
                    color="primary"
                    size="lg"
                    className="w-full mt-auto"
                    isDisabled={!canGenerate}
                    isLoading={isGenerating}
                    onPress={handleGenerate}
                  >
                    <T k="ai.generate" defaultText="Сгенерировать урок" />
                  </Button>
                </>
              )}

              {step === "confirmTopic" && suggestedTopic && (
                <>
                  <div className="rounded-xl bg-default-50 p-4 space-y-2">
                    <p className="text-xs uppercase tracking-wide text-default-400">
                      <T k="ai.suggestedTopic" defaultText="Предложенная тема" />
                    </p>
                    <h3 className="text-xl font-semibold">
                      {suggestedTopic.title}
                    </h3>
                    {suggestedTopic.tags && (
                      <p className="text-sm text-primary">
                        {suggestedTopic.tags}
                      </p>
                    )}
                    {suggestedTopic.description && (
                      <p className="text-sm text-default-600">
                        {suggestedTopic.description}
                      </p>
                    )}
                  </div>
                  {error && (
                    <p className="text-danger text-sm">{error}</p>
                  )}
                  <div className="mt-auto space-y-2 pt-2">
                    <Button
                      color="primary"
                      size="lg"
                      className="w-full"
                      isLoading={isGenerating}
                      onPress={handleAcceptTopic}
                    >
                      <T
                        k="ai.topicAcceptGenerate"
                        defaultText="Да, генерировать урок"
                      />
                    </Button>
                    <Button
                      variant="bordered"
                      className="w-full"
                      isDisabled={isGenerating}
                      onPress={handleRejectTopic}
                    >
                      <T
                        k="ai.topicReject"
                        defaultText="Нет, придумай другую"
                      />
                    </Button>
                    <Button
                      variant="flat"
                      className="w-full"
                      isDisabled={isGenerating}
                      onPress={() => {
                        setStep("collect");
                        setSuggestedTopic(null);
                        appendAssistant(
                          "Ок, можешь вписать свою тему справа и нажать «Сгенерировать урок».",
                        );
                      }}
                    >
                      <T
                        k="ai.topicEnterOwn"
                        defaultText="Введу тему сам"
                      />
                    </Button>
                  </div>
                </>
              )}

              {step === "preview" && draft && savedLessonId && (
                <div className="h-full min-h-0 flex flex-col">
                  {error && (
                    <p className="text-danger text-sm mb-2 shrink-0">{error}</p>
                  )}
                  <AiLessonConstructorPreview
                    key={`${savedLessonId}-${previewReloadKey}`}
                    lessonId={savedLessonId}
                    title={draft.lesson.title}
                    description={draft.lesson.description}
                    tags={draft.lesson.tags}
                  />
                </div>
              )}
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
