/* eslint-disable @next/next/no-img-element */
import Draggable, { DraggableCore } from "react-draggable"; // Both at the same time
import {
  FC,
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
type TProps = {
  data: TFillGapsDragData;
  isPreview?: boolean;
};

const AnswerField: FC<{ field: TField; isTeacher: boolean }> = ({
  field,
  isTeacher,
}) => {
  const handleMouseEnter = useCallback((e) => {
    console.log("e", e);
  }, []);

  return (
    <div
      className="answer-wrapper mx-2"
      data-id={field.id}
      id={"answer-wrapper-" + field?.id}
      style={{
        display: "inline-block",
        minWidth: 100,
      }}
      onMouseEnter={handleMouseEnter}
    >
      <div className="drag-word">
        <div className="flex items-center gap-1">{""}</div>
      </div>
    </div>
  );
};

export const FillGapsDragExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  const { profile } = useContext(AuthContext);
  const [activeField, setActiveField] = useState<TField | null>(null);
  const renderContent = useCallback(() => {
    document
      .querySelectorAll(".answerWrapperArea .answerWrapper")
      .forEach((el, index) => {
        const id = el.id;
        const field = data.fields.find((f) => f.id == id);
        el.setAttribute("index", field?.id?.toString());
        const root = ReactDOM.createRoot(el);
        root.render(
          <>
            {field && (
              <AnswerField field={field} isTeacher={profile?.role_id === 2} />
            )}
          </>
        );
      });
  }, [data.fields, profile?.role_id]);

  useEffect(() => {
    renderContent();
  }, [renderContent]);

  const handleDrag = useCallback((id: number) => {
    console.log('id????', id)
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

    console.log("intersects", intersects);
  }, []);

  return (
    <>
      <div className="p-8 px-24">
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
      <div className={`p-8 ${isPreview ? "pt-4" : "p-18"} px-24`}>
        <div className="flex justify-center items-center mb-4 gap-2 ">
          {data.fields
            .sort(() => 0.5 - Math.random())
            .map((field) => {
              return (
                <Draggable
                  key={field.id}
                  // bounds="parent"
                  handle=".handle"
                  defaultPosition={{ x: 0, y: 0 }}
                  position={null}
                  // grid={[25, 25]}
                  scale={1}
                  // onStart={() => setActiveField(field)}
                  onDrag={() => handleDrag(+field.id)}
                  // onStop={() => setActiveField(null)}
                >
                  <Chip
                    id={"draggable-" + field.id}
                    size="md"
                    color="primary"
                    className="handle"
                    style={{ zIndex: 1, cursor: "pointer" }}
                  >
                    <span style={{ fontSize: 14 }}>{field.value}</span>
                  </Chip>
                </Draggable>
              );
            })}
        </div>
        <Card
          className={`p-10 px-10 box relative`}
          style={
            image && {
              backgroundImage: `url(${image.dataURL})`,
              backgroundSize: "cover",
            }
          }
        >
          <div style={{ margin: "0 auto" }} className="flex flex-col gap-10">
            <div
              className="answerWrapperArea"
              dangerouslySetInnerHTML={{ __html: data.dataText }}
            ></div>
          </div>
        </Card>
      </div>
    </>
  );
};
