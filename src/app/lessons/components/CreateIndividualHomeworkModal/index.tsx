"use client";

import { useTranslation } from "react-i18next";
import { checkResponse, fetchGet, fetchPostJson } from "@/api";
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
  studentId: number | string;
  onSuccess?: () => void;
};

export const CreateIndividualHomeworkModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  lesson,
  studentId,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [chosenExIds, setChosenExIds] = useState<number[]>([]);
  const [createFromScratch, setCreateFromScratch] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [exList, setExList] = useState<
    Array<{ id: number; type: string; data?: string; sortIndex?: number }>
  >([]);
  const [exListLoading, setExListLoading] = useState(false);

  const onClickEx = useCallback((id: number) => {
    setChosenExIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : ids.concat(id)
    );
  }, []);

  const sortedExList = [...exList].sort(
    (a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0)
  );

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetchPostJson({
        path: "/lessons/homework/create-individual-for-student",
        isSecure: true,
        data: {
          lesson_id: lesson.id,
          student_id: Number(studentId),
          ex_ids: createFromScratch ? [] : chosenExIds,
        },
      });
      const data = await res?.json();
      checkResponse(data);
      setIsVisible(false);
      onSuccess?.();
      if (data?.homework_lesson_id) {
        router.push(`/lessons/${data.homework_lesson_id}`);
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
    studentId,
  ]);

  useEffect(() => {
    if (!isVisible || !lesson?.id) return;
    setExListLoading(true);
    fetchGet({
      path: `/ex/list?lesson_id=${lesson.id}`,
      isSecure: true,
    })
      .then((r) => r?.json())
      .then((list) => {
        setExList(Array.isArray(list) ? list : []);
      })
      .catch(() => setExList([]))
      .finally(() => setExListLoading(false));
  }, [isVisible, lesson?.id]);

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
          <p>{t("lessons.createPersonalHomework")}</p>
        </ModalHeader>
        <ModalBody>
          {exListLoading && (
            <div className="flex justify-center py-8">
              <Button isLoading color="primary" variant="flat">
                {t("modals.homeworkLoadingTasks")}
              </Button>
            </div>
          )}
          {!exListLoading && (
            <>
              <p className="text-small text-default-500 mb-2">
                {t("modals.homeworkIndividualHint")}
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
                                <p className="font-semibold truncate">{title}</p>
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
