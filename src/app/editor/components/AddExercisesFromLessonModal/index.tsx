"use client";

import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import {
  Button,
  Checkbox,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";

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
  FILL_GAPS_NEW: "templates.fillGapsNew",
  UNSCRAMBLE_WORDS: "templates.unscrambleWords",
  TRUE_FALSE: "templates.trueFalse",
  "match-word-word": "templates.matchWordWord",
  "match-word-image": "templates.matchWordImage",
  "match-word-column": "templates.matchWordColumn",
  test: "templates.test",
  "free-input-form": "templates.freeInput",
  int: "templates.integrations",
};

type TExItem = {
  id: number;
  type: string;
  data?: string;
  sortIndex?: number;
};

const getExDisplayInfo = (ex: TExItem) => {
  const templateKey = EX_TYPE_TO_TEMPLATE_KEY[ex.type];
  const typeLabel = templateKey ? i18n.t(templateKey) : ex.type;
  let title = "";
  let description = "";
  try {
    const parsed =
      typeof ex.data === "string" ? JSON.parse(ex.data || "{}") : {};
    title = (parsed.title || parsed.subtitle || "") as string;
    description = (parsed.description || "") as string;
  } catch {
    /* ignore */
  }
  return { typeLabel, title, description };
};

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  /** Homework lesson that receives the copied exercises */
  homeworkLessonId: number;
  /** Parent lesson to pick exercises from */
  parentLessonId: number;
  /** Current last sortIndex in the homework lesson */
  lastSortIndex: number;
  onSuccess?: () => void;
};

export const AddExercisesFromLessonModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  homeworkLessonId,
  parentLessonId,
  lastSortIndex,
  onSuccess,
}) => {
  const [chosenExIds, setChosenExIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exList, setExList] = useState<TExItem[]>([]);
  const [exListLoading, setExListLoading] = useState(false);

  const onClickEx = useCallback((id: number) => {
    setChosenExIds((ids) =>
      ids.includes(id) ? ids.filter((i) => i !== id) : ids.concat(id),
    );
  }, []);

  const sortedExList = useMemo(
    () =>
      [...exList]
        .filter((ex) => ex.type !== "note")
        .sort((a, b) => (a.sortIndex ?? 0) - (b.sortIndex ?? 0)),
    [exList],
  );

  const onSubmit = useCallback(async () => {
    if (!chosenExIds.length || !homeworkLessonId) return;
    setIsLoading(true);
    try {
      // Preserve lesson order when appending to homework.
      const orderedIds = sortedExList
        .map((ex) => ex.id)
        .filter((id) => chosenExIds.includes(id));
      let sortCursor = Number(lastSortIndex) || 0;
      for (const exId of orderedIds) {
        const res = await fetchPostJson({
          path: "/ex/copy",
          isSecure: true,
          data: {
            lesson_id: homeworkLessonId,
            id: exId,
            currentSortIndexToShift: sortCursor,
          },
        });
        const data = await res?.json();
        checkResponse(data);
        sortCursor += 1;
      }
      setIsVisible(false);
      onSuccess?.();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [
    chosenExIds,
    homeworkLessonId,
    lastSortIndex,
    onSuccess,
    setIsVisible,
    sortedExList,
  ]);

  useEffect(() => {
    if (!isVisible || !parentLessonId) return;
    setExListLoading(true);
    fetchGet({
      path: `/ex/list?lesson_id=${parentLessonId}`,
      isSecure: true,
    })
      .then((r) => r?.json())
      .then((list) => {
        setExList(Array.isArray(list) ? list : []);
      })
      .catch(() => setExList([]))
      .finally(() => setExListLoading(false));
  }, [isVisible, parentLessonId]);

  useEffect(() => {
    if (!isVisible) {
      setChosenExIds([]);
    }
  }, [isVisible]);

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      classNames={{
        wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS,
        base: "rounded-[20px] bg-white lg:rounded-[30px]",
        header: "border-b border-black/5 font-medium text-brand-black",
      }}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            <T k="modals.addTasksFromLessonTitle" />
          </p>
        </ModalHeader>
        <ModalBody>
          <p className="mb-2 text-small text-default-500">
            <T k="modals.addTasksFromLessonHint" />
          </p>
          {exListLoading && (
            <div className="flex justify-center py-8">
              <Button isLoading color="primary" variant="flat">
                <T k="modals.homeworkLoadingTasks" />
              </Button>
            </div>
          )}
          {!exListLoading && sortedExList.length > 0 && (
            <div className="mb-4 flex max-h-[300px] flex-col gap-2 overflow-y-auto">
              {sortedExList.map((ex) => {
                const { typeLabel, title, description } = getExDisplayInfo(ex);
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
                    className="cursor-pointer select-none rounded-lg border p-3 hover:bg-default-100"
                    style={{
                      borderColor: isChosen ? "#5A42D4" : "#e4e4e7",
                      backgroundColor: isChosen ? "#eeebff" : undefined,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        isSelected={isChosen}
                        classNames={{
                          base: "pointer-events-none shrink-0",
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-small font-medium text-default-600">
                          {typeLabel}
                        </p>
                        {title && (
                          <p className="truncate font-semibold">{title}</p>
                        )}
                        {description && (
                          <p className="line-clamp-2 text-small text-default-500">
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
          {!exListLoading && sortedExList.length === 0 && (
            <p className="mb-4 text-default-500">
              <T k="modals.addTasksFromLessonEmpty" />
            </p>
          )}
          <Button
            color="primary"
            className="w-full"
            isLoading={isLoading}
            isDisabled={!chosenExIds.length}
            onClick={onSubmit}
          >
            <T k="modals.addTasksFromLessonSubmit" />
          </Button>
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
