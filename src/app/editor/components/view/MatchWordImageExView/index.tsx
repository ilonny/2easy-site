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
import { Card, Chip, Input } from "@nextui-org/react";
import Draggable from "react-draggable";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TMatchWordImageData;
  isPreview?: boolean;
};

const DraggableItem = (props: {
  chip: string;
  isIntersected: MutableRefObject<boolean>;
  setCorrectChips: Dispatch<SetStateAction<string[]>>;
  setActiveChip: Dispatch<SetStateAction<string>>;
}) => {
  const { chip, isIntersected, setCorrectChips, setActiveChip } = props;
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
          ?.getElementById("draggable-" + chip)
          .getBoundingClientRect();
        //@ts-ignore
        const droppableRect = document
          ?.getElementById("answer-wrapper-" + chip)
          .getBoundingClientRect();

        const intersects = !(
          draggableRect.top > droppableRect.bottom ||
          draggableRect.bottom < droppableRect.top ||
          draggableRect.right < droppableRect.left ||
          draggableRect.left > droppableRect.right
        );
        isIntersected.current = intersects;
        if (!intersects) {
          setX(0);
          setY(0);
          return;
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
          setIsError(true);
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
        id={"draggable-" + chip}
        className="handle"
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
}) => {
  const { chip, setCorrectChips, isCorrect, isTeacher } = props;
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (!inputValue) {
      return;
    }
    if (inputValue.toLowerCase() === chip.toLowerCase()) {
      setCorrectChips((chips) => chips.concat(chip));
    }
  }, [inputValue, chip, setCorrectChips]);

  return (
    <>
      <Input
        color={inputValue && !isCorrect ? "danger" : "default"}
        value={inputValue}
        onValueChange={setInputValue}
        placeholder={isTeacher ? chip : ""}
        style={{ height: 50 }}
        isDisabled={isCorrect}
        classNames={{ inputWrapper: "bg-white" }}
      />
    </>
  );
};

export const MatchWordImageExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
  const { profile } = useContext(AuthContext);
  const isIntersected = useRef(false);
  const [correctChips, setCorrectChips] = useState<string[]>([]);
  const [activeChip, setActiveChip] = useState("");
  const isTeacher = profile?.role_id === 2;
  const sortedChips = useMemo(() => {
    return [...data.images]
      .filter((i) => !!i.text && !correctChips.includes(i.text))
      .map((img) => img.text)
      .sort(() => 0.5 - Math.random());
  }, [correctChips, data.images]);

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
      <div style={{ margin: "0 auto" }}>
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {data.viewType === "drag" && (
          <div className="flex items-center wrap gap-4 justify-center mb-4">
            {sortedChips.map((chip, chipIndex) => {
              return (
                <DraggableItem
                  chip={chip}
                  key={chip + chipIndex}
                  isIntersected={isIntersected}
                  setCorrectChips={setCorrectChips}
                  setActiveChip={setActiveChip}
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
                    <Card
                      className="mt-4 flex items-center justify-center p-2"
                      id={"answer-wrapper-" + image.text}
                      style={{
                        height: 40,
                        width: "100%",
                        border: isCorrect
                          ? "2px solid #219F59"
                          : "2px solid transparent",
                        background: isCorrect ? "#E9FEE8" : "transparent",
                      }}
                    >
                      {isCorrect && image.text}
                    </Card>
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
                        background: isCorrect ? "#E9FEE8" : "transparent",
                      }}
                    >
                      <InputItem
                        isTeacher={isTeacher}
                        isCorrect={isCorrect}
                        chip={image.text}
                        setCorrectChips={setCorrectChips}
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
