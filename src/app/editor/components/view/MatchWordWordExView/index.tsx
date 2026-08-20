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

/** Детерминированная перестановка: одинаковый seed даёт одинаковый порядок */
function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const x = Math.sin(seed + i) * 10000;
    const j = Math.floor((x - Math.floor(x)) * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
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

  const { writeAnswer, answers, getAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode,
  });

  const [selectedLeftId, setSelectedLeftId] = useState<string | number | undefined>(undefined);
  const [selectedRightId, setSelectedRightId] = useState<string | number | undefined>(undefined);

  const [incorrectId, setIncorrectId] = useState<string | undefined>(undefined);
  const [correctIds, setCorrectIds] = useState<Array<string | number>>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState({});

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
        const seed = Number(lesson_id) * 10000 + Number(ex_id || 0);
        leftOrder = shuffleWithSeed(ids, seed);
        rightOrder = shuffleWithSeed(ids, seed + 1);
      } else {
        leftOrder = [...ids].sort(() => 0.5 - Math.random());
        rightOrder = [...ids].sort(() => 0.5 - Math.random());
      }
      sortOrderRef.current = { leftOrder, rightOrder, exerciseKey };
    }

    const { leftOrder, rightOrder } = sortOrderRef.current;
    const restIdsSet = new Set(restMatches.map((m) => m.id));
    const matchesById = Object.fromEntries(
      initialArr.map((m) => [m.id, m])
    );

    const restLeft = leftOrder.filter((id) => restIdsSet.has(id));
    const restRight = rightOrder.filter((id) => restIdsSet.has(id));

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

  const showIncorrect = useCallback((leftId: string | number, selectedValue: string | undefined) => {
    setIncorrectId(String(leftId));
    setTimeout(() => {
      setIncorrectId(undefined);
    }, 2000);
    setIncorrectIdsMap((incorrectIds) => {
      return {
        ...incorrectIds,
        [leftId]: selectedValue,
      };
    });
  }, []);

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
        setCorrectIds((ids) => ids.concat(leftId));
      } else {
        showIncorrect(leftId, rightM?.correctValue);
      }

      setSelectedLeftId(undefined);
      setSelectedRightId(undefined);
    },
    [selectedRightId, sortedMatches, showIncorrect]
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
        setCorrectIds((ids) => ids.concat(selectedLeftId));
      } else {
        showIncorrect(selectedLeftId, rightM?.correctValue);
      }

      setSelectedLeftId(undefined);
      setSelectedRightId(undefined);
    },
    [selectedLeftId, sortedMatches, showIncorrect]
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
    if (!isTeacher) {
      return;
    }
    // Only mirror student answers when viewing a student —
    // otherwise empty poll wipes local practice progress.
    if (!rest.activeStudentId) {
      return;
    }
    try {
      const raw = answers[data.id]?.answer ?? answers[String(data.id)]?.answer;
      if (!raw) {
        setCorrectIds([]);
        setIncorrectIdsMap({});
        return;
      }
      const parsedIds = parseSavedAnswer(raw);
      setCorrectIds(parsedIds?.correctIds || []);
      setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
    } catch {
      setCorrectIds([]);
      setIncorrectIdsMap({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher, rest.activeStudentId]);

  useEffect(() => {
    if (correctIds.length || Object.keys(incorrectIdsMap)?.length) {
      writeAnswer(data.id, JSON.stringify({ correctIds, incorrectIdsMap }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctIds, writeAnswer, incorrectIdsMap]);

  return (
    <div className="exercise-view-shell max-w-[886px]">
      <div className={`py-4 sm:py-6 md:py-7 lg:py-8 w-full max-w-[766px] mx-auto exercise-view-head`}>
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

            if (sameId(m.id, incorrectId)) {
              bgColor = "#FBE6E5";
            }

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
                      background:
                        !rest.isPresentationMode &&
                        (profile?.role_id === 2 || profile?.role_id === 1) &&
                        selectedRightId !== undefined &&
                        sameId(m.id, selectedRightId)
                          ? "#E9FEE8"
                          : undefined,
                      border:
                        sameId(m.id, selectedLeftId)
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
                      background:
                        !rest.isPresentationMode &&
                        (profile?.role_id === 2 || profile?.role_id === 1) &&
                        selectedLeftId !== undefined &&
                        sameId(m.correctId, selectedLeftId)
                          ? "#E9FEE8"
                          : bgColor,
                      border:
                        sameId(m.correctId, selectedRightId)
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
