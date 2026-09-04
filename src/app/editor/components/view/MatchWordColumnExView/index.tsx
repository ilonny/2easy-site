/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Chip } from "@nextui-org/react";
import Draggable from "react-draggable";
import { AuthContext } from "@/auth";
import { TMatchWordColumnData } from "../../editor/MatchWordColumn/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import styles from "./styles.module.css";

type TProps = {
  data: TMatchWordColumnData;
  isPreview?: boolean;
  activeStudentId?: number | string | null;
  isPresentationMode?: boolean;
};

type TSortedWord = { word: string; id: string; columnId: number | string };

const rectsIntersect = (a: DOMRect, b: DOMRect) =>
  !(
    a.top > b.bottom ||
    a.bottom < b.top ||
    a.right < b.left ||
    a.left > b.right
  );

const DraggableItem = (props: {
  chip: TSortedWord;
  setCorrectChips: Dispatch<SetStateAction<TSortedWord[]>>;
  setHoveredColumnId: Dispatch<SetStateAction<string | null>>;
  setIncorrectIdsMap: any;
  hoveredColumnIdRef: MutableRefObject<string | null>;
  hoveredTeacherColumnId: string | null;
  onDropResult: (columnId: string | null, correct: boolean) => void;
}) => {
  const {
    chip,
    setCorrectChips,
    setHoveredColumnId,
    setIncorrectIdsMap,
    hoveredColumnIdRef,
    hoveredTeacherColumnId,
    onDropResult,
  } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);

  const isHoveredByTeacher =
    hoveredTeacherColumnId !== null &&
    String(chip.columnId) === hoveredTeacherColumnId;

  const resolveHoveredColumnId = useCallback(() => {
    const draggableEl = document.getElementById("draggable-" + chip.id);
    if (!draggableEl) return null;
    const draggableRect = draggableEl.getBoundingClientRect();
    const root = draggableEl.closest(".match-word-column");
    if (!root) return null;
    const wrappers = root.querySelectorAll(".answer-wrapper");
    let found: string | null = null;
    Array.from(wrappers).forEach((w) => {
      if (rectsIntersect(draggableRect, w.getBoundingClientRect())) {
        // id = answer-wrapper-{columnId}
        found = String(w.id.replace(/^answer-wrapper-/, ""));
      }
    });
    return found;
  }, [chip.id]);

  const handleDrag = useCallback(
    (_chip: TSortedWord, nextX: number, nextY: number) => {
      setX(nextX);
      setY(nextY);
      try {
        const hoveredId = resolveHoveredColumnId();
        hoveredColumnIdRef.current = hoveredId;
        setHoveredColumnId(hoveredId);
      } catch {
        hoveredColumnIdRef.current = null;
        setHoveredColumnId(null);
      }
    },
    [hoveredColumnIdRef, resolveHoveredColumnId, setHoveredColumnId],
  );

  const onStart = useCallback(() => {
    hoveredColumnIdRef.current = null;
    setHoveredColumnId(null);
    onDropResult(null, false);
  }, [hoveredColumnIdRef, onDropResult, setHoveredColumnId]);

  return (
    <Draggable
      key={chip.id}
      handle=".handle"
      position={{ x, y }}
      scale={1}
      onStart={onStart}
      onDrag={(_e, data) => handleDrag(chip, data.x, data.y)}
      onStop={() => {
        // Final hit-test on release (last onDrag can be stale / miss)
        let hoveredId = resolveHoveredColumnId();
        if (!hoveredId) {
          hoveredId = hoveredColumnIdRef.current;
        }

        const correctId = String(chip.columnId);
        const isCorrectDrop = hoveredId !== null && hoveredId === correctId;

        hoveredColumnIdRef.current = null;
        setHoveredColumnId(null);
        onDropResult(hoveredId, isCorrectDrop);

        if (!isCorrectDrop) {
          setIsError(true);
          setX(0);
          setY(0);
          setTimeout(() => {
            setIsError(false);
          }, 2000);

          if (hoveredId) {
            setIncorrectIdsMap((m) => {
              const missedWords = m?.[hoveredId] || [];
              if (!missedWords.includes(chip.word)) {
                missedWords.push(chip.word);
              }
              return {
                ...m,
                [hoveredId]: missedWords,
              };
            });
          }
          return;
        }
        setCorrectChips((chips) => {
          if (chips.some((c) => c.id === chip.id || c.word === chip.word)) {
            return chips;
          }
          return chips.concat(chip);
        });
        setX(0);
        setY(0);
      }}
    >
      <Chip
        color={isHoveredByTeacher ? "success" : isError ? "danger" : "primary"}
        style={{ zIndex: 1, cursor: "pointer" }}
        id={"draggable-" + chip.id}
        className={`handle chip-handle exercise-chip cursor-pointer text-[18px] ${styles.draggableChip}`}
      >
        {chip.word}
      </Chip>
    </Draggable>
  );
};

export const MatchWordColumnExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);
  const [correctChips, setCorrectChips] = useState<TSortedWord[]>([]);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const hoveredColumnIdRef = useRef<string | null>(null);
  const [dropFlash, setDropFlash] = useState<{
    columnId: string;
    correct: boolean;
  } | null>(null);
  const dropFlashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [hoveredTeacherColumnId, setHoveredTeacherColumnId] = useState<
    string | null
  >(null);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState<
    Record<string, string[]>
  >({});

  const { writeAnswer, answers, getAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode,
  });

  const onDropResult = useCallback(
    (columnId: string | null, correct: boolean) => {
      if (dropFlashTimeoutRef.current) {
        clearTimeout(dropFlashTimeoutRef.current);
        dropFlashTimeoutRef.current = null;
      }
      if (!columnId) {
        setDropFlash(null);
        return;
      }
      setDropFlash({ columnId, correct });
      dropFlashTimeoutRef.current = setTimeout(() => {
        setDropFlash(null);
        dropFlashTimeoutRef.current = null;
      }, 1200);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (dropFlashTimeoutRef.current) {
        clearTimeout(dropFlashTimeoutRef.current);
      }
    };
  }, []);

  const sortedChips = useMemo(() => {
    const copy = [...data.columns];
    const allWords: TSortedWord[] = copy.reduce((acc: TSortedWord[], val) => {
      return acc.concat(
        val.words.map((word, wordIndex) => {
          return {
            word,
            // Stable id — do NOT encode columnId via "word-columnId" (breaks on hyphenated words)
            id: `${val.id}__${wordIndex}__${word}`,
            columnId: val.id,
          };
        }),
      );
    }, []);
    return allWords
      .filter((wChip) => {
        return (
          !correctChips.find(
            (correctChip) => correctChip.word === wChip.word,
          ) && !!wChip.word
        );
      })
      .sort(() => 0.5 - Math.random());
  }, [correctChips?.length, data.columns]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          const parsedIds = JSON.parse(a?.[data.id]?.answer || "{}");
          setCorrectChips(parsedIds?.correctIds || []);
          setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
        } catch (err) {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  // Only mirror server answers when teacher is viewing a student —
  // otherwise empty poll wipes local practice drops.
  useEffect(() => {
    if (!isTeacher || !rest.activeStudentId) {
      return;
    }
    try {
      const raw = answers[data.id]?.answer;
      if (!raw) {
        setCorrectChips([]);
        setIncorrectIdsMap({});
        return;
      }
      const parsedIds = JSON.parse(raw);
      setCorrectChips(parsedIds?.correctIds || []);
      setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
    } catch (err) {
      setCorrectChips([]);
      setIncorrectIdsMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher, rest.activeStudentId]);

  useEffect(() => {
    if (correctChips.length || Object.keys(incorrectIdsMap)?.length) {
      writeAnswer(
        data.id,
        JSON.stringify({ correctIds: correctChips, incorrectIdsMap }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctChips.length, writeAnswer, incorrectIdsMap]);

  return (
    <div
      className={`${styles.root} py-4 sm:py-6 md:py-7 lg:py-8 w-full exercise-view-shell max-w-[886px] mx-auto exercise-view-head match-word-column`}
      id={`ex-${ex_id}`}
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
      <div className="h-10" />
      {!!image && (
        <div className="w-full max-w-full min-w-0">
          <Zoom>
            <img
              src={image.dataURL}
              alt=""
              className="block max-w-full h-auto max-h-[min(50vh,400px)] object-contain mx-auto"
            />
          </Zoom>
        </div>
      )}
      <div
        className={`pb-4 sm:pb-6 md:pb-7 lg:pb-8 w-full max-w-[886px] mx-auto`}
      >
        <div
          style={{
            margin: "0 auto",
          }}
        >
          <div className={styles.chipPool}>
            {sortedChips.map((chip) => {
              return (
                <DraggableItem
                  chip={chip}
                  key={chip.id}
                  setCorrectChips={setCorrectChips}
                  setHoveredColumnId={setHoveredColumnId}
                  setIncorrectIdsMap={setIncorrectIdsMap}
                  hoveredColumnIdRef={hoveredColumnIdRef}
                  hoveredTeacherColumnId={hoveredTeacherColumnId}
                  onDropResult={onDropResult}
                />
              );
            })}
          </div>
          {!!data?.columns?.length && (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 w-full min-w-0">
              {data?.columns?.map((column) => {
                const columnKey = String(column.id);
                const isHoveredTarget = hoveredColumnId === columnKey;
                const isDropFlashOk =
                  dropFlash?.columnId === columnKey && dropFlash.correct;
                const isDropFlashBad =
                  dropFlash?.columnId === columnKey && !dropFlash.correct;

                const correctedChipsToRender = correctChips?.filter(
                  (correctChip) => {
                    return (
                      String(correctChip.columnId) === columnKey ||
                      column.words.includes(correctChip.word)
                    );
                  },
                );

                const errorChipToRender = (
                  incorrectIdsMap?.[column?.id] ||
                  incorrectIdsMap?.[columnKey] ||
                  []
                ).filter((incorrectWord) => {
                  return !correctedChipsToRender.some(
                    (c) => c.word === incorrectWord,
                  );
                });

                return (
                  <Card
                    key={column.id}
                    className="answer-wrapper w-full min-w-0 p-3 sm:p-6 md:w-[calc(50%-0.5rem)] lg:w-[47%]"
                    id={"answer-wrapper-" + column.id}
                    onMouseOver={() => {
                      if (isTeacher && !rest?.isPresentationMode) {
                        setHoveredTeacherColumnId(columnKey);
                      }
                    }}
                    onMouseLeave={() => {
                      if (isTeacher && !rest?.isPresentationMode) {
                        setHoveredTeacherColumnId(null);
                      }
                    }}
                  >
                    <p className="break-words text-center text-base font-semibold sm:text-xl">
                      {column.title}
                    </p>
                    <Card
                      shadow="none"
                      className={`mt-4 p-2 ${styles.columnDrop}`}
                      style={{
                        width: "100%",
                        border: isDropFlashOk
                          ? "2px solid #219F59"
                          : isDropFlashBad
                            ? "2px solid rgb(164, 41, 41)"
                            : isHoveredTarget
                              ? "2px dashed #006FEE"
                              : "2px solid transparent",
                        background: isDropFlashOk
                          ? "#E9FEE8"
                          : isDropFlashBad
                            ? "#fdd0df"
                            : isHoveredTarget
                              ? "#EEF6FF"
                              : "transparent",
                      }}
                    >
                      {correctedChipsToRender.map((chip) => {
                        return (
                          <Card
                            className="p-4 mb-4"
                            key={chip.word + chip.id}
                            shadow="none"
                            style={{
                              border: "2px solid #219F59",
                              background: "#E9FEE8",
                            }}
                          >
                            {chip.word}
                          </Card>
                        );
                      })}
                      {isTeacher &&
                        errorChipToRender.map((chip: string) => {
                          return (
                            <Card
                              className="p-4 mb-4"
                              key={chip}
                              shadow="none"
                              style={{
                                border: "2px solid rgb(164, 41, 41)",
                                background: "#fdd0df",
                              }}
                            >
                              {chip}
                            </Card>
                          );
                        })}
                    </Card>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
