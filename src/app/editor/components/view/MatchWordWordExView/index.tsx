/* eslint-disable @next/next/no-img-element */
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card } from "@nextui-org/react";
import { TMatchWordWordData } from "../../editor/MatchWordWord/types";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";
import { T } from "@/i18n/T";

/** Детерминированная перестановка: одинаковый seed даёт одинаковый порядок. */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed >>> 0 || 1;
  const rng = () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Правая колонка не должна совпасть с левой по индексу:
 * иначе слово и его определение стоят в одной строке.
 * Поворот детерминированный, чтобы учитель и ученик видели один порядок.
 */
function derangeAgainst<T>(left: T[], right: T[]): T[] {
  if (left.length !== right.length || left.length < 2) return right;
  const hasFixed = (arr: T[]) =>
    arr.some((id, i) => String(left[i]) === String(id));
  const n = right.length;
  for (let rot = 0; rot < n; rot++) {
    const rotated = right.map((_, i) => right[(i + rot) % n]);
    if (!hasFixed(rotated)) return rotated;
  }
  const out = [...right];
  for (let pass = 0; pass < n; pass++) {
    let moved = false;
    for (let i = 0; i < n; i++) {
      if (String(out[i]) !== String(left[i])) continue;
      for (let j = 0; j < n; j++) {
        if (j === i) continue;
        const nextI = out[j];
        const nextJ = out[i];
        if (String(nextI) === String(left[i])) continue;
        if (String(nextJ) === String(left[j])) continue;
        [out[i], out[j]] = [out[j], out[i]];
        moved = true;
        break;
      }
    }
    if (!hasFixed(out)) return out;
    if (!moved) break;
  }
  return out;
}

/** Saved answers often store numeric ids; exercise matches may keep them as strings. */
const sameId = (
  a: string | number | undefined | null,
  b: string | number | undefined | null
) => a != null && b != null && String(a) === String(b);

const hasId = (
  ids: Array<string | number> | undefined,
  id: string | number | undefined | null
) => !!ids?.some((x) => sameId(x, id));

const mapVal = (map: Record<string, any> | undefined, id: string | number) =>
  map?.[id as any] ?? map?.[String(id)];

const parseSavedAnswer = (raw: unknown) => {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, any>;
  try {
    return JSON.parse(String(raw));
  } catch {
    return {};
  }
};

type TProps = {
  data: TMatchWordWordData;
  isPreview?: boolean;
};

export const MatchWordWordExView: FC<TProps> = ({
  data,
  isPreview: _isPreview = false,
  ...rest
}) => {
  const { profile } = useContext(AuthContext);
  const image = data?.images?.[0];

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers, resetSeq } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode,
    syncRemoteToStudent: true,
  });

  const [selectedLeftId, setSelectedLeftId] = useState<string | number | undefined>(undefined);
  const [selectedRightId, setSelectedRightId] = useState<string | number | undefined>(undefined);

  const [wrongFlash, setWrongFlash] = useState<{
    leftId: string;
    rightId: string;
  } | null>(null);
  const wrongFlashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [correctIds, setCorrectIds] = useState<Array<string | number>>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState<Record<string, any>>({});

  const lastHydratedRawRef = useRef<string>("");

  const persist = useCallback(
    (
      nextCorrect: Array<string | number>,
      nextIncorrect: Record<string, any>
    ) => {
      if (!nextCorrect.length && !Object.keys(nextIncorrect).length) return;
      const payload = JSON.stringify({
        correctIds: nextCorrect,
        incorrectIdsMap: nextIncorrect,
      });
      lastHydratedRawRef.current = payload;
      void writeAnswer(data.id, payload);
    },
    [data.id, writeAnswer]
  );

  useEffect(() => {
    lastHydratedRawRef.current = "";
    setCorrectIds([]);
    setIncorrectIdsMap({});
    setSelectedLeftId(undefined);
    setSelectedRightId(undefined);
    setWrongFlash(null);
    if (wrongFlashTimer.current) clearTimeout(wrongFlashTimer.current);
  }, [resetSeq]);

  useEffect(() => {
    return () => {
      if (wrongFlashTimer.current) clearTimeout(wrongFlashTimer.current);
    };
  }, []);

  const sortOrderRef = useRef<{
    leftOrder: string[];
    rightOrder: string[];
    exerciseKey: string;
  } | null>(null);

  const sortedMatches = useMemo(() => {
    const initialArr = [...(data.matches || [])];
    const restMatches = initialArr.filter((r) => !hasId(correctIds, r.id));
    const isLessonMode =
      rest.isView && lesson_id && Number(lesson_id) > 0;
    const exerciseKey = `${data.id}-${initialArr.map((m) => m.id).join(",")}-${isLessonMode}`;

    if (
      !sortOrderRef.current ||
      sortOrderRef.current.exerciseKey !== exerciseKey
    ) {
      const ids = initialArr.map((m) => m.id);
      let leftOrder: string[];
      let rightOrder: string[];

      if (isLessonMode) {
        const seed = hashSeed(`${lesson_id}:${ex_id}:mww`);
        leftOrder = shuffleWithSeed(ids, seed);
        rightOrder = derangeAgainst(
          leftOrder,
          shuffleWithSeed(ids, seed ^ 0x9e3779b9)
        );
      } else {
        leftOrder = shuffleWithSeed(ids, (Math.random() * 0x100000000) >>> 0);
        rightOrder = derangeAgainst(
          leftOrder,
          shuffleWithSeed(ids, (Math.random() * 0x100000000) >>> 0)
        );
      }
      sortOrderRef.current = { leftOrder, rightOrder, exerciseKey };
    }

    const { leftOrder, rightOrder } = sortOrderRef.current;
    const restIdsSet = new Set(restMatches.map((m) => m.id));
    const matchesById = Object.fromEntries(
      initialArr.map((m) => [m.id, m])
    );

    const restLeft = leftOrder.filter((id) => restIdsSet.has(id));
    const restRight = derangeAgainst(
      restLeft,
      rightOrder.filter((id) => restIdsSet.has(id))
    );

    return restLeft
      .map((leftId, i) => {
        const rightId = restRight[i];
        const leftMatch = matchesById[leftId];
        const rightMatch = matchesById[rightId];
        if (!leftMatch || !rightMatch) return null;
        return {
          id: leftMatch.id,
          value: leftMatch.value,
          answer: leftMatch.correctValue,
          correctValue: rightMatch.correctValue,
          correctId: rightMatch.id,
        };
      })
      .filter(Boolean);
  }, [data.matches, data.id, correctIds, lesson_id, ex_id, rest.isView]);

  const correctedMatches = useMemo(() => {
    const initialArr = [...(data.matches || [])];
    return initialArr.filter((r) => hasId(correctIds, r.id));
  }, [data.matches, correctIds]);

  const incorrectedMatches = useMemo(() => {
    const initialArr = [...(data.matches || [])];
    return initialArr
      .filter((r) => mapVal(incorrectIdsMap, r.id) && !hasId(correctIds, r.id))
      .map((el) => {
        return { ...el, selectedValue: mapVal(incorrectIdsMap, el.id) };
      });
  }, [data.matches, correctIds, incorrectIdsMap]);

  const showIncorrect = useCallback(
    (
      leftId: string | number,
      rightId: string | number,
      selectedValue: string | undefined
    ) => {
      const flash = { leftId: String(leftId), rightId: String(rightId) };
      setWrongFlash(flash);
      if (wrongFlashTimer.current) clearTimeout(wrongFlashTimer.current);
      wrongFlashTimer.current = setTimeout(() => {
        setWrongFlash((cur) =>
          cur && cur.leftId === flash.leftId && cur.rightId === flash.rightId
            ? null
            : cur
        );
      }, 2000);
      setIncorrectIdsMap((incorrectIds) => {
        const next = {
          ...incorrectIds,
          [leftId]: selectedValue,
        };
        persist(correctIds, next);
        return next;
      });
    },
    [correctIds, persist]
  );

  const onClickLeft = useCallback(
    (leftId: string | number) => {
      if (selectedRightId === undefined) {
        setSelectedLeftId(leftId);
        return;
      }

      const rightM = sortedMatches.find((m) =>
        sameId(m?.correctId, selectedRightId)
      );
      const isCorrect = sameId(leftId, selectedRightId);

      if (isCorrect) {
        setCorrectIds((ids) => {
          const next = hasId(ids, leftId) ? ids : ids.concat(leftId);
          persist(next, incorrectIdsMap);
          return next;
        });
      } else {
        showIncorrect(leftId, selectedRightId, rightM?.correctValue);
      }

      setSelectedLeftId(undefined);
      setSelectedRightId(undefined);
    },
    [selectedRightId, sortedMatches, showIncorrect, incorrectIdsMap, persist]
  );

  const onClickRight = useCallback(
    (rightId: string | number) => {
      if (selectedLeftId === undefined) {
        setSelectedRightId(rightId);
        return;
      }

      const rightM = sortedMatches.find((m) => sameId(m?.correctId, rightId));
      const isCorrect = sameId(selectedLeftId, rightId);

      if (isCorrect) {
        setCorrectIds((ids) => {
          const next = hasId(ids, selectedLeftId)
            ? ids
            : ids.concat(selectedLeftId);
          persist(next, incorrectIdsMap);
          return next;
        });
      } else {
        showIncorrect(selectedLeftId, rightId, rightM?.correctValue);
      }

      setSelectedLeftId(undefined);
      setSelectedRightId(undefined);
    },
    [selectedLeftId, sortedMatches, showIncorrect, incorrectIdsMap, persist]
  );

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          const parsedIds = parseSavedAnswer(
            a?.[data.id]?.answer ?? a?.[String(data.id)]?.answer
          );
          setCorrectIds(parsedIds?.correctIds || []);
          setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
        } catch {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  useEffect(() => {
    const hasTarget = isTeacher ? !!rest.activeStudentId : !!student_id;
    if (!hasTarget) return;
    try {
      const raw = answers[data.id]?.answer ?? answers[String(data.id)]?.answer;
      if (!raw) {
        // Empty poll must not wipe in-progress student work; real reset uses resetSeq.
        if (isTeacher) {
          lastHydratedRawRef.current = "";
          setCorrectIds([]);
          setIncorrectIdsMap({});
        }
        return;
      }
      if (raw === lastHydratedRawRef.current) return;
      const parsedIds = parseSavedAnswer(raw);
      lastHydratedRawRef.current = raw;
      setCorrectIds(parsedIds?.correctIds || []);
      setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
    } catch {
      if (isTeacher) {
        lastHydratedRawRef.current = "";
        setCorrectIds([]);
        setIncorrectIdsMap({});
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher, rest.activeStudentId, student_id]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
        {isTeacher &&
          rest.isView &&
          !rest?.isPresentationMode &&
          !rest.activeStudentId && (
            <p className="mb-3 text-sm text-[#767676]">
              <T k="lessons.selectStudentToSeeAnswers" />
            </p>
          )}
        <p
          className="exercise-view-title"
          style={{
            color: data.titleColor,
          }}
        >
          {data.title}
        </p>
        <p className="exercise-view-subtitle">
          {data.subtitle}
        </p>
        {!!data.description && (
          <p className="exercise-view-desc">
            {data.description}
          </p>
        )}
      </div>
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
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[886px] mx-auto`}>
        <div className="flex flex-col items-stretch justify-center mx-auto w-full min-w-0">
          {sortedMatches.map((m) => {
            let bgColor = "";
            if (hasId(correctIds, m.correctId)) {
              bgColor = "#E9FEE8";
            }

            const leftIsWrong =
              !!wrongFlash && sameId(m.id, wrongFlash.leftId);
            const rightIsWrong =
              !!wrongFlash && sameId(m.correctId, wrongFlash.rightId);
            const hintLeft =
              !rest.isPresentationMode &&
              isTeacher &&
              selectedRightId !== undefined &&
              sameId(m.id, selectedRightId);
            const hintRight =
              !rest.isPresentationMode &&
              isTeacher &&
              selectedLeftId !== undefined &&
              sameId(m.correctId, selectedLeftId);

            return (
              <div
                className="mb-3 flex w-full min-w-0 flex-row items-stretch gap-1.5 sm:mb-4 sm:gap-3 md:gap-4"
                key={m.id}
              >
                <div
                  className="w-1/2 min-w-0 basis-1/2 radius-10 touch-manipulation"
                  onClick={() => onClickLeft(m.id)}
                >
                  <Card
                    shadow="none"
                    radius="sm"
                    className="h-full min-h-[3rem] p-1.5 text-xs font-bold [overflow-wrap:anywhere] break-words sm:min-h-[3.5rem] sm:p-3 sm:text-base md:p-4 md:text-[18px]"
                    style={{
                      cursor: "pointer",
                      background: leftIsWrong
                        ? "#FBE6E5"
                        : hintLeft
                          ? "#E9FEE8"
                          : undefined,
                      border: leftIsWrong
                        ? "2px solid rgb(164, 41, 41)"
                        : sameId(m.id, selectedLeftId)
                          ? "2px solid #3f28c6"
                          : "2px solid transparent",
                      whiteSpace: "break-spaces",
                      boxShadow: "rgba(144, 137, 164, 0.15) 0px 8px 24px 0px",
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div
                  className="w-1/2 min-w-0 basis-1/2 radius-10 touch-manipulation"
                  onClick={() => onClickRight(m.correctId)}
                >
                  <Card
                    className="h-full min-h-[3rem] p-1.5 text-xs [overflow-wrap:anywhere] break-words sm:min-h-[3.5rem] sm:p-3 sm:text-base md:p-4"
                    radius="sm"
                    style={{
                      cursor: "pointer",
                      background: rightIsWrong
                        ? "#FBE6E5"
                        : hintRight
                          ? "#E9FEE8"
                          : bgColor,
                      border: rightIsWrong
                        ? "2px solid rgb(164, 41, 41)"
                        : sameId(m.correctId, selectedRightId)
                          ? "2px solid #3f28c6"
                          : "2px solid transparent",
                      whiteSpace: "break-spaces",
                      boxShadow: "rgba(144, 137, 164, 0.15) 0px 8px 24px 0px",
                    }}
                  >
                    {m.correctValue}
                  </Card>
                </div>
              </div>
            );
          })}

          {incorrectedMatches.map((m) => {
            return (
              <div
                className="relative mb-3 flex w-full min-w-0 flex-row items-start gap-1.5 sm:mb-4 sm:gap-3 md:gap-4"
                key={m.id}
              >
                <div className="relative w-1/2 min-w-0 basis-1/2 radius-10">
                  <div
                    className="pointer-events-none absolute top-1/2 left-full z-0 hidden h-0.5 w-8 -translate-y-1/2 bg-[rgb(33,159,89)] sm:block sm:w-20 md:w-[100px]"
                  />
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="relative z-[1] p-1.5 text-xs font-bold [overflow-wrap:anywhere] break-words sm:p-4 sm:text-base md:p-6 lg:p-8"
                    style={{
                      cursor: "pointer",
                      border: "2px solid rgb(164, 41, 41) ",
                      background: "#fdd0df",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div className="w-1/2 min-w-0 basis-1/2 radius-10">
                  <Card
                    className="p-1.5 text-xs [overflow-wrap:anywhere] break-words sm:p-4 sm:text-base md:p-6 lg:p-8"
                    shadow="sm"
                    radius="sm"
                    style={{
                      border: "2px solid rgb(164, 41, 41) ",
                      background: "#fdd0df",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {m.selectedValue}
                  </Card>
                </div>
              </div>
            );
          })}
          {correctedMatches.map((m) => {
            return (
              <div
                className="relative mb-3 flex w-full min-w-0 flex-row items-start gap-1.5 sm:mb-4 sm:gap-3 md:gap-4"
                key={m.id}
              >
                <div className="relative w-1/2 min-w-0 basis-1/2 radius-10">
                  <div
                    className="pointer-events-none absolute top-1/2 left-full z-0 hidden h-0.5 w-8 -translate-y-1/2 bg-[rgb(33,159,89)] sm:block sm:w-20 md:w-[100px]"
                  />
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="relative z-[1] p-1.5 text-xs font-bold [overflow-wrap:anywhere] break-words sm:p-4 sm:text-base md:p-6 lg:p-8"
                    style={{
                      cursor: "pointer",
                      border: "2px solid #219F59",
                      background: "#E9FEE8",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div className="w-1/2 min-w-0 basis-1/2 radius-10">
                  <Card
                    className="p-1.5 text-xs [overflow-wrap:anywhere] break-words sm:p-4 sm:text-base md:p-6 lg:p-8"
                    shadow="sm"
                    radius="sm"
                    style={{
                      background: "#E9FEE8",
                      border: "2px solid #219F59",
                      whiteSpace: "break-spaces",
                    }}
                  >
                    {m.correctValue}
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
