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
  setCorrectIds: Dispatch<SetStateAction<number[]>>;
  setActiveChip: Dispatch<SetStateAction<string>>;
  setIncorrectIdsMap: any;
  isMissedIntersectedId: MutableRefObject<number>;
  fields: any;
}) => {
  const {
    chip,
    isIntersected,
    setCorrectIds,
    setActiveChip,
    setIncorrectIdsMap,
    isMissedIntersectedId,
    id,
    fields,
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
    [id, isIntersected, isMissedIntersectedId, setActiveChip]
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
          //maybe word is correct, but id is missed
          const isMissedIntersectValue = fields.find(
            (f) => f.id == isMissedIntersectedId.current
          )?.text;
          if (isMissedIntersectValue === chip) {
            setCorrectIds((ids) =>
              ids.concat(Number(isMissedIntersectedId.current))
            );
            setX(0);
            setY(0);
            return;
          }
          //
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
        setCorrectIds((ids) => ids.concat(id));
      }}
    >
      <Chip
        color={isError ? "danger" : "primary"}
        style={{
          zIndex: 1,
          cursor: "pointer",
          whiteSpace: "break-spaces",
          height: "auto",
          textAlign: "center",
        }}
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
  setCorrectIds: Dispatch<SetStateAction<string[]>>;
  isCorrect: boolean;
  isTeacher: boolean;
  isIncorrectWord?: string;
  id: string;
  setIncorrectIdsMap: any;
  isPresentationMode?: boolean;
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
  } = props;
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!inputValue) {
      return;
    }
    if (inputValue.toLowerCase() === chip.toLowerCase()) {
      setCorrectIds((ids) => ids.concat(id));
    }
  }, [inputValue, id, chip, setCorrectIds]);

  // useEffect(() => {
  //   if (isTeacher) {
  //     console.log('effect teacher?')
  //     if (isIncorrectWord && !isCorrect) {
  //       setInputValue(isIncorrectWord);
  //       return;
  //     }

  //     setInputValue(chip);
  //   }
  // }, [isIncorrectWord, isCorrect, chip, isTeacher]);

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
        isDisabled={!isTeacher || isPresentationMode}
        content={isTeacher && <div className="teacher-placeholer">{chip}</div>}
      >
        <Input
          color={inputValue && !isCorrect ? "danger" : "default"}
          value={inputValue}
          onValueChange={setInputValue}
          placeholder={isTeacher && !isPresentationMode ? chip : ""}
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
  const [correctIds, setCorrectIds] = useState<number[]>([]);
  const [incorrectIdsMap, setIncorrectIdsMap] = useState({});
  const isMissedIntersectedId = useRef<number>(0);
  const [activeChip, setActiveChip] = useState("");
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;

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
    return (
      [...data.images]
        .filter((i) => !!i.text && !correctIds.includes(i.id))
        // .map((img) => img.text)
        .sort(() => 0.5 - Math.random())
    );
  }, [correctIds.length, data.images]);

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
      writeAnswer(
        data.id,
        JSON.stringify({ correctIds: correctIds, incorrectIdsMap })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctIds?.length, writeAnswer, incorrectIdsMap]);

  // console.log('data', data)
  // console.log("correctIds", correctIds);
  return (
    <div className={`py-8 w-[100%] max-w-[766px] m-auto match-word-image`}>
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
            {sortedChips.map((chip, chipIndex) => {
              return (
                <DraggableItem
                  id={chip.id}
                  chip={chip.text}
                  key={chip.id}
                  // id={data.images.find((i) => i.text === chip)?.id}
                  isIntersected={isIntersected}
                  setCorrectIds={setCorrectIds}
                  setActiveChip={setActiveChip}
                  setIncorrectIdsMap={setIncorrectIdsMap}
                  isMissedIntersectedId={isMissedIntersectedId}
                  fields={data.images}
                />
              );
            })}
          </div>
        )}
        {!!data?.images?.length && (
          <div className="flex flex-wrap justify-center">
            {data?.images?.map((image) => {
              const isCorrect =
                correctIds.includes(image.id) ||
                (isTeacher &&
                  !rest?.isPresentationMode &&
                  image.text === activeChip);
              const isIncorrectWord =
                isTeacher && !isCorrect && incorrectIdsMap?.[image?.id];
              return (
                <div key={image.dataURL} className="w-[33.3333333%] p-1 lg:p-4">
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
                      isDisabled={!isTeacher || rest?.isPresentationMode}
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
                          minHeight: 40,
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
                        setCorrectIds={setCorrectIds}
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
