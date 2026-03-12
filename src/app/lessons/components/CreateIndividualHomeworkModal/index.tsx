"use client";

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

const EX_TYPE_LABELS: Record<string, string> = {
  "text-default": "Текст",
  "text-2-col": "Текст в 2 колонки",
  "text-sticker": "Текст на стикерах",
  "text-checklist": "Чек-лист",
  image: "Изображения",
  video: "Видео",
  audio: "Аудио",
  note: "Заметка",
  "fill-gaps-drag": "Перетащить слово",
  "fill-gaps-select": "Выбрать вариант",
  "fill-gaps-input": "Вписать слово",
  "match-word-word": "Match слова с определением",
  "match-word-image": "Match слова с изображением",
  "match-word-column": "Расставить по колонкам",
  test: "Тест",
  "free-input-form": "Поле для ввода",
  int: "Интеграции",
};

const getExDisplayInfo = (ex: {
  type: string;
  data?: string | Record<string, unknown>;
}) => {
  const typeLabel = EX_TYPE_LABELS[ex.type] || ex.type;
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
          <p>Создать личную Homework для ученика</p>
        </ModalHeader>
        <ModalBody>
          {exListLoading && (
            <div className="flex justify-center py-8">
              <Button isLoading color="primary" variant="flat">
                Загрузка заданий...
              </Button>
            </div>
          )}
          {!exListLoading && (
            <>
              <p className="text-small text-default-500 mb-2">
                Выберите задания из урока или создайте Homework с нуля.
              </p>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setCreateFromScratch(!createFromScratch)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setCreateFromScratch(!createFromScratch);
                  }
                }}
                className="flex items-center gap-2 mb-4 cursor-pointer select-none w-fit"
              >
                <Checkbox
                  isSelected={createFromScratch}
                  classNames={{ base: "pointer-events-none" }}
                />
                <span>Создать с нуля</span>
              </div>
              {!createFromScratch && sortedExList.length > 0 && (
                <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto mb-4">
                  {sortedExList
                    .filter((ex) => ex.type !== "note")
                    .map((ex) => {
                      const { typeLabel, title, description } =
                        getExDisplayInfo(ex);
                      const isChosen = chosenExIds.includes(ex.id);
                      return (
                        <div
                          key={ex.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onClickEx(ex.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onClickEx(ex.id);
                            }
                          }}
                          className="p-3 rounded-lg border cursor-pointer hover:bg-default-100 select-none"
                          style={{
                            borderColor: isChosen ? "#3f28c6" : "#e4e4e7",
                            backgroundColor: isChosen ? "#eeebff" : undefined,
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <Checkbox
                              isSelected={isChosen}
                              classNames={{ base: "pointer-events-none shrink-0" }}
                            />
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
                  В уроке нет заданий для копирования. Будет создана пустая
                  Homework.
                </p>
              )}
              <Button
                color="primary"
                className="w-full"
                isLoading={isLoading}
                disabled={!canSubmit}
                onClick={onSubmit}
              >
                Создать Homework
              </Button>
            </>
          )}
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
