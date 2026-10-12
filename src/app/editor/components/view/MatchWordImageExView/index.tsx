/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Chip, Input, Tooltip } from "@nextui-org/react";
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
import Draggable from "react-draggable";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { TMatchWordImageData } from "../../editor/MatchWordImage/types";
import { T } from "@/i18n/T";
import styles from "./styles.module.css";

type TProps = {
  data: TMatchWordImageData;
  isPreview?: boolean;
};

const sameId = (
  a: string | number | undefined | null,
  b: string | number | undefined | null
) => a != null && b != null && String(a) === String(b);

const hasId = (
  ids: Array<string | number> | undefined,
  id: string | number | undefined | null
) => !!ids?.some((x) => sameId(x, id));

const parseSavedAnswer = (raw: unknown, viewType?: string) => {
  if (!raw) return { correctIds: [] as Array<string | number>, incorrectIdsMap: {} as Record<string, string> };
  try {
    const parsed =
      typeof raw === "string" ? JSON.parse(raw || "{}") : (raw as Record<string, any>);
    // Ignore answers saved under a different interaction mode.
    if (
      parsed?.viewType != null &&
      viewType != null &&
      String(parsed.viewType) !== String(viewType)
    ) {
      return { correctIds: [], incorrectIdsMap: {} };
    }
    return {
      correctIds: (parsed?.correctIds || []) as Array<string | number>,
      incorrectIdsMap: (parsed?.incorrectIdsMap || {}) as Record<string, string>,
    };
  } catch {
    return { correctIds: [], incorrectIdsMap: {} };
  }
};

const DraggableItem = (props: {
  id: string | number;
  chip: string;
  setCorrectIds: Dispatch<SetStateAction<Array<string | number>>>;
  setActiveChip: Dispatch<SetStateAction<string>>;
  setIncorrectIdsMap: Dispatch<SetStateAction<Record<string, string>>>;
  onPersist: (
    nextCorrect: Array<string | number>,
    nextIncorrect: Record<string, string>
  ) => void;
  fields: TMatchWordImageData["images"];
  correctIds: Array<string | number>;
  incorrectIdsMap: Record<string, string>;
  onDropMiss?: () => void;
}) => {
  const {
    chip,
    setCorrectIds,
    setActiveChip,
    setIncorrectIdsMap,
    id,
    fields,
    onPersist,
    correctIds,
    incorrectIdsMap,
    onDropMiss,
  } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);
  const isIntersected = useRef(false);
  const missedIntersectedId = useRef<string | number | null>(null);

  const findDropTargetId = useCallback(
    (draggableRect: DOMRect): string | number | null => {
      const root = document
        ?.getElementById("draggable-" + id)
        ?.closest(".match-word-image");
      const wrappers = root?.querySelectorAll(".answer-wrapper");
      if (!wrappers?.length) return null;

      let bestId: string | number | null = null;
      let bestArea = 0;

      Array.from(wrappers).forEach((w) => {
        const droppableRect = w.getBoundingClientRect();
        const overlapX = Math.max(
          0,
          Math.min(draggableRect.right, droppableRect.right) -
            Math.max(draggableRect.left, droppableRect.left)
        );
        const overlapY = Math.max(
          0,
          Math.min(draggableRect.bottom, droppableRect.bottom) -
            Math.max(draggableRect.top, droppableRect.top)
        );
        const area = overlapX * overlapY;
        if (area <= 0) return;
        const rawId = (w.id || "").replace(/^answer-wrapper-/, "");
        if (!rawId) return;
        // Prefer largest overlap so edge drops still register.
        if (area > bestArea) {
          bestArea = area;
          bestId = fields.find((f) => sameId(f.id, rawId))?.id ?? rawId;
        }
      });

      return bestId;
    },
    [fields, id]
  );

  const handleDrag = useCallback(
    (chipText: string, nextX: number, nextY: number) => {
      setActiveChip(chipText);
      setX(nextX);
      setY(nextY);

      try {
        const el = document.getElementById("draggable-" + id);
        if (!el) return;
        const draggableRect = el.getBoundingClientRect();
        const targetId = findDropTargetId(draggableRect);
        missedIntersectedId.current = targetId;
        isIntersected.current = targetId != null && sameId(targetId, id);
      } catch {
        isIntersected.current = false;
        missedIntersectedId.current = null;
      }
    },
    [findDropTargetId, id, setActiveChip]
  );

  const applyCorrect = useCallback(
    (targetId: string | number) => {
      setCorrectIds((ids) => {
        if (hasId(ids, targetId)) {
          onPersist(ids, incorrectIdsMap);
          return ids;
        }
        const next = ids.concat(targetId);
        onPersist(next, incorrectIdsMap);
        return next;
      });
      setX(0);
      setY(0);
    },
    [incorrectIdsMap, onPersist, setCorrectIds]
  );

  return (
    <Draggable
      key={chip}
      handle=".handle"
      position={{ x, y }}
      scale={1}
      onDrag={(_e, data) => handleDrag(chip, data.x, data.y)}
      onStop={() => {
        setActiveChip("");
        const ownHit = isIntersected.current;
        const missedId = missedIntersectedId.current;
        isIntersected.current = false;
        missedIntersectedId.current = null;

        if (ownHit) {
          applyCorrect(id);
          return;
        }

        if (missedId != null) {
          const expected = fields.find((f) => sameId(f.id, missedId))?.text;
          if (expected === chip) {
            applyCorrect(missedId);
            return;
          }

          setX(0);
          setY(0);
          setIsError(true);
          onDropMiss?.();
          setTimeout(() => setIsError(false), 1600);

          setIncorrectIdsMap((m) => {
            const next = { ...m, [String(missedId)]: chip };
            onPersist(correctIds, next);
            return next;
          });
          return;
        }

        setX(0);
        setY(0);
        setIsError(true);
        onDropMiss?.();
        setTimeout(() => setIsError(false), 1600);
      }}
    >
      <Chip
        color={isError ? "danger" : "primary"}
        style={{
          zIndex: 1,
          cursor: "pointer",
          height: "auto",
          textAlign: "center",
        }}
        id={"draggable-" + id}
        className={`handle exercise-chip cursor-pointer text-[18px] ${styles.draggableChip}`}
      >
        {chip}
      </Chip>
    </Draggable>
  );
};

const InputItem = (props: {
  chip: string;
  setCorrectIds: Dispatch<SetStateAction<Array<string | number>>>;
  isCorrect: boolean;
  isTeacher: boolean;
  isIncorrectWord?: string;
  id: string | number;
  setIncorrectIdsMap: Dispatch<SetStateAction<Record<string, string>>>;
  isPresentationMode?: boolean;
  correctIds: Array<string | number>;
  incorrectIdsMap: Record<string, string>;
  onPersist: (
    nextCorrect: Array<string | number>,
    nextIncorrect: Record<string, string>
  ) => void;
}) => {
  const {
    chip,
    setCorrectIds,
    isCorrect,
    isTeacher,
    isIncorrectWord,
    id,
    setIncorrectIdsMap,
    isPresentationMode,
    correctIds,
    incorrectIdsMap,
    onPersist,
  } = props;
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (isCorrect) {
      setInputValue(chip || "");
      return;
    }
    if (isIncorrectWord) {
      setInputValue(isIncorrectWord);
      return;
    }
    setInputValue("");
  }, [isCorrect, isIncorrectWord, chip]);

  useEffect(() => {
    if (!inputValue || isCorrect) {
      return;
    }
    if (inputValue.toLowerCase() === chip.toLowerCase()) {
      setCorrectIds((ids) => {
        if (hasId(ids, id)) {
          onPersist(ids, incorrectIdsMap);
          return ids;
        }
        const next = ids.concat(id);
        onPersist(next, incorrectIdsMap);
        return next;
      });
    }
  }, [
    inputValue,
    id,
    chip,
    setCorrectIds,
    isCorrect,
    incorrectIdsMap,
    onPersist,
  ]);

  const onBlur = useCallback(() => {
    if (!inputValue || isCorrect) {
      return;
    }
    if (inputValue.toLowerCase() !== chip.toLowerCase()) {
      setIncorrectIdsMap((m) => {
        const next = { ...m, [String(id)]: inputValue };
        onPersist(correctIds, next);
        return next;
      });
    }
  }, [
    chip,
    id,
    inputValue,
    setIncorrectIdsMap,
    isCorrect,
    correctIds,
    onPersist,
  ]);

  const hideAnswerHints = !isTeacher || !!isPresentationMode;

  return (
    <>
      <Tooltip
        isDisabled={hideAnswerHints}
        content={
          !hideAnswerHints ? (
            <div className="teacher-placeholer">{chip}</div>
          ) : null
        }
      >
        <Input
          color={inputValue && !isCorrect ? "danger" : "default"}
          value={inputValue}
          onValueChange={setInputValue}
          // placeholder={isTeacher && !isPresentationMode ? chip : ""}
          style={{ height: 50 }}
          isDisabled={isCorrect}
          classNames={{ inputWrapper: "bg-white" }}
          onBlur={onBlur}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              onBlur(event);
            }
          }}
        />
      </Tooltip>
    </>
  );
};

export const MatchWordImageExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const { profile } = useContext(AuthContext);
  const [correctIds, setCorrectIds] = useState<Array<string | number>>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState<Record<string, string>>(
    {}
  );
  const [activeChip, setActiveChip] = useState("");
  const [dropHint, setDropHint] = useState(false);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;
  const viewType = data?.viewType === "input" ? "input" : "drag";

  const isSorted = useRef(false);
  useEffect(() => {
    const t = setTimeout(() => {
      isSorted.current = true;
    }, 300);
    return () => clearTimeout(t);
  }, []);

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode,
  });

  const persist = useCallback(
    (
      nextCorrect: Array<string | number>,
      nextIncorrect: Record<string, string>
    ) => {
      if (isPreview) return;
      if (!nextCorrect.length && !Object.keys(nextIncorrect).length) {
        return;
      }
      void writeAnswer(
        data.id,
        JSON.stringify({
          correctIds: nextCorrect,
          incorrectIdsMap: nextIncorrect,
          viewType,
        })
      );
    },
    [data.id, isPreview, viewType, writeAnswer]
  );

  const applyParsed = useCallback(
    (raw: unknown) => {
      const parsed = parseSavedAnswer(raw, viewType);
      setCorrectIds(parsed.correctIds || []);
      setIncorrectIdsMap(parsed.incorrectIdsMap || {});
    },
    [viewType]
  );

  const clearLocal = useCallback(() => {
    setCorrectIds([]);
    setIncorrectIdsMap({});
    setActiveChip("");
  }, []);

  useEffect(() => {
    clearLocal();
  }, [resetSeq, clearLocal]);

  const sortedChips = useMemo(() => {
    const available = [...(data.images || [])].filter(
      (i) => !!i.text && !hasId(correctIds, i.id)
    );
    if (!isSorted.current) {
      return available.sort(() => 0.5 - Math.random());
    }
    return available;
  }, [correctIds, data.images]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          applyParsed(a?.[data.id]?.answer ?? a?.[String(data.id)]?.answer);
        } catch {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  useEffect(() => {
    if (!isTeacher) {
      return;
    }
    // Only mirror student answers when viewing a student —
    // otherwise empty poll wipes local practice progress.
    if (!rest.activeStudentId) {
      return;
    }
    const raw = answers[data.id]?.answer ?? answers[String(data.id)]?.answer;
    if (!raw) {
      clearLocal();
      return;
    }
    applyParsed(raw);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher, rest.activeStudentId, viewType]);

  return (
    <div
      className={`${styles.root} py-4 sm:py-6 md:py-7 lg:py-8 w-full exercise-view-shell max-w-[886px] mx-auto exercise-view-head match-word-image`}
    >
      <p
        className="exercise-view-title"
        style={{
          color: data.titleColor,
        }}
      >
        {data.title}
      </p>
      <p className="exercise-view-subtitle">{data.subtitle}</p>
      {!!data.description && (
        <p className="exercise-view-desc">{data.description}</p>
      )}
      {isTeacher &&
        rest.isView &&
        !rest?.isPresentationMode &&
        !rest.activeStudentId && (
          <p className="mt-3 text-sm text-[#767676]">
            <T k="lessons.selectStudentToSeeAnswers" />
          </p>
        )}
      {dropHint && viewType === "drag" && (
        <p className="mt-2 text-sm text-[#a42929]">
          <T k="lessons.dragCloserToImage" />
        </p>
      )}
      <div className="h-10" />
      <div style={{ margin: "0 auto" }}>
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[180px] sm:h-[250px] rounded-lg"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {viewType === "drag" && (
          <div className={styles.chipPool}>
            {sortedChips.map((chip) => {
              return (
                <DraggableItem
                  id={chip.id}
                  chip={chip.text}
                  key={chip.id}
                  setCorrectIds={setCorrectIds}
                  setActiveChip={setActiveChip}
                  setIncorrectIdsMap={setIncorrectIdsMap}
                  fields={data.images}
                  onPersist={persist}
                  correctIds={correctIds}
                  incorrectIdsMap={incorrectIdsMap}
                  onDropMiss={() => {
                    setDropHint(true);
                    setTimeout(() => setDropHint(false), 1800);
                  }}
                />
              );
            })}
          </div>
        )}
        {!!data?.images?.length && (
          <div className="flex flex-wrap justify-center gap-y-3 w-full min-w-0">
            {data?.images?.map((image, imageIndex) => {
              const isCorrect =
                hasId(correctIds, image.id) ||
                (isTeacher &&
                  !rest?.isPresentationMode &&
                  image.text === activeChip);
              const isIncorrectWord =
                !isCorrect &&
                (incorrectIdsMap?.[String(image?.id)] ||
                  incorrectIdsMap?.[image?.id as any]);
              return (
                <div
                  key={image.path || image.id || image.dataURL || imageIndex}
                  className="w-full min-w-0 sm:w-1/2 lg:w-1/3 p-2 sm:p-3 lg:p-4 box-border"
                >
                  <div className="min-h-[160px] sm:h-[220px] flex items-center justify-center overflow-hidden rounded-lg bg-neutral-50">
                    {image.dataURL ? (
                      <Zoom>
                        <img
                          src={image.dataURL}
                          alt={image.text || ""}
                          loading="lazy"
                          className="mx-auto max-h-full max-w-full w-auto object-contain"
                        />
                      </Zoom>
                    ) : (
                      <div className="w-full h-full min-h-[120px] bg-[#EDEDED] rounded-lg" />
                    )}
                  </div>
                  {viewType === "drag" && (
                    <ResponsiveTooltip
                      isDisabled={
                        !isTeacher || !!rest?.isPresentationMode
                      }
                      content={
                        isTeacher && !rest?.isPresentationMode ? (
                          <div className="teacher-placeholer">{image.text}</div>
                        ) : null
                      }
                    >
                      <Card
                        className={`answer-wrapper mt-4 flex items-center justify-center p-2 ${styles.dropZone}`}
                        id={"answer-wrapper-" + image.id}
                        style={{
                          width: "100%",
                          minHeight: 48,
                          border: isCorrect
                            ? "2px solid #219F59"
                            : isIncorrectWord
                            ? "2px solid rgb(164, 41, 41)"
                            : "2px dashed #C9C9C9",
                          background: isCorrect
                            ? "#E9FEE8"
                            : isIncorrectWord
                            ? "#fdd0df"
                            : "transparent",
                        }}
                      >
                        {isCorrect && image.text}
                        {isIncorrectWord && isIncorrectWord}
                      </Card>
                    </ResponsiveTooltip>
                  )}
                  {viewType === "input" && (
                    <Card
                      className="mt-4 flex items-center justify-center"
                      id={"answer-wrapper-" + image.id}
                      style={{
                        height: 40,
                        width: "100%",
                        background: isCorrect
                          ? "#E9FEE8"
                          : isIncorrectWord
                          ? "#fdd0df"
                          : "transparent",
                      }}
                    >
                      <InputItem
                        id={image.id}
                        isTeacher={isTeacher}
                        isCorrect={!!hasId(correctIds, image.id)}
                        chip={image.text}
                        setCorrectIds={setCorrectIds}
                        isIncorrectWord={isIncorrectWord}
                        setIncorrectIdsMap={setIncorrectIdsMap}
                        isPresentationMode={rest?.isPresentationMode}
                        correctIds={correctIds}
                        incorrectIdsMap={incorrectIdsMap}
                        onPersist={persist}
                      />
                    </Card>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
