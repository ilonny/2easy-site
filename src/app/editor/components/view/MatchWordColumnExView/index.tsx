/* eslint-disable @next/next/no-img-element */
import {
  Dispatch,
  FC,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card, Chip } from "@nextui-org/react";
import Draggable from "react-draggable";
import { AuthContext } from "@/auth";
import { TMatchWordColumnData } from "../../editor/MatchWordColumn/types";

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
        // console.log("draggableRect?", draggableRect);
        //@ts-ignore
        const droppableRect = document
          ?.getElementById(
            "answer-wrapper-" + chip?.id?.split("-")?.reverse()?.[0]
          )
          .getBoundingClientRect();
        // console.log("droppableRect?", droppableRect);
        const intersects = !(
          draggableRect.top > droppableRect.bottom ||
          draggableRect.bottom < droppableRect.top ||
          draggableRect.right < droppableRect.left ||
          draggableRect.left > droppableRect.right
        );
        isIntersected.current = intersects;
        console.log("intersects?", intersects);
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
        style={{ zIndex: 1, cursor: "pointer" }}
        id={"draggable-" + chip.id}
        className="handle"
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
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);
  const isIntersected = useRef(false);
  const [correctChips, setCorrectChips] = useState<TSortedWord[]>([]);
  const [activeChip, setActiveChip] = useState<TSortedWord | null>();
  const isTeacher = profile?.role_id === 2;

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
        return !correctChips.find(
          (correctChip) => correctChip.word === wChip.word
        ) && !!wChip.word;
      })
      .sort(() => 0.5 - Math.random());
  }, [correctChips, data.columns]);

  console.log("sortedChips", sortedChips);
  console.log("data.columns", data.columns);

  return (
    <div className="p-16 px-24">
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
      <div
        className={`p-8 ${isPreview ? "pt-4 px-0" : "p-18"}  `}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
        <div
          className={isPreview ? "w-[633px]" : ""}
          style={{
            margin: "0 auto",
          }}
        >
          <div className="flex items-center wrap gap-4 justify-center mb-4">
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
                console.log("activeChip?", activeChip, isTeacher);
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
