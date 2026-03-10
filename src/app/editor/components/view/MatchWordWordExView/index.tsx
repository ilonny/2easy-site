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
import { TMatch, TMatchWordWordData } from "../../editor/MatchWordWord/types";
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

type TProps = {
  data: TMatchWordWordData;
  isPreview?: boolean;
};

export const MatchWordWordExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const { profile } = useContext(AuthContext);
  const image = data?.images?.[0];

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers, setAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
    isPresentationMode: rest?.isPresentationMode,
  });

  const [selectedMatchId, setSelectedMatchId] = useState<string | undefined>(
    undefined
  );

  const [incorrectId, setIncorrectId] = useState<string | undefined>(undefined);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState({});

  const sortOrderRef = useRef<{
    leftOrder: string[];
    rightOrder: string[];
    exerciseKey: string;
  } | null>(null);

  const sortedMatches = useMemo(() => {
    const initialArr = [...data.matches];
    const restMatches = initialArr.filter((r) => !correctIds.includes(r.id));
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

    return restLeft.map((leftId, i) => {
      const rightId = restRight[i];
      const leftMatch = matchesById[leftId];
      const rightMatch = matchesById[rightId];
      return {
        id: leftMatch.id,
        value: leftMatch.value,
        answer: leftMatch.correctValue,
        correctValue: rightMatch.correctValue,
        correctId: rightMatch.id,
      };
    });
  }, [data.matches, data.id, correctIds, lesson_id, ex_id, rest.isView]);

  const correctedMatches = useMemo(() => {
    const initialArr = [...data.matches];
    return initialArr.filter((r) => correctIds.includes(r.id));
  }, [data.matches, correctIds]);

  const incorrectedMatches = useMemo(() => {
    const initialArr = [...data.matches];
    return initialArr
      .filter((r) => incorrectIdsMap?.[r.id] && !correctIds.includes(r.id))
      .map((el) => {
        return { ...el, selectedValue: incorrectIdsMap?.[el.id] };
      });
  }, [data.matches, correctIds, incorrectIdsMap]);

  const onClickAnswer = useCallback(
    (id: string) => {
      const m = sortedMatches.find((m) => m?.correctId === id);
      const selectedM = sortedMatches.find((m) => m?.id === selectedMatchId);

      const isCorrect = selectedM?.id === id;

      if (isCorrect) {
        setCorrectIds((ids) => ids.concat(id));
      } else {
        if (!selectedM) {
          return
        }
        setIncorrectId(m?.id);
        setTimeout(() => {
          setIncorrectId(undefined);
        }, 2000);
        setIncorrectIdsMap((incorrectIds) => {
          return {
            ...incorrectIds,
            [selectedM.id]: m?.correctValue,
          };
        });
      }
    },
    [sortedMatches, selectedMatchId]
  );

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          const parsedIds = JSON.parse(answers[data.id]?.answer);
          setCorrectIds(parsedIds?.correctIds);
        } catch (err) {}
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student_id]);

  useEffect(() => {
    if (!answers && !isTeacher) {
      return;
    }
    try {
      const parsedIds = JSON.parse(answers[data.id]?.answer);
      setCorrectIds(parsedIds?.correctIds);
      setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher]);

  useEffect(() => {
    if (correctIds.length || Object.keys(incorrectIdsMap)?.length) {
      writeAnswer(data.id, JSON.stringify({ correctIds, incorrectIdsMap }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctIds, writeAnswer, incorrectIdsMap]);

  return (
    <>
      <div className={`py-8 w-[100%] max-w-[766px] m-auto`}>
        <p
          style={{
            color: data.titleColor,
            fontSize: 38,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.title}
        </p>
        <p
          style={{
            fontSize: 24,
            textAlign: "center",
            fontWeight: 700,
            textTransform: "uppercase",
          }}
        >
          {data.subtitle}
        </p>
        {!!data.description && (
          <p
            style={{
              fontSize: 20,
              textAlign: "center",
              whiteSpace: "pre-line",
            }}
          >
            {data.description}
          </p>
        )}
      </div>
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
        <div
          className={` flex items-center justify-center flex-wrap`}
          style={{ margin: "0 auto" }}
        >
          {sortedMatches.map((m) => {
            let bgColor = "";
            if (correctIds.includes(m.correctId)) {
              bgColor = "#E9FEE8";
            }

            if (m.id === incorrectId) {
              bgColor = "#FBE6E5";
            }

            return (
              <div className="flex items-start gap-4 w-[100%] mb-4" key={m.id}>
                <div
                  className=" w-[50%] radius-10"
                  onClick={() => setSelectedMatchId(m.id)}
                >
                  <Card
                    shadow="none"
                    radius="sm"
                    className="p-4"
                    style={{
                      cursor: "pointer",
                      border:
                        m.id === selectedMatchId
                          ? "2px solid #3f28c6"
                          : "2px solid transparent",
                      whiteSpace: "break-spaces",
                      boxShadow: "rgba(144, 137, 164, 0.15) 0px 8px 24px 0px",
                      fontWeight: "700",
                      fontSize: 18,
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div
                  className=" w-[50%] radius-10"
                  onClick={() => onClickAnswer(m.correctId)}
                >
                  <Card
                    className="p-4"
                    radius="sm"
                    style={{
                      cursor: "pointer",
                      background:
                        !rest.isPresentationMode &&
                        (profile?.role_id === 2 || profile?.role_id === 1) &&
                        selectedMatchId &&
                        m.correctId === selectedMatchId
                          ? "#E9FEE8"
                          : bgColor,
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
                className="flex items-start gap-4 w-[100%] mb-4 relative"
                key={m.id}
              >
                <div className=" w-[50%] radius-10 relative">
                  <div
                    className="line"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "0%",
                      background: "rgb(33, 159, 89)",
                      height: 2,
                      width: 100,
                      marginRight: -30,
                    }}
                  ></div>
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="p-8"
                    style={{
                      cursor: "pointer",
                      border: "2px solid rgb(164, 41, 41) ",
                      background: "#fdd0df",
                      whiteSpace: "break-spaces",
                      fontWeight: "700",
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div className=" w-[50%] radius-10">
                  <Card
                    className="p-8"
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
                className="flex items-start gap-4 w-[100%] mb-4 relative"
                key={m.id}
              >
                <div className=" w-[50%] radius-10 relative">
                  <div
                    className="line"
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "0%",
                      background: "rgb(33, 159, 89)",
                      height: 2,
                      width: 100,
                      marginRight: -30,
                    }}
                  ></div>
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="p-8"
                    style={{
                      cursor: "pointer",
                      border: "2px solid #219F59",
                      background: "#E9FEE8",
                      whiteSpace: "break-spaces",
                      fontWeight: "700",
                    }}
                  >
                    {m.value}
                  </Card>
                </div>
                <div className=" w-[50%] radius-10">
                  <Card
                    className="p-8"
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
    </>
  );
};
