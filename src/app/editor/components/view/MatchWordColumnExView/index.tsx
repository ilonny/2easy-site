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
  setActiveChip: Dispatch<SetStateAction<TSortedWord | null | undefined>>;
  setHoveredColumnId: Dispatch<SetStateAction<string | null>>;
  setIncorrectIdsMap: any;
  hoveredColumnIdRef: MutableRefObject<string | null>;
}) => {
  const {
    chip,
    setCorrectChips,
    setActiveChip,
    setHoveredColumnId,
    setIncorrectIdsMap,
    hoveredColumnIdRef,
  } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);

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
      setActiveChip(chip);
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
    [chip, hoveredColumnIdRef, resolveHoveredColumnId, setActiveChip, setHoveredColumnId],
  );

  const onStart = useCallback(() => {
    hoveredColumnIdRef.current = null;
    setHoveredColumnId(null);
    setActiveChip(chip);
  }, [chip, hoveredColumnIdRef, setActiveChip, setHoveredColumnId]);

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

        setActiveChip(null);
        hoveredColumnIdRef.current = null;
        setHoveredColumnId(null);

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
        color={isError ? "danger" : "primary"}
        style={{ zIndex: 1, cursor: "pointer", maxWidth: 800 }}
        id={"draggable-" + chip.id}
        className="handle text-[18px] cursor-pointer max-w-[800px] chip-handle"
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
  const [activeChip, setActiveChip] = useState<TSortedWord | null>();
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);
  const hoveredColumnIdRef = useRef<string | null>(null);
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
          <div
            className="
              flex
              items-center
              wrap
              gap-4
              justify-center
              m-auto
              py-4
              flex-wrap
              shadow-lg
              top-[80px]
              lg:top-[0px]
            "
            style={{
              position: "sticky",
              zIndex: 2,
              background: "#fff",
              borderRadius: 10,
            }}
          >
            {sortedChips.map((chip) => {
              return (
                <DraggableItem
                  chip={chip}
                  key={chip.id}
                  setCorrectChips={setCorrectChips}
                  setActiveChip={setActiveChip}
                  setHoveredColumnId={setHoveredColumnId}
                  setIncorrectIdsMap={setIncorrectIdsMap}
                  hoveredColumnIdRef={hoveredColumnIdRef}
                />
              );
            })}
          </div>
          {!!data?.columns?.length && (
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 w-full min-w-0">
              {data?.columns?.map((column) => {
                const columnKey = String(column.id);
                // Green = chip is currently over THIS column (valid hover), not "answer key"
                const isHoveredTarget = hoveredColumnId === columnKey;
                const isCorrectHover =
                  isHoveredTarget &&
                  activeChip &&
                  String(activeChip.columnId) === columnKey;
                const isWrongHover =
                  isHoveredTarget &&
                  activeChip &&
                  String(activeChip.columnId) !== columnKey;

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
                    className="w-full md:w-[calc(50%-0.5rem)] lg:w-[47%] min-w-0 p-4 sm:p-6 answer-wrapper"
                    id={"answer-wrapper-" + column.id}
                  >
                    <p className="text-center font-semibold text-lg sm:text-xl break-words">
                      {column.title}
                    </p>
                    <Card
                      shadow="none"
                      className="mt-4 p-2"
                      style={{
                        minHeight: 250,
                        width: "100%",
                        border: isCorrectHover
                          ? "2px solid #219F59"
                          : isWrongHover
                            ? "2px solid rgb(164, 41, 41)"
                            : "2px solid transparent",
                        background: isCorrectHover
                          ? "#E9FEE8"
                          : isWrongHover
                            ? "#fdd0df"
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
