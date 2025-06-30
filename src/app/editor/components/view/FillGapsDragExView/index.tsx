/* eslint-disable @next/next/no-img-element */
import Draggable, { DraggableCore } from "react-draggable"; // Both at the same time
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
import { TField, TFillGapsDragData } from "../../editor/FillGapsDrag/types";
import {
  Button,
  Card,
  Chip,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import ReactDOM from "react-dom/client";
import styles from "./styles.module.css";
import { AuthContext } from "@/auth";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { useParams } from "next/navigation";
import { useExAnswer } from "@/app/editor/hooks/useExAnswer";
type TProps = {
  data: TFillGapsDragData;
  isPreview?: boolean;
};

const AnswerField: FC<{
  field: TField;
  isTeacher: boolean;
  isCorrect: boolean;
  dataId: number;
  errorAnswerId: number;
}> = ({ field, isTeacher, isCorrect, errorAnswerId }) => {
  return (
    <div
      className={`answer-wrapper mx-2 ${isCorrect && "bg-success"} ${
        field.id == String(errorAnswerId) && !isCorrect && "bg-error"
      }`}
      data-id={field?.id}
      id={"answer-wrapper-" + field?.id}
      style={{
        display: "inline-block",
        lineHeight: "initial",
        minWidth: isCorrect ? "initial" : 150,
        borderRadius: 30,
        position: "relative",
        fontSize: 18,
        top: -1,
      }}
    >
      <div className={`drag-word`}>
        <div className="flex items-center gap-1 px-1">
          {isTeacher && !isCorrect && (
            <div className="teacher-placeholer">{field.value}</div>
          )}
          {isCorrect && (
            <div className="success-placeholder">{field.value}</div>
          )}
        </div>
      </div>
    </div>
  );
};

const DraggableItem = (props: {
  field: TField;
  setActiveDragId: (id: number | null) => void;
  isIntersected: MutableRefObject<boolean>;
  isMissedIntersectedId: MutableRefObject<number>;
  onDrop: () => void;
  setCorrectIds: Dispatch<SetStateAction<number[]>>;
  setErrorAnswerId: Dispatch<SetStateAction<number>>;
  isCorrect: boolean;
  activeDragId: number | null;
}) => {
  const {
    field,
    setActiveDragId,
    isIntersected,
    isMissedIntersectedId,
    onDrop,
    setCorrectIds,
    isCorrect,
    activeDragId,
    setErrorAnswerId,
  } = props;
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [isError, setIsError] = useState(false);
  const isActiveDrag = activeDragId === Number(field.id);

  const handleDrag = useCallback((id: number, x: number, y: number) => {
    setActiveDragId(id);
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
          ?.closest(".fill-the-gaps-draggable")
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
            isMissedIntersectedId.current = w?.dataset?.id;
          }
          return intersects;
        });
      }
    } catch (err) {}
  }, []);

  if (isCorrect) {
    return null;
  }

  return (
    <Draggable
      key={field?.id}
      // bounds="parent"
      handle=".handle"
      // defaultPosition={{ x: 0, y: 0 }}
      position={{ x, y }}
      // grid={[25, 25]}
      scale={1}
      // onStart={() => setActiveField(field)}
      onDrag={(_e, data) => handleDrag(+field?.id, data.x, data.y)}
      onStop={() => {
        onDrop();
        setActiveDragId(null);
        if (isMissedIntersectedId.current && !isIntersected.current) {
          setX(0);
          setY(0);
          setErrorAnswerId(isMissedIntersectedId.current);
          setTimeout(() => {
            setErrorAnswerId(0);
          }, 2000);
          // return
        }
        if (!isIntersected.current) {
          setX(0);
          setY(0);
          return;
        }
        setCorrectIds((ids) => ids.concat(field?.id));
      }}
    >
      <Chip
        id={"draggable-" + field?.id}
        size="md"
        color={isError ? "danger" : "primary"}
        className={`${
          isActiveDrag && "bg-[#271399]"
        } handle text-[18px] cursor-pointer`}
        style={{ zIndex: 1, cursor: "pointer" }}
      >
        <span style={{ fontSize: 18, fontWeight: 400 }}>{field.value}</span>
      </Chip>
    </Draggable>
  );
};

export const FillGapsDragExView: FC<TProps> = ({
  data,
  isPreview = false,
  ...rest
}) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);
  const [activeDragId, setActiveDragId] = useState<number | null>();
  const isIntersected = useRef(false);
  const isMissedIntersectedId = useRef<number>(0);
  const [errorAnswerId, setErrorAnswerId] = useState<number>(0);
  const [correctIds, setCorrectIds] = useState<number[]>([]);

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

  const renderContent = useCallback(() => {
    document
      .querySelectorAll(
        `${".answerWrapperArea-" + (data?.id || 0).toString()} .answerWrapper`
      )
      .forEach((el, index) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id == id);
        el.setAttribute("index", field?.id?.toString());
        const root = ReactDOM.createRoot(el);
        root.render(
          <>
            {field && (
              <AnswerField
                field={field}
                isTeacher={profile?.role_id === 2}
                isCorrect={correctIds.includes(field?.id)}
                dataId={data?.id}
                errorAnswerId={errorAnswerId}
              />
            )}
          </>
        );
      });
  }, [data?.id, data.fields, profile?.role_id, correctIds, errorAnswerId]);

  useEffect(() => {
    if (student_id) {
      getAnswers(true).then((a) => {
        try {
          setCorrectIds(JSON.parse(a[data.id].answer));
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
      setCorrectIds(JSON.parse(answers[data.id].answer));
    } catch (err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, isTeacher]);

  useEffect(() => {
    if (correctIds.length) {
      writeAnswer(data.id, JSON.stringify(correctIds));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctIds, writeAnswer]);

  useEffect(() => {
    renderContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.dataText, correctIds, errorAnswerId]);

  const editableContent = useMemo(() => {
    return (
      <div
        className={
          "answerWrapperArea answerWrapperArea-" + (data?.id || 0).toString()
        }
        dangerouslySetInnerHTML={{ __html: data.dataText }}
      ></div>
    );
  }, [data.dataText, data?.id]);

  const sortedFields = useMemo(() => {
    return [...data.fields].sort(() => 0.5 - Math.random());
  }, [data.fields]);

  const onDrop = useCallback(() => {}, [activeDragId]);

  return (
    <div className="fill-the-gaps-draggable">
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
      </div>
      <div className={`pb-8 w-[886px] m-auto`}>
        {!!image && (
          <Zoom>
            <img
              src={image.dataURL}
              style={{ maxHeight: 400 }}
              className="m-auto mb-8"
            />
          </Zoom>
        )}
        <div className="flex justify-center items-center mb-8 gap-2 flex-wrap mx-auto">
          {sortedFields.map((field) => {
            return (
              <DraggableItem
                key={field?.id}
                field={field}
                setActiveDragId={setActiveDragId}
                activeDragId={activeDragId}
                isIntersected={isIntersected}
                isMissedIntersectedId={isMissedIntersectedId}
                onDrop={onDrop}
                setCorrectIds={setCorrectIds}
                isCorrect={correctIds.includes(field?.id)}
                setErrorAnswerId={setErrorAnswerId}
              />
            );
          })}
        </div>
        <Card className={`p-10 px-10 box relative`}>
          <div
            style={{ margin: "0 auto", lineHeight: "230%" }}
            className="flex flex-col gap-10"
          >
            {editableContent}
          </div>
        </Card>
      </div>
    </div>
  );
};
