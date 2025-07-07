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
import Image from "next/image";
import { TMatchWordImageData } from "../../editor/MatchWordImage/types";
import { Card, Chip, Input, Tooltip } from "@nextui-org/react";
import Draggable from "react-draggable";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";

type TProps = {
  data: TMatchWordImageData;
  isPreview?: boolean;
};

const DraggableItem = (props: {
  id: any;
  chip: string;
  isIntersected: MutableRefObject<boolean>;
  setCorrectChips: Dispatch<SetStateAction<string[]>>;
  setActiveChip: Dispatch<SetStateAction<string>>;
  setIncorrectIdsMap: any;
  isMissedIntersectedId: MutableRefObject<number>;
}) => {
  const {
    chip,
    isIntersected,
    setCorrectChips,
    setActiveChip,
    setIncorrectIdsMap,
    isMissedIntersectedId,
    id,
  } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);

  const handleDrag = useCallback(
    (chip: string, x: number, y: number) => {
      setActiveChip(chip);
      setX(x);
      setY(y);
      try {
        //@ts-ignore
        const draggableRect = document
          ?.getElementById("draggable-" + id)
          .getBoundingClientRect();
        //@ts-ignore
        const droppableRect = document
          ?.getElementById("answer-wrapper-" + id)
          .getBoundingClientRect();

        const intersects = !(
          draggableRect.top > droppableRect.bottom ||
          draggableRect.bottom < droppableRect.top ||
          draggableRect.right < droppableRect.left ||
          draggableRect.left > droppableRect.right
        );
        isIntersected.current = intersects;
        if (!intersects) {
          isMissedIntersectedId.current = 0;
          //@ts-ignore
          const allWrappers = document
            ?.getElementById("draggable-" + id)
            ?.closest(".match-word-image")
            .querySelectorAll(".answer-wrapper");

          const isAnyIntersects = Array.from(allWrappers)?.some((w) => {
            const droppableRect = w.getBoundingClientRect();
            const intersects = !(
              draggableRect.top > droppableRect.bottom ||
              draggableRect.bottom < droppableRect.top ||
              draggableRect.right < droppableRect.left ||
              draggableRect.left > droppableRect.right
            );
            if (intersects) {
              isMissedIntersectedId.current = w?.id?.split("-")?.reverse()[0];
            }
            return intersects;
          });
        }
      } catch (err) {}
    },
    [isIntersected, setActiveChip]
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
        if (!isIntersected.current) {
          setX(0);
          setY(0);
          setIsError(true);
          setTimeout(() => {
            setIsError(false);
          }, 2000);

          //
          setIncorrectIdsMap((m) => {
            return {
              ...m,
              [isMissedIntersectedId.current]: chip,
            };
          });
          return;
        }
        setCorrectChips((chips) => chips.concat(chip));
      }}
    >
      <Chip
        color={isError ? "danger" : "primary"}
        style={{ zIndex: 1, cursor: "pointer" }}
        id={"draggable-" + id}
        className="handle text-[18px] cursor-pointer"
      >
        {chip}
      </Chip>
    </Draggable>
  );
};

const InputItem = (props: {
  chip: string;
  setCorrectChips: Dispatch<SetStateAction<string[]>>;
  isCorrect: boolean;
  isTeacher: boolean;
  isIncorrectWord?: string;
  id: string;
  setIncorrectIdsMap: any;
}) => {
  const {
    chip,
    setCorrectChips,
    isCorrect,
    isTeacher,
    isIncorrectWord,
    id,
    setIncorrectIdsMap,
  } = props;
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!inputValue) {
      return;
    }
    if (inputValue.toLowerCase() === chip.toLowerCase()) {
      setCorrectChips((chips) => chips.concat(chip));
    }
  }, [inputValue, chip, setCorrectChips]);

  useEffect(() => {
    if (isTeacher) {
      if (isIncorrectWord && !isCorrect) {
        setInputValue(isIncorrectWord);
        return;
      }

      setInputValue(chip);
    }
  }, [isIncorrectWord, isCorrect, chip, isTeacher]);

  const onBlur = useCallback(() => {
    if (!inputValue) {
      return;
    }
    if (inputValue.toLowerCase() !== chip.toLowerCase()) {
      setIncorrectIdsMap((m) => {
        return {
          ...m,
          [id]: inputValue,
        };
      });
    }
  }, [chip, id, inputValue, setIncorrectIdsMap]);

  return (
    <>
      <Tooltip
        isDisabled={!isTeacher}
        content={isTeacher && <div className="teacher-placeholer">{chip}</div>}
      >
        <Input
          color={inputValue && !isCorrect ? "danger" : "default"}
          value={inputValue}
          onValueChange={setInputValue}
          placeholder={isTeacher ? chip : ""}
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
  const isIntersected = useRef(false);
  const [correctChips, setCorrectChips] = useState<string[]>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState({});
  const isMissedIntersectedId = useRef<number>(0);
  const [activeChip, setActiveChip] = useState("");
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
    return [...data.images]
      .filter((i) => !!i.text && !correctChips.includes(i.text))
      .map((img) => img.text)
      .sort(() => 0.5 - Math.random());
  }, [correctChips.length, data.images]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          const parsedIds = JSON.parse(answers[data.id]?.answer);
          setCorrectChips(parsedIds?.correctIds);
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
      setCorrectChips(parsedIds?.correctIds);
      setIncorrectIdsMap(parsedIds?.incorrectIdsMap || {});
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher]);

  useEffect(() => {
    if (correctChips.length || Object.keys(incorrectIdsMap)?.length) {
      writeAnswer(
        data.id,
        JSON.stringify({ correctIds: correctChips, incorrectIdsMap })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctChips?.length, writeAnswer, incorrectIdsMap]);
  return (
    <div className={`py-8 w-[886px] m-auto match-word-image`}>
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
      <div style={{ margin: "0 auto" }}>
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {data.viewType === "drag" && (
          <div
            className="flex items-center wrap gap-4 justify-center m-auto py-4 flex-wrap shadow-lg"
            style={{
              position: "sticky",
              zIndex: 2,
              background: "#fff",
              top: 0,
              borderRadius: 10,
            }}
          >
            {sortedChips.map((chip, chipIndex) => {
              return (
                <DraggableItem
                  id={data.images.find((i) => i.text === chip)?.id}
                  chip={chip}
                  key={chip + chipIndex}
                  isIntersected={isIntersected}
                  setCorrectChips={setCorrectChips}
                  setActiveChip={setActiveChip}
                  setIncorrectIdsMap={setIncorrectIdsMap}
                  isMissedIntersectedId={isMissedIntersectedId}
                />
              );
            })}
          </div>
        )}
        {!!data?.images?.length && (
          <div className="flex flex-wrap justify-center">
            {data?.images?.map((image) => {
              const isCorrect =
                correctChips.includes(image.text) ||
                (isTeacher && image.text === activeChip);
              const isIncorrectWord =
                isTeacher && !isCorrect && incorrectIdsMap?.[image?.id];
              return (
                <div key={image.dataURL} className="w-[33.3333333%] p-4">
                  <div className="h-[220px] flex items-center justify-center overflow-hidden">
                    <Zoom>
                      <img
                        src={image.dataURL}
                        alt="image"
                        style={{ margin: "0 auto", maxHeight: "100%" }}
                      />
                    </Zoom>
                  </div>
                  {data.viewType === "drag" && (
                    <Tooltip
                      isDisabled={!isTeacher}
                      content={
                        isTeacher && (
                          <div className="teacher-placeholer">{image.text}</div>
                        )
                      }
                    >
                      <Card
                        className="mt-4 flex items-center justify-center p-2 answer-wrapper"
                        id={"answer-wrapper-" + image.id}
                        style={{
                          height: 40,
                          width: "100%",
                          border: isCorrect
                            ? "2px solid #219F59"
                            : isIncorrectWord
                            ? "2px solid rgb(164, 41, 41)"
                            : "2px solid transparent",
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
                    </Tooltip>
                  )}
                  {data.viewType === "input" && (
                    <Card
                      className="mt-4 flex items-center justify-center"
                      id={"answer-wrapper-" + image.text}
                      style={{
                        height: 40,
                        width: "100%",
                        // border: isCorrect
                        //   ? "2px solid #219F59"
                        //   : "2px solid transparent",
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
                        isCorrect={isCorrect}
                        chip={image.text}
                        setCorrectChips={setCorrectChips}
                        isIncorrectWord={isIncorrectWord}
                        setIncorrectIdsMap={setIncorrectIdsMap}
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
