import React, { FC, useMemo } from "react";
import { ImageExView } from "../ImageExView";
import styles from "./style.module.css";
import ArrowUpIcon from "@/assets/icons/editor_arrow_up.svg";
import EditIcon from "@/assets/icons/edit.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import { Divider } from "@nextui-org/react";
import { TextDefaultExView } from "../TextDefaultExView";
import { Text2ColExView } from "../Text2ColExView";
import { TextStickerExView } from "../TextStickerExView";
import { TextChecklistExView } from "../TextChecklistExView";
import { VideoExView } from "../VideoExView";
import { AudioExView } from "../AudioExView";
import { NoteExView } from "../NoteExView";
import { FillGapsSelectExView } from "../FillGapsSelectExView";
import { FillGapsInputExView } from "../FillGapsInputExView";
import { FillGapsDragExView } from "../FillGapsDragExView";
import { MatchWordWordExView } from "../MatchWordWordExView";
import { MatchWordImageExView } from "../MatchWordImageExView";
import { MatchWordColumnExView } from "../MatchWordColumnExView";
import { TestExView } from "../TestExView";
import { FreeInputFormExView } from "../FreeInputFormExView";

type TProps = {
  list: Array<any>;
  onPressEdit?: (ex: any) => void;
  changeSortIndex?: (exId: number, newIndex: number) => void;
  onPressDelete?: (exId: number) => void;
  onChangeIsVisible?: () => void;
  isView?: boolean;
  activeStudentId?: boolean;
};

const mapComponent = (type: string, outerProps: never) => {
  switch (type) {
    case "image":
      return (props) => <ImageExView {...props} />;
    case "text-default":
      return (props) => <TextDefaultExView {...props} />;
    case "text-2-col":
      return (props) => <Text2ColExView {...props} />;
    case "text-sticker":
      return (props) => <TextStickerExView {...props} />;
    case "text-checklist":
      return (props) => <TextChecklistExView {...props} />;
    case "video":
      return (props) => <VideoExView {...props} />;
    case "audio":
      return (props) => <AudioExView {...props} />;
    case "note":
      return (props) => {
        return (
          <NoteExView
            {...props}
            data={{
              ...props.data,
              id: outerProps.id,
            }}
            onChangeIsVisible={outerProps.onChangeIsVisible}
          />
        );
      };
    case "fill-gaps-select":
      return (props) => (
        <FillGapsSelectExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "fill-gaps-input":
      return (props) => (
        <FillGapsInputExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "fill-gaps-drag":
      return (props) => (
        <FillGapsDragExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "match-word-word":
      return (props) => (
        <MatchWordWordExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "match-word-image":
      return (props) => (
        <MatchWordImageExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "match-word-column":
      return (props) => (
        <MatchWordColumnExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "test":
      return (props) => (
        <TestExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    case "free-input-form":
      return (props) => (
        <FreeInputFormExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
    default:
      return () => <></>;
      break;
  }
};

export const ExList: FC<TProps> = (props) => {
  const { list, onPressEdit, changeSortIndex, onPressDelete, isView } = props;
  return (
    <div className="flex flex-col gap-10">
      {list.map((ex, exIndex) => {
        const Viewer = mapComponent(ex.type, { ...props, id: ex.id });
        return (
          <div
            className={`${styles["wrapper"]} ${styles["is-view"]}`}
            style={{ fontSize: 18 }}
            key={ex.id}
          >
            <Viewer data={ex.data} />
            {!isView && (
              <div className={`${styles["edit-wrapper"]} p-4`}>
                <div className="flex justify-end gap-2">
                  {exIndex !== 0 && (
                    <div
                      onClick={() => {
                        //up

                        if (list[exIndex - 1]) {
                          const prevEx = list[exIndex - 1];
                          changeSortIndex(prevEx.id, prevEx.sortIndex + 1);
                        }
                        changeSortIndex(ex.id, ex.sortIndex - 1);
                      }}
                      className="flex justify-center items-center bg-white w-[40px] h-[40px] rounded-[10px]"
                      style={{
                        boxShadow: "0px 8px 24px 0px #908BA826",
                        cursor: "pointer",
                      }}
                    >
                      <Image src={ArrowUpIcon} alt="arrow icon" />
                    </div>
                  )}
                  {exIndex < list.length - 1 && (
                    <div
                      onClick={() => {
                        //down

                        if (list[exIndex + 1]) {
                          const next = list[exIndex + 1];

                          changeSortIndex(next.id, next.sortIndex - 1);
                        }
                        changeSortIndex(ex.id, ex.sortIndex + 1);
                      }}
                      className="flex justify-center items-center bg-white w-[40px] h-[40px] rounded-[10px]"
                      style={{
                        boxShadow: "0px 8px 24px 0px #908BA826",
                        cursor: "pointer",
                      }}
                    >
                      <Image
                        src={ArrowUpIcon}
                        alt="arrow icon"
                        style={{ transform: "rotate(180deg)" }}
                      />
                    </div>
                  )}
                </div>
                <div className="h-4" />
                <div
                  className="p-4 bg-white w-[260px] rounded-[10px]"
                  style={{
                    boxShadow: "0px 8px 24px 0px #908BA826",
                    cursor: "pointer",
                  }}
                >
                  <div
                    className="flex justify-between items-center"
                    onClick={() => onPressEdit(ex)}
                  >
                    <p>Редактировать задание</p>
                    <Image src={EditIcon} alt="arrow icon" />
                  </div>
                  <Divider className="my-2" />
                  <div
                    className="flex justify-between items-center"
                    onClick={() => onPressDelete(ex.id)}
                  >
                    <p style={{ color: "#A42929" }}>Удалить задание</p>
                    <Image src={DeleteIcon} alt="arrow icon" />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
