"use client";
import React, {
  ComponentType,
  Dispatch,
  FC,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { ResponsiveTooltip } from "@/components/ResponsiveTooltip";
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
import { FillGapsNewExView } from "../FillGapsNewExView";
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
import CopyExIcon from "@/assets/icons/copy_ex.svg";
import { IntExView } from "../IntExView";
import { ResetAnswersControl } from "../ResetAnswersControl";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { usePathname } from "next/navigation";
import {
  EX_ANSWERS_RESET_EVENT,
  TExAnswersResetDetail,
} from "@/app/editor/hooks/useExAnswer";

const ANSWER_EX_TYPES = new Set([
  "text-checklist",
  "fill-gaps-select",
  "fill-gaps-input",
  "fill-gaps-drag",
  "FILL_GAPS_NEW",
  "match-word-word",
  "match-word-image",
  "match-word-column",
  "test",
  "free-input-form",
]);

const getExerciseTitle = (data: any) => {
  const candidates = [data?.subtitle, data?.description, data?.title, data?.name];
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return i18n.t("lessons.resetAnswersUntitled");
};

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
  isPresentationMode?: boolean;
};

const VIEWS_WITHOUT_ID: Record<string, ComponentType<any>> = {
  image: ImageExView,
  "text-default": TextDefaultExView,
  "text-2-col": Text2ColExView,
  "text-sticker": TextStickerExView,
  video: VideoExView,
  audio: AudioExView,
};

const VIEWS_WITH_ID: Record<string, ComponentType<any>> = {
  "text-checklist": TextChecklistExView,
  note: NoteExView,
  "fill-gaps-select": FillGapsSelectExView,
  "fill-gaps-input": FillGapsInputExView,
  "fill-gaps-drag": FillGapsDragExView,
  FILL_GAPS_NEW: FillGapsNewExView,
  "match-word-word": MatchWordWordExView,
  "match-word-image": MatchWordImageExView,
  "match-word-column": MatchWordColumnExView,
  test: TestExView,
  "free-input-form": FreeInputFormExView,
  int: IntExView,
};

type TExViewerProps = {
  type: string;
  id: number;
  data: Record<string, any>;
  activeStudentId: number;
  isView?: boolean;
  isPresentationMode?: boolean;
  onChangeIsVisible?: () => void;
};

const ExViewer: FC<TExViewerProps> = ({
  type,
  id,
  data,
  onChangeIsVisible,
  ...rest
}) => {
  const dataWithId = useMemo(() => ({ ...data, id }), [data, id]);
  const PlainView = VIEWS_WITHOUT_ID[type];
  if (PlainView) {
    return <PlainView {...rest} data={data} />;
  }
  const View = VIEWS_WITH_ID[type];
  if (!View) {
    return null;
  }
  return type === "note" ? (
    <View {...rest} data={dataWithId} onChangeIsVisible={onChangeIsVisible} />
  ) : (
    <View {...rest} data={dataWithId} />
  );
};

export const ExerciseComponentPreview: FC<{
  type: string;
  data: Record<string, any>;
}> = ({ type, data }) => {
  return (
    <div className="pointer-events-none select-none" aria-label="Превью задания">
      <div
        className={`${styles["wrapper"]} ${styles["is-view"]}`}
        style={{ fontSize: 18 }}
      >
        <ExViewer
          type={type}
          id={0}
          data={{ ...data, id: 0 }}
          activeStudentId={0}
          isView
          isPresentationMode={false}
        />
      </div>
    </div>
  );
};

type TExListItemProps = Pick<
  TProps,
  | "list"
  | "onPressEdit"
  | "changeSortIndex"
  | "onPressDelete"
  | "onChangeIsVisible"
  | "isView"
  | "activeStudentId"
  | "onPressCreate"
  | "onSuccessCreate"
  | "is2easy"
  | "isAdmin"
  | "isPresentationMode"
> & {
  ex: any;
  exIndex: number;
  copyData: string;
  setCopyData: Dispatch<SetStateAction<string>>;
};

const ExListItem: FC<TExListItemProps> = ({
  ex,
  exIndex,
  list,
  onPressEdit,
  changeSortIndex,
  onPressDelete,
  onChangeIsVisible,
  isView,
  activeStudentId,
  onPressCreate,
  onSuccessCreate,
  is2easy,
  isAdmin,
  isPresentationMode,
  copyData,
  setCopyData,
}) => {
  const { profile } = useContext(AuthContext);
  const pathname = usePathname();
  const isLessonMode = pathname?.startsWith("/lessons/");
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = !!profile?.isStudent || !!profile?.studentId;
  const resetTargetStudentId = isStudent
    ? profile?.studentId
    : activeStudentId;
  const canResetAnswers =
    isView &&
    !isPresentationMode &&
    ANSWER_EX_TYPES.has(ex.type) &&
    !!resetTargetStudentId &&
    (isStudent || (isTeacher && isLessonMode));

  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const [answersResetKey, setAnswersResetKey] = useState(0);
  const closePopover = useCallback(() => {
    setPopoverIsOpen(false);
  }, []);

  useEffect(() => {
    if (!canResetAnswers || !resetTargetStudentId) {
      return;
    }
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const onAnswersReset = (event: Event) => {
      const detail = (event as CustomEvent<TExAnswersResetDetail>).detail;
      if (!detail) return;
      if (
        Number(detail.ex_id) === Number(ex.id) &&
        Number(detail.student_id) === Number(resetTargetStudentId)
      ) {
        if (debounceTimer) {
          clearTimeout(debounceTimer);
        }
        debounceTimer = setTimeout(() => {
          setAnswersResetKey((k) => k + 1);
        }, 150);
      }
    };
    window.addEventListener(EX_ANSWERS_RESET_EVENT, onAnswersReset);
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      window.removeEventListener(EX_ANSWERS_RESET_EVENT, onAnswersReset);
    };
  }, [canResetAnswers, resetTargetStudentId, ex.id]);

  const { checkSubscription } = useCheckSubscription();
  const [isVisible, setIsVisible] = useState(!!ex?.is_visible);
  const canEditEye = useMemo(() => {
    if (is2easy) {
      return isAdmin;
    }
    return isTeacher;
  }, [is2easy, isAdmin, isTeacher]);
  return (
    <div key={ex.id} className="">
      <div
        className={`${styles["wrapper"]} ${
          isView && styles["is-view"]
        } relative pt-12 sm:pt-14 md:pt-[52px] lg:pt-0 ${
          canResetAnswers ? "pb-14 sm:pb-12" : ""
        }`}
        style={{ fontSize: 18 }}
        id={`ex-${ex.id}`}
      >
        {isTeacher && !isPresentationMode && (
          <div className="absolute left-[10px] top-[10px] w-[55px] sm:w-auto">
            <div
              className="flex min-h-11 min-w-11 touch-manipulation flex-col items-start gap-2"
              style={{ cursor: "pointer" }}
              onClick={async () => {
                if (!canEditEye) {
                  toast(
                    i18n.t("lessons.addLessonToSelfHint"),
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
                  maxWidth: 55,
                }}
                className={`${styles["eye-text"]}`}
              >
                {isVisible
                  ? ex.type === "note"
                    ? <T k="lessons.noteVisibleToStudent" />
                    : <T k="lessons.taskVisibleToStudent" />
                  : ex.type === "note"
                  ? <T k="lessons.noteHiddenFromStudent" />
                  : <T k="lessons.taskHiddenFromStudent" />}
              </p>
            </div>
          </div>
        )}
        <ExViewer
          key={`${ex.id}-${answersResetKey}`}
          type={ex.type}
          id={ex.id}
          data={ex.data}
          activeStudentId={activeStudentId}
          isView={isView}
          isPresentationMode={isPresentationMode}
          onChangeIsVisible={onChangeIsVisible}
        />
        {canResetAnswers && (
          <ResetAnswersControl
            exId={ex.id}
            lessonId={ex.lesson_id}
            exerciseTitle={getExerciseTitle(ex.data)}
            studentId={Number(resetTargetStudentId)}
          />
        )}
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
                            changeSortIndex?.(prevEx.id, prevEx.sortIndex + 1);
                          }
                          changeSortIndex?.(ex.id, ex.sortIndex - 1);
                          closePopover();
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

                            changeSortIndex?.(next.id, next.sortIndex - 1);
                          }
                          changeSortIndex?.(ex.id, ex.sortIndex + 1);
                          closePopover();
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
                            onPressEdit?.(ex);
                            closePopover();
                          }}
                        >
                          <p><T k="editor.editTask" /></p>
                          <Image src={EditIcon} alt="arrow icon" />
                        </div>
                        <Divider className="my-2" />
                      </>
                    )}
                    <div
                      className="flex justify-between items-center"
                      onClick={() => {
                        if (checkSubscription()) {
                          const dataJson = JSON.stringify({
                            lesson_id: ex.lesson_id,
                            id: ex.id,
                            currentSortIndexToShift: ex.sortIndex,
                          });
                          writeToLocalStorage("exCopy", dataJson);
                          setCopyData(dataJson);
                          window.location.hash = `ex-${ex.id}`;
                          toast(i18n.t("lessons.taskCopiedToClipboard"), {
                            type: "success",
                          });
                          closePopover();
                        }
                      }}
                    >
                      <p><T k="lessons.copyTask" /></p>
                      <Image src={CopyIcon} alt="arrow icon" />
                    </div>
                    {!ex.isDisabledEx && (
                      <>
                        <Divider className="my-2" />
                        <div
                          className="flex justify-between items-center"
                          onClick={() => {
                            onPressDelete?.(ex.id);
                            closePopover();
                          }}
                        >
                          <p style={{ color: "#A42929" }}><T k="lessons.deleteTask" /></p>
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
        <div
          className={`ex-add-button mt-6 md:mt-8 relative flex justify-center gap-4`}
        >
          <div className={`${styles.dashed}`}></div>
          <ResponsiveTooltip content={<T k="lessons.createNewTask" />}>
            <Image
              onClick={() => onPressCreate(ex.sortIndex)}
              src={PlusIcon}
              alt="plus icon"
              className=" relative z-index-[2] cursor-pointer hover:opacity-[0.8]"
            />
          </ResponsiveTooltip>
          {!!copyData && !ex.isDisabledEx && (
            <div
              className=""
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
                setCopyData("");
                closePopover();
                window.location.hash = `ex-${data.id}`;
              }}
            >
              <ResponsiveTooltip content={<T k="lessons.pasteTask" />}>
                <Image
                  src={CopyExIcon}
                  alt={i18n.t("lessons.pasteTask")}
                  className="m-auto relative z-index-[2] cursor-pointer hover:opacity-[0.8]"
                />
              </ResponsiveTooltip>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export const ExListComp: FC<TProps> = (props) => {
  const {
    list,
    onPressEdit,
    changeSortIndex,
    onPressDelete,
    onChangeIsVisible,
    isView,
    activeStudentId,
    onPressCreate,
    onSuccessCreate,
    is2easy,
    isAdmin,
    isPresentationMode,
  } = props;

  const [copyData, setCopyData] = useState("");

  useEffect(() => {
    if (isView) {
      return;
    }
    const exCopyData = readFromLocalStorage("exCopy");
    setCopyData(exCopyData || "");
    // const interval = setInterval(() => {
    // }, 1000);
    // return () => clearInterval(interval);
  }, [isView]);

  const scrolledHashRef = useRef("");

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === scrolledHashRef.current) {
      return;
    }
    const el = document.getElementById(hash.replace("#", ""));
    if (el) {
      scrolledHashRef.current = hash;
      el.scrollIntoView();
    }
  }, [list]);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 md:gap-8 lg:gap-10">
      {list.map((ex, exIndex) => {
        return (
          <ExListItem
            key={ex.id}
            ex={ex}
            exIndex={exIndex}
            list={list}
            onPressEdit={onPressEdit}
            changeSortIndex={changeSortIndex}
            onPressDelete={onPressDelete}
            onChangeIsVisible={onChangeIsVisible}
            isView={isView}
            activeStudentId={activeStudentId}
            onPressCreate={onPressCreate}
            onSuccessCreate={onSuccessCreate}
            is2easy={is2easy}
            isAdmin={isAdmin}
            isPresentationMode={isPresentationMode}
            copyData={copyData}
            setCopyData={setCopyData}
          />
        );
      })}
    </div>
  );
};

export const ExList = React.memo(ExListComp);
