"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { canUseAi } from "@/app/ai/canUseAi";
import { AI_LEVELS, TAiLevel } from "@/app/lessons/components/CreateLessonWithAiModal/types";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import {
  Button,
  Chip,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
} from "@nextui-org/react";
import { FC, useCallback, useContext, useState } from "react";

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

type TProps = {
  type: string;
  onApply: (data: Record<string, any>) => void;
  lessonContext?: {
    title?: string;
    description?: string;
    tags?: string;
  };
};

export const CreateExWithAiButton: FC<TProps> = ({
  type,
  onApply,
  lessonContext,
}) => {
  const { profile } = useContext(AuthContext);
  const { requireAiSubscription } = useCheckSubscription();
  const lessonId = useEditorLessonId();
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [level, setLevel] = useState<TAiLevel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = useCallback(async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchPostJson({
        path: "/ai/generate-exercise",
        isSecure: true,
        data: {
          type,
          prompt: prompt.trim(),
          level: level || undefined,
          lesson_id: lessonId ? Number(lessonId) : undefined,
          lessonContext,
        },
      });
      const json = await res.json();
      if (!json?.success || !json?.data) {
        checkResponse(json);
        setError(json?.message || "Не удалось создать задание");
        return;
      }
      onApply(json.data);
      setOpen(false);
      setPrompt("");
    } catch (e) {
      setError("Ошибка сети");
    } finally {
      setIsLoading(false);
    }
  }, [prompt, isLoading, type, level, lessonContext, onApply, lessonId]);

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
          <T k="ai.createExWithAi" defaultText="Создать с помощью AI" />
        </Button>
      </div>

      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        size="lg"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <T k="ai.createExWithAi" defaultText="Создать с помощью AI" />
            <p className="text-sm font-normal text-default-500">
              <T
                k="ai.createExWithAiHint"
                defaultText="Опиши тему и что должно быть в задании — AI заполнит поля"
              />
            </p>
          </ModalHeader>
          <ModalBody className="pb-6 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">
                <T k="ai.levelOptional" defaultText="Уровень (необязательно)" />
              </p>
              <div className="flex flex-wrap gap-2">
                {AI_LEVELS.map((l) => (
                  <Chip
                    key={l}
                    variant={level === l ? "solid" : "bordered"}
                    color={level === l ? "primary" : "default"}
                    className="cursor-pointer"
                    onClick={() => setLevel((prev) => (prev === l ? null : l))}
                  >
                    {l}
                  </Chip>
                ))}
              </div>
            </div>
            <Textarea
              minRows={4}
              label={<T k="ai.exPrompt" defaultText="Что создать" />}
              placeholder={i18n.t("ai.exPromptPlaceholder", {
                defaultValue:
                  "Например: 5 вопросов про travel для B1, с юмором в стиле 2easy",
              })}
              value={prompt}
              onValueChange={setPrompt}
              isDisabled={isLoading}
            />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button
              color="primary"
              className="w-full"
              size="lg"
              isLoading={isLoading}
              isDisabled={!prompt.trim()}
              onPress={onGenerate}
            >
              <T k="ai.generateEx" defaultText="Сгенерировать задание" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
