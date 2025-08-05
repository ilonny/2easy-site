/* eslint-disable @next/next/no-img-element */
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Card } from "@nextui-org/react";
import { TMatch, TMatchWordWordData } from "../../editor/MatchWordWord/types";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
import { useParams } from "next/navigation";

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
  });

  const [selectedMatchId, setSelectedMatchId] = useState<number | undefined>(0);

  const [incorrectId, setIncorrectId] = useState(0);
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState({});

  const sortedMatches = useMemo(() => {
    const initialArr = [...data.matches];
    const restMatches = initialArr.filter((r) => !correctIds.includes(r.id));
    const randomKeys = restMatches
      .sort(() => 0.5 - Math.random())
      .map((m) => {
        return {
          id: m.id,
          value: m.value,
          answer: m.correctValue,
        };
      });
    const randomValues = restMatches
      .sort(() => 0.5 - Math.random())
      .map((m) => m.correctValue);

    return randomKeys.map((r, i) => {
      return {
        ...r,
        correctValue: randomValues[i],
        correctId: randomKeys?.find((r) => r.answer === randomValues[i])?.id,
      };
    });
  }, [data.matches, correctIds.length]);

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
    (id: number) => {
      const m = sortedMatches.find((m) => m.correctId === id);
      const selectedM = sortedMatches.find((m) => m.id === selectedMatchId);

      const isCorrect = selectedM.id === id;

      if (isCorrect) {
        setCorrectIds((ids) => ids.concat(id));
      } else {
        setIncorrectId(m.id);
        setTimeout(() => {
          setIncorrectId(0);
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
      <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
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
                    shadow="sm"
                    radius="sm"
                    className="p-4"
                    style={{
                      cursor: "pointer",
                      border:
                        m.id === selectedMatchId
                          ? "2px solid #3f28c6"
                          : "2px solid transparent",
                      whiteSpace: "break-spaces",
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
                    shadow="sm"
                    radius="sm"
                    style={{
                      cursor: "pointer",
                      background:
                        profile?.role_id === 2 &&
                        selectedMatchId &&
                        m.correctId === selectedMatchId
                          ? "#E9FEE8"
                          : bgColor,
                      whiteSpace: "break-spaces",
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
                <div
                  className="line"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    background: "fdd0df",
                    height: 2,
                    width: 100,
                    marginLeft: -30,
                  }}
                ></div>
                <div className=" w-[50%] radius-10">
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="p-8"
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
                <div
                  className="line"
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    background: "rgb(33, 159, 89)",
                    height: 2,
                    width: 100,
                    marginLeft: -30,
                  }}
                ></div>
                <div className=" w-[50%] radius-10">
                  <Card
                    shadow="sm"
                    radius="sm"
                    className="p-8"
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
