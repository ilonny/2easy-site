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

type TProps = {
  data: TMatchWordColumnData;
  isPreview?: boolean;
};

const DraggableItem = (props: {
  chip: TSortedWord;
  isIntersected: MutableRefObject<boolean>;
  setCorrectChips: Dispatch<SetStateAction<TSortedWord[]>>;
  setActiveChip: Dispatch<SetStateAction<TSortedWord | null | undefined>>;
}) => {
  const { chip, isIntersected, setCorrectChips, setActiveChip } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);

  const handleDrag = useCallback(
    (chip: TSortedWord, x: number, y: number) => {
      setActiveChip(chip);
      setX(x);
      setY(y);
      try {
        //@ts-ignore
        const draggableRect = document
          ?.getElementById("draggable-" + chip.id)
          .getBoundingClientRect();
        //@ts-ignore
        const droppableRect = document
          ?.getElementById(
            "answer-wrapper-" + chip?.id?.split("-")?.reverse()?.[0]
          )
          .getBoundingClientRect();
        const intersects = !(
          draggableRect.top > droppableRect.bottom ||
          draggableRect.bottom < droppableRect.top ||
          draggableRect.right < droppableRect.left ||
          draggableRect.left > droppableRect.right
        );
        isIntersected.current = intersects;
      } catch (err) {}
    },
    [isIntersected, setActiveChip]
  );

  return (
    <Draggable
      key={chip.id}
      handle=".handle"
      position={{ x, y }}
      scale={1}
      onDrag={(_e, data) => handleDrag(chip, data.x, data.y)}
      onStop={() => {
        setActiveChip(null);
        if (!isIntersected.current) {
          setIsError(true);
          setX(0);
          setY(0);
          setTimeout(() => {
            setIsError(false);
          }, 2000);
          return;
        }
        setCorrectChips((chips) => chips.concat(chip));
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

type TSortedWord = { word: string; id: string };

export const MatchWordColumnExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);
  const isIntersected = useRef(false);
  const [correctChips, setCorrectChips] = useState<TSortedWord[]>([]);
  const [activeChip, setActiveChip] = useState<TSortedWord | null>();
  const isTeacher = profile?.role_id === 2;

  const lesson_id = useParams()?.id;
  const student_id = profile?.studentId;
  const ex_id = data?.id;

  const { writeAnswer, answers, getAnswers, setAnswers } = useExAnswer({
    student_id,
    lesson_id,
    ex_id,
    activeStudentId: rest.activeStudentId,
    isTeacher,
  });

  const sortedChips = useMemo(() => {
    const copy = [...data.columns];
    const allWords: TSortedWord[] = copy.reduce((acc: TSortedWord[], val) => {
      return acc.concat(
        val.words.map((word) => {
          return {
            word,
            id: word + "-" + val.id,
          };
        })
      );
    }, []);
    return allWords
      .filter((wChip) => {
        return (
          !correctChips.find(
            (correctChip) => correctChip.word === wChip.word
          ) && !!wChip.word
        );
      })
      .sort(() => 0.5 - Math.random());
  }, [correctChips, data.columns]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        console.log("a", a);
        try {
          setCorrectChips(JSON.parse(a[data.id].answer));
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
      setCorrectChips(JSON.parse(answers[data.id].answer));
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher]);

  useEffect(() => {
    if (correctChips.length) {
      writeAnswer(data.id, JSON.stringify(correctChips));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctChips, writeAnswer]);

  return (
    <div className={`py-8 w-[886px] m-auto`}>
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
      <div className="h-10" />
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[886px] m-auto`}>
        <div
          style={{
            margin: "0 auto",
          }}
        >
          <div className="flex items-center wrap gap-4 justify-center m-auto mb-4 max-w-[500px] flex-wrap">
            {sortedChips.map((chip) => {
              return (
                <DraggableItem
                  chip={chip}
                  key={chip.id}
                  isIntersected={isIntersected}
                  setCorrectChips={setCorrectChips}
                  setActiveChip={setActiveChip}
                />
              );
            })}
          </div>
          {!!data?.columns?.length && (
            <div className="flex flex-wrap justify-center gap-4">
              {data?.columns?.map((column) => {
                const isCorrect =
                  !!correctChips.find((c) => c.word === activeChip?.word) ||
                  (isTeacher &&
                    column.id.toString() ===
                      (activeChip?.id.split("-")?.reverse()?.[0] || 0));
                return (
                  <Card key={column.id} className="w-[47%] p-6">
                    <p
                      style={{ fontWeight: 600, fontSize: 20 }}
                      className="text-center"
                    >
                      {column.title}
                    </p>
                    <Card
                      shadow="none"
                      className="mt-4 p-2"
                      id={"answer-wrapper-" + column.id}
                      style={{
                        minHeight: 250,
                        width: "100%",
                        border: isCorrect
                          ? "2px solid #219F59"
                          : "2px solid transparent",
                        background: isCorrect ? "#E9FEE8" : "transparent",
                      }}
                    >
                      {correctChips
                        ?.filter((correctChip) => {
                          return column.words.includes(correctChip.word);
                        })
                        .map((chip) => {
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
                      <>
                        <></>
                      </>
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
