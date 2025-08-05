import React, {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ImageExView } from "../ImageExView";
import styles from "./style.module.css";
import ArrowUpIcon from "@/assets/icons/editor_arrow_up.svg";
import Ellipse from "@/assets/icons/ellipse.svg";
import EditIcon from "@/assets/icons/edit.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import {
  Button,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
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
import PlusIcon from "@/assets/icons/plus_ex.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import PasteIcon from "@/assets/icons/paste.svg";
import { SibscribeContext } from "@/subscribe/context";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import { toast } from "react-toastify";
import { checkResponse, fetchPostJson } from "@/api";
import EyeEnabledIcon from "@/assets/icons/eye_enable.svg";
import EyeDisabledIcon from "@/assets/icons/eye_disabled.svg";
import { AuthContext } from "@/auth";

type TProps = {
  list: Array<any>;
  onPressEdit?: (ex: any) => void;
  changeSortIndex?: (exId: number, newIndex: number) => void;
  onPressDelete?: (exId: number) => void;
  onChangeIsVisible?: () => void;
  isView?: boolean;
  activeStudentId: number;
  onPressCreate: (indexToShift?: number) => void;
  onSuccessCreate?: (id: number) => void;
  is2easy?: boolean;
  isAdmin?: boolean;
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
      return (props) => (
        <TextChecklistExView
          {...props}
          data={{
            ...props.data,
            id: outerProps.id,
          }}
        />
      );
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
      return (props) => {
        return (
          <TestExView
            {...props}
            data={{
              ...props.data,
              id: outerProps.id,
            }}
          />
        );
      };
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

export const ExListComp: FC<TProps> = (props) => {
  const {
    list,
    onPressEdit,
    changeSortIndex,
    onPressDelete,
    isView,
    activeStudentId,
    onPressCreate,
    onSuccessCreate,
    is2easy,
    isAdmin,
  } = props;

  const [copyData, setCopyData] = useState("");

  useEffect(() => {
    if (isView) {
      return;
    }
    const interval = setInterval(() => {
      const exCopyData = readFromLocalStorage("exCopy");
      setCopyData(exCopyData || "");
    }, 1000);
    return () => clearInterval(interval);
  }, [isView]);

  const ViewerComponent = ({ ex, exIndex, is2easy, isAdmin }) => {
    const { profile } = useContext(AuthContext);
    const isTeacher = profile?.role_id === 2;

    const Viewer = mapComponent(ex.type, { ...props, id: ex.id });
    const [popoverIsOpen, setPopoverIsOpen] = useState(false);
    const closePopover = useCallback(() => {
      setPopoverIsOpen(false);
    }, []);
    const { checkSubscription } = useCheckSubscription();
    const [isVisible, setIsVisible] = useState(!!ex?.is_visible);
    const canEditEye = useMemo(() => {
      if (is2easy) {
        return isAdmin;
      }
      return isTeacher;
    }, [is2easy, isAdmin, isTeacher]);
    console.log("is2easy", is2easy, isAdmin);
    return (
      <div key={ex.id}>
        <div
          className={`${styles["wrapper"]} ${
            isView && styles["is-view"]
          } relative`}
          style={{ fontSize: 18 }}
          id={`ex-${ex.id}`}
        >
          {isTeacher && (
            <div className="w-[55px] absolute left-[10px] top-[10px]">
              <div
                className="flex flex-col items-start gap-2"
                style={{ cursor: "pointer" }}
                onClick={async () => {
                  if (!canEditEye) {
                    toast(
                      "Добавьте урок к себе, что менять видимость заданий",
                      {
                        type: "error",
                      }
                    );
                    return;
                  }
                  setIsVisible(!isVisible);
                  const res = await fetchPostJson({
                    path: "/ex/change-visible",
                    isSecure: true,
                    data: { is_visible: !isVisible, id: ex.id },
                  });
                  const data = await res.json();
                  checkResponse(data);
                }}
              >
                <div
                  style={{ width: 24, height: 28 }}
                  className="flex justify-center items-center"
                >
                  <Image
                    src={isVisible ? EyeEnabledIcon : EyeDisabledIcon}
                    alt=""
                  />
                </div>
                <p
                  style={{
                    color: isVisible ? "#3F28C6" : "#B3B3B3",
                    fontSize: 12,
                    textAlign: "left",
                    lineHeight: "100%",
                  }}
                >
                  {isVisible
                    ? ex.type === "note"
                      ? "заметка видна ученику"
                      : "задание видно ученику"
                    : ex.type === "note"
                    ? "заметка не видна ученику"
                    : "задание не видно ученику"}
                </p>
              </div>
            </div>
          )}
          <Viewer data={ex.data} activeStudentId={activeStudentId} />
          {!isView && (
            <>
              <Popover
                color="foreground"
                placement="bottom-end"
                isOpen={popoverIsOpen}
                onOpenChange={(open) => {
                  setPopoverIsOpen(open);
                }}
              >
                <PopoverTrigger>
                  <Button
                    isIconOnly
                    variant="flat"
                    style={{
                      position: "absolute",
                      right: 20,
                      top: 20,
                      zIndex: 1,
                    }}
                  >
                    <Image src={Ellipse} alt="icon" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-2 bg-white items-start">
                  <div>
                    <div className="flex justify-end gap-2">
                      {!ex.isDisabledEx && exIndex !== 0 && (
                        <div
                          onClick={() => {
                            //up

                            if (list[exIndex - 1]) {
                              const prevEx = list[exIndex - 1];
                              changeSortIndex(prevEx.id, prevEx.sortIndex + 1);
                            }
                            changeSortIndex(ex.id, ex.sortIndex - 1);
                            closePopover(ex.id);
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
                      {!ex.isDisabledEx && exIndex < list.length - 1 && (
                        <div
                          onClick={() => {
                            //down

                            if (list[exIndex + 1]) {
                              const next = list[exIndex + 1];

                              changeSortIndex(next.id, next.sortIndex - 1);
                            }
                            changeSortIndex(ex.id, ex.sortIndex + 1);
                            closePopover(ex.id);
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
                      className="p-2 bg-white w-[260px] rounded-[10px]"
                      style={{
                        // boxShadow: "0px 8px 24px 0px #908BA826",
                        cursor: "pointer",
                      }}
                    >
                      {!ex.isDisabledEx && (
                        <>
                          <div
                            className="flex justify-between items-center"
                            onClick={() => {
                              onPressEdit(ex);
                              closePopover(ex.id);
                            }}
                          >
                            <p>Редактировать задание</p>
                            <Image src={EditIcon} alt="arrow icon" />
                          </div>
                          <Divider className="my-2" />
                        </>
                      )}
                      <div
                        className="flex justify-between items-center"
                        onClick={() => {
                          if (checkSubscription()) {
                            writeToLocalStorage(
                              "exCopy",
                              JSON.stringify({
                                lesson_id: ex.lesson_id,
                                id: ex.id,
                                currentSortIndexToShift: ex.sortIndex,
                              })
                            );
                            toast("Задание скопировано в буфер обмена", {
                              type: "success",
                            });
                            closePopover(ex.id);
                          }
                        }}
                      >
                        <p>Копировать задание</p>
                        <Image src={CopyIcon} alt="arrow icon" />
                      </div>
                      {!!copyData && !ex.isDisabledEx && (
                        <>
                          <Divider className="my-2" />
                          <div
                            className="flex justify-between items-center"
                            onClick={async () => {
                              const copyObj = JSON.parse(copyData);
                              const res = await fetchPostJson({
                                path: "/ex/copy",
                                isSecure: true,
                                data: {
                                  ...copyObj,
                                  lesson_id: ex.lesson_id,
                                  currentSortIndexToShift: ex.sortIndex,
                                },
                              });
                              const data = await res.json();
                              if (typeof onSuccessCreate === "function") {
                                onSuccessCreate(data?.id);
                              }
                              writeToLocalStorage("exCopy", "");
                              closePopover(ex.id);
                            }}
                          >
                            <p>Вставить задание</p>
                            <Image src={PasteIcon} alt="arrow icon" />
                          </div>
                        </>
                      )}
                      {!ex.isDisabledEx && (
                        <>
                          <Divider className="my-2" />
                          <div
                            className="flex justify-between items-center"
                            onClick={() => {
                              onPressDelete(ex.id);
                              closePopover(ex.id);
                            }}
                          >
                            <p style={{ color: "#A42929" }}>Удалить задание</p>
                            <Image src={DeleteIcon} alt="arrow icon" />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </>
          )}
          {/* <div className="w-[55px]">eye here</div> */}
        </div>
        {!ex.isDisabledEx && !isView && exIndex !== list.length - 1 && (
          <div className={`ex-add-button mt-8 relative`}>
            <div className={`${styles.dashed}`}></div>
            <Image
              onClick={() => onPressCreate(ex.sortIndex)}
              src={PlusIcon}
              alt="plus icon"
              className="m-auto relative z-index-[2] cursor-pointer hover:opacity-[0.8]"
            />
          </div>
        )}
      </div>
    );
  };

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.replace("#", "");
      const el = document.getElementById(id);
      el?.scrollIntoView();
    }
  }, [list]);

  return (
    <div className="flex flex-col gap-10">
      {list.map((ex, exIndex) => {
        return (
          <ViewerComponent
            key={ex.id}
            ex={ex}
            exIndex={exIndex}
            isAdmin={isAdmin}
            is2easy={is2easy}
          />
        );
      })}
    </div>
  );
};

export const ExList = React.memo(ExListComp);
