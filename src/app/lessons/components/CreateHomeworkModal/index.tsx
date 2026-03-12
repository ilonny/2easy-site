"use client";

import { useTranslation } from "react-i18next";
import { checkResponse, fetchPostJson } from "@/api";
import { TLesson } from "../../types";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const EX_TYPE_TO_TEMPLATE_KEY: Record<string, string> = {
  "text-default": "templates.text",
  "text-2-col": "templates.text2Col",
  "text-sticker": "templates.textSticker",
  "text-checklist": "templates.textChecklist",
  image: "templates.images",
  video: "templates.video",
  audio: "templates.audio",
  note: "templates.note",
  "fill-gaps-drag": "templates.fillGapsDrag",
  "fill-gaps-select": "templates.fillGapsSelect",
  "fill-gaps-input": "templates.fillGapsInput",
  "match-word-word": "templates.matchWordWord",
  "match-word-image": "templates.matchWordImage",
  "match-word-column": "templates.matchWordColumn",
  test: "templates.test",
  "free-input-form": "templates.freeInput",
  int: "templates.integrations",
};

const getExDisplayInfo = (
  t: (key: string) => string,
  ex: {
  type: string;
  data?: string | Record<string, unknown>;
}) => {
  const templateKey = EX_TYPE_TO_TEMPLATE_KEY[ex.type];
  const typeLabel = templateKey ? t(templateKey) : ex.type;
  let title = "";
  let description = "";
  try {
    const parsed =
      typeof ex.data === "string" ? JSON.parse(ex.data || "{}") : ex.data || {};
    title = (parsed.title || parsed.subtitle || "") as string;
    description = (parsed.description || "") as string;
  } catch {}
  return { typeLabel, title, description };
};

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  lesson: TLesson;
  exList: Array<{
    id: number;
    type: string;
    data?: string;
    sortIndex?: number;
  }>;
  onSuccess?: () => void;
};

export const CreateHomeworkModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  lesson,
  exList,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [chosenExIds, setChosenExIds] = useState<number[]>([]);
  const [createFromScratch, setCreateFromScratch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const onClickEx = useCallback((id: number) => {
    setChosenExIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : ids.concat(id),
    );
  }, []);

  const sortedExList = [...exList].sort(
    (a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0),
  );

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPostJson({
        path: "/lessons/homework/create",
        isSecure: true,
        data: {
          lesson_id: lesson.id,
          ex_ids: createFromScratch ? [] : chosenExIds,
        },
      });
      const data = await res?.json();
      checkResponse(data);
      setIsVisible(false);
      onSuccess?.();
      if (data.first_homework_id) {
        router.push(`/editor/${data.first_homework_id}`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [
    chosenExIds,
    createFromScratch,
    lesson.id,
    onSuccess,
    router,
    setIsVisible,
  ]);

  useEffect(() => {
    if (!isVisible) return;
    setIsChecking(true);
    fetchPostJson({
      path: "/lessons/homework/check",
      isSecure: true,
      data: { lesson_id: lesson.id },
    })
      .then((r) => r?.json())
      .then((data) => {
        if (data?.exists && data?.first_homework_id) {
          setIsVisible(false);
          onSuccess?.();
          router.push(`/editor/${data.first_homework_id}`);
        }
      })
      .catch(() => {})
      .finally(() => setIsChecking(false));
  }, [isVisible, lesson.id, onSuccess, router, setIsVisible]);

  useEffect(() => {
    if (!isVisible) {
      setChosenExIds([]);
      setCreateFromScratch(false);
    }
  }, [isVisible]);

  const canSubmit =
    createFromScratch || chosenExIds.length > 0 || exList.length === 0;

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      style={{ backgroundColor: "#F9F9F9" }}
    >
      <ModalContent>
        <ModalHeader>
          <p>{t("modals.chooseTasksForHomework")}</p>
        </ModalHeader>
        <ModalBody>
          {isChecking && (
            <div className="flex justify-center py-8">
              <Button isLoading color="primary" variant="flat">
                {t("modals.homeworkChecking")}
              </Button>
            </div>
          )}
          {!isChecking && (
            <>
              <p className="text-small text-default-500 mb-2">
                {t("modals.homeworkCopyHint")}
              </p>
              <div className="flex items-center gap-2 mb-4">
                <Checkbox
                  isSelected={createFromScratch}
                  onValueChange={setCreateFromScratch}
                >
                  {t("lessons.createFromScratch")}
                </Checkbox>
              </div>
              {!createFromScratch && sortedExList.length > 0 && (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-4">
                  {sortedExList
                    .filter((ex) => ex.type !== "note")
                    .map((ex) => {
                      const { typeLabel, title, description } =
                        getExDisplayInfo(t, ex);
                      const isChosen = chosenExIds.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          onClick={() => onClickEx(ex.id)}
                          className="p-3 rounded-lg border cursor-pointer hover:bg-default-100"
                          style={{
                            borderColor: isChosen ? "#3f28c6" : "#e4e4e7",
                            backgroundColor: isChosen ? "#eeebff" : undefined,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox isSelected={isChosen} />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-small text-default-600">
                                {typeLabel}
                              </p>
                              {title && (
                                <p className="font-semibold truncate">
                                  {title}
                                </p>
                              )}
                              {description && (
                                <p className="text-small text-default-500 line-clamp-2">
                                  {description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
              {!createFromScratch && exList.length === 0 && (
                <p className="text-default-500 mb-4">
                  {t("modals.homeworkNoTasksHint")}
                </p>
              )}
              <Button
                color="primary"
                className="w-full"
                isLoading={isLoading}
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                {t("lessons.createHomework")}
              </Button>
            </>
          )}
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
