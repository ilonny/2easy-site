"use client";
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TLesson } from "../../types";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import {
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { EditLessonModalForm } from "../EditLessonModalForm";
import { DeleteLessonModalForm } from "../DeleteLessonModalForm";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { checkResponse, fetchPostJson } from "@/api";
import { CreateCourseModalForm } from "../CreateCourseModalForm";
import { AttachLessonCourseModalForm } from "../AttachLessonCourseModalForm";
import { TCourse } from "@/app/course/hooks/useCourses";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import {
  isLessonLockedOnFreeTariff,
  useCheckSubscription,
} from "@/app/subscription/helpers";
import { getImageUrl } from "@/app/editor/helpers";
import {
  catalogFetchParams,
  useCatalogWorkspace,
} from "@/app/school/lib/catalogWorkspace";
import { CopyLessonToModal } from "../CopyLessonToModal";
import { useCourses } from "@/app/course/hooks/useCourses";
import { T } from "@/i18n/T";
import {
  CollisionDetection,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import {
  REORDER_NEAR_RATIO,
  SortableCatalogCard,
  nestFolderDropId,
} from "./SortableCatalogCard";
import { selectVisibleCatalogItems } from "./visibleCatalogItems";

const INITIAL_LESSON_BATCH = 24;
const LESSON_RENDER_STEP = 24;

type TCatalogOrderItem = { type: "folder" | "lesson" | "course"; id: number };

type TCollisionArgs = Parameters<CollisionDetection>[0];

const isNestZoneCollision = (
  args: TCollisionArgs,
  collisionId: string | number,
) => {
  const container = args.droppableContainers.find(
    (entry) => entry.id === collisionId,
  );
  return (
    !!container?.data?.current?.isNestZone ||
    String(collisionId).startsWith("nest:folder:")
  );
};

const pointerInRect = (
  pointer: { x: number; y: number },
  rect: { left: number; right: number; top: number; bottom: number },
) =>
  pointer.x >= rect.left &&
  pointer.x <= rect.right &&
  pointer.y >= rect.top &&
  pointer.y <= rect.bottom;

type TFolderPointerHit =
  | { mode: "nest"; folderSortableId: string | number; nestId: string }
  | { mode: "reorder"; folderSortableId: string | number };

/**
 * Folder cover zones (direction depends on where the dragged card started):
 * - large center → nest into folder
 * - near edge (toward dragged card) → swap with folder on drop
 * - far edge (past the folder) → also swap with folder on drop
 *   (needed when folder is first/last — there is no card further out)
 *
 * From the right: right edge / left edge = swap, center = nest.
 * From the left — same with sides flipped.
 *
 * Sortable `over` stays on the active item while hovering the folder so the
 * list doesn't animate a swap before drop.
 */
const findFolderPointerHit = (
  args: TCollisionArgs,
): TFolderPointerHit | null => {
  const pointer = args.pointerCoordinates;
  if (!pointer) return null;

  const activeRect =
    args.active.rect.current.initial ?? args.active.rect.current.translated;
  const activeCx = activeRect
    ? activeRect.left + activeRect.width / 2
    : pointer.x;

  for (const container of args.droppableContainers) {
    if (container.disabled) continue;
    if (isNestZoneCollision(args, container.id)) continue;
    const data = container.data.current as
      | { isFolder?: boolean; id?: number }
      | undefined;
    if (!data?.isFolder && !String(container.id).startsWith("folder:")) {
      continue;
    }
    const rect = container.rect.current;
    if (!rect) continue;

    const coverSize = Math.min(rect.width, rect.height);
    const cover = {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.top + coverSize,
    };
    const coverWidth = cover.right - cover.left;
    const folderCx = (cover.left + cover.right) / 2;
    const fromRight = activeCx >= folderCx;

    const edgeBand = coverWidth * REORDER_NEAR_RATIO;
    const nearReorder = fromRight
      ? {
          left: cover.right - edgeBand,
          right: cover.right,
          top: cover.top,
          bottom: cover.bottom,
        }
      : {
          left: cover.left,
          right: cover.left + edgeBand,
          top: cover.top,
          bottom: cover.bottom,
        };
    // Far edge = "drop past the folder" (e.g. folder first, drag lesson left).
    const farReorder = fromRight
      ? {
          left: cover.left,
          right: cover.left + edgeBand,
          top: cover.top,
          bottom: cover.bottom,
        }
      : {
          left: cover.right - edgeBand,
          right: cover.right,
          top: cover.top,
          bottom: cover.bottom,
        };

    // Nest = middle between the two edge bands.
    const nestRect = {
      left: fromRight ? farReorder.right : nearReorder.right,
      right: fromRight ? nearReorder.left : farReorder.left,
      top: cover.top,
      bottom: cover.bottom,
    };

    const folderNumericId =
      Number(data?.id) ||
      Number(String(container.id).replace(/^folder:/, "")) ||
      0;

    const gutterPad = Math.min(48, coverSize * 0.2);
    const nearGutter = fromRight
      ? {
          left: cover.right,
          right: cover.right + gutterPad,
          top: cover.top,
          bottom: cover.bottom,
        }
      : {
          left: cover.left - gutterPad,
          right: cover.left,
          top: cover.top,
          bottom: cover.bottom,
        };
    const farGutter = fromRight
      ? {
          left: cover.left - gutterPad,
          right: cover.left,
          top: cover.top,
          bottom: cover.bottom,
        }
      : {
          left: cover.right,
          right: cover.right + gutterPad,
          top: cover.top,
          bottom: cover.bottom,
        };

    if (
      pointerInRect(pointer, nearGutter) ||
      pointerInRect(pointer, nearReorder) ||
      pointerInRect(pointer, farGutter) ||
      pointerInRect(pointer, farReorder)
    ) {
      return { mode: "reorder", folderSortableId: container.id };
    }

    if (pointerInRect(pointer, nestRect)) {
      return {
        mode: "nest",
        folderSortableId: container.id,
        nestId: nestFolderDropId(folderNumericId),
      };
    }

    if (pointerInRect(pointer, cover)) {
      // Fallback: treat rest of cover as nest (large target).
      return {
        mode: "nest",
        folderSortableId: container.id,
        nestId: nestFolderDropId(folderNumericId),
      };
    }
  }
  return null;
};

const parseFolderIdFromDrop = (raw: string, dataId?: number) => {
  if (Number.isFinite(Number(dataId)) && Number(dataId) > 0) {
    return Number(dataId);
  }
  const nest = raw.match(/^nest:folder:(\d+)$/);
  if (nest) return Number(nest[1]);
  const folder = raw.match(/^folder:(\d+)$/);
  if (folder) return Number(folder[1]);
  return NaN;
};

type TProps = {
  lessons: TLesson[];
  canCreateLesson?: boolean;
  canAttachLesson?: boolean;
  onPressCreate?: () => void;
  getLessons: () => void;
  getCourses?: () => void;
  hideAttachButton?: boolean;
  showChangeStatusButton?: boolean;
  changeLessonStatus?: (relation_id?: number, status?: string) => void;
  deleteLessonRelation?: (relation_id?: number) => void;
  hideDeleteLessonButton?: boolean;
  showStartLessonButton?: boolean;
  isStudent?: boolean;
  isFreeTariff?: boolean;
  onPressCreateCourse?: () => void;
  onPressCreateBoard?: () => void;
  onPressCreateFolder?: () => void;
  isCourses?: boolean;
  openCourseModal?: () => void;
  currentCourse?: TCourse;
  hideContextMenu?: boolean;
  studentId?: string | number;
  alwaysOpenLessonMode?: boolean;
  enableCatalogDnd?: boolean;
  currentFolderId?: number | null;
  onEnterFolder?: (folderId: number) => void;
  onReorderItems?: (ordered: TCatalogOrderItem[]) => void;
  onDropOnFolder?: (
    item: TCatalogOrderItem,
    folderId: number,
  ) => void;
  onMoveToFolderRequest?: (lesson: TLesson & { type?: string }) => void;
  onEditFolder?: (folder: TLesson & { type?: string }) => void;
  onDeleteFolder?: (folder: TLesson & { type?: string }) => void;
};

export const LessonsList: FC<TProps> = ({
  lessons,
  canCreateLesson,
  onPressCreate,
  getLessons,
  hideAttachButton,
  showChangeStatusButton,
  changeLessonStatus,
  hideDeleteLessonButton,
  deleteLessonRelation,
  showStartLessonButton,
  isStudent,
  isFreeTariff,
  onPressCreateCourse,
  onPressCreateBoard,
  onPressCreateFolder,
  isCourses,
  getCourses = () => {},
  openCourseModal,
  currentCourse,
  hideContextMenu,
  studentId,
  alwaysOpenLessonMode,
  enableCatalogDnd,
  currentFolderId,
  onEnterFolder,
  onReorderItems,
  onDropOnFolder,
  onMoveToFolderRequest,
  onEditFolder,
  onDeleteFolder,
}) => {
  const { checkSubscription, subscription } = useCheckSubscription();
  const router = useRouter();
  const workspace = useCatalogWorkspace();
  const { profile } = useContext(AuthContext);
  const isTeacher =
    Number(profile?.role_id) === 2 || Number(profile?.role_id) === 1;
  const { courses, getCourses: getMyCourses } = useCourses();
  const [resolvedHwMap, setResolvedHwMap] = useState<
    Record<
      number,
      { homework_lesson_id?: number; has_individual_homework?: boolean }
    >
  >({});
  const lessonIdsForResolve = useMemo(() => lessons.map((l) => l.id), [lessons]);
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [chosenLesson, setChosenLesson] = useState<TLesson | null>(null);
  const [attachLessonModal, setAttachLessonModal] = useState(false);

  const [coursePageEditVisible, setCoursePageEditVisible] = useState(false);
  const [coursePageAttachLessonModal, setCoursePageAttachLessonModal] =
    useState(false);

  const [copyCourseIsLoading, setCopyCourseIsLoading] = useState(false);
  const [copyLessonModalOpen, setCopyLessonModalOpen] = useState(false);
  const [copyLessonId, setCopyLessonId] = useState<number | null>(null);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [dropTargetFolderId, setDropTargetFolderId] = useState<string | null>(
    null,
  );
  const [nestDragActive, setNestDragActive] = useState(false);
  const dropTargetFolderIdRef = useRef<string | null>(null);
  const intoFolderIdRef = useRef<string | null>(null);
  /** Folder sortable id for edge-swap; applied only on drop (no live animation). */
  const reorderFolderIdRef = useRef<string | null>(null);

  const catalogCollisionDetection = useCallback<CollisionDetection>((args) => {
    intoFolderIdRef.current = null;
    reorderFolderIdRef.current = null;
    const draggingFolder = !!args.active?.data?.current?.isFolder;

    // Never return nest:* as `over` — that breaks useSortable / ghost tracking.
    // Exclude folders from live sortable collisions while dragging a lesson so
    // crossing a folder toward the nest zone doesn't fire early swap animation.
    const sortableCollisions = () => {
      const centers = closestCenter(args).filter(
        (collision) =>
          !isNestZoneCollision(args, collision.id) &&
          !(
            !draggingFolder &&
            (String(collision.id).startsWith("folder:") ||
              !!args.droppableContainers.find((c) => c.id === collision.id)
                ?.data?.current?.isFolder)
          ),
      );
      return centers.length > 0 ? centers : [{ id: args.active.id }];
    };

    if (!draggingFolder) {
      const hit = findFolderPointerHit(args);
      if (hit?.mode === "nest") {
        intoFolderIdRef.current = hit.nestId;
        // Freeze list — nest decided on drop.
        return [{ id: args.active.id }];
      }
      if (hit?.mode === "reorder") {
        reorderFolderIdRef.current = String(hit.folderSortableId);
        // Freeze list during hover — swap with folder applied on drop only.
        return [{ id: args.active.id }];
      }
      return sortableCollisions();
    }

    return sortableCollisions();
  }, []);

  const lessonIdsKey = useMemo(
    () => lessons.map((l) => l.id).join(","),
    [lessons],
  );
  const [visibleLessonCount, setVisibleLessonCount] = useState(
    INITIAL_LESSON_BATCH,
  );

  useEffect(() => {
    setVisibleLessonCount(Math.min(INITIAL_LESSON_BATCH, lessons.length));
  }, [lessonIdsKey, lessons.length]);

  const visibleLessons = useMemo(
    () =>
      selectVisibleCatalogItems(lessons, visibleLessonCount, !!isCourses),
    [lessons, visibleLessonCount, isCourses],
  );
  const hasMoreLessonsToRender =
    !isCourses && visibleLessonCount < lessons.length;

  const revealSentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasMoreLessonsToRender || isCourses) return;
    const el = revealSentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleLessonCount((c) =>
          Math.min(c + LESSON_RENDER_STEP, lessons.length),
        );
      },
      { rootMargin: "480px 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMoreLessonsToRender, isCourses, lessons.length]);

  useEffect(() => {
    if (
      !isTeacher ||
      !studentId ||
      isCourses ||
      lessonIdsForResolve.length === 0
    ) {
      setResolvedHwMap({});
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchPostJson({
        path: "/lessons/homework/resolve-for-student",
        isSecure: true,
        data: {
          lesson_ids: lessonIdsForResolve,
          student_id: Number(studentId),
        },
      });
      const data = await res?.json();
      if (cancelled) return;
      if (data?.success && data?.by_lesson_id) {
        setResolvedHwMap(data.by_lesson_id);
      } else {
        setResolvedHwMap({});
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isTeacher, studentId, isCourses, lessonIdsForResolve]);

  const [
    attachLessonCourseModalIsVisible,
    setAttachLessonCourseModalIsVisible,
  ] = useState(false);
  const onPressEdit = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setEditIsVisible(true);
  }, []);
  const onPressAttachToCourse = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setAttachLessonCourseModalIsVisible(true);
  }, []);

  const onPressDelete = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setDeleteIsVisible(true);
  }, []);

  const onSuccessEdit = useCallback(() => {
    console.log("onSuccessEdit fired:");
    setEditIsVisible(false);
    setCoursePageEditVisible(false);
    setAttachLessonCourseModalIsVisible(false);
    getLessons();
    getCourses();
    setChosenLesson(null);
  }, [getLessons, getCourses]);

  const onAttachLesson = useCallback((lesson: TLesson) => {
    setChosenLesson(lesson);
    setAttachLessonModal(true);
  }, []);

  useEffect(() => {
    if (!editIsVisible && !deleteIsVisible) {
      setChosenLesson(null);
    }
  }, [editIsVisible, deleteIsVisible]);

  const copyLesson = useCallback(
    async (lesson_id: number) => {
      const isOwnCoursePage =
        !!currentCourse && currentCourse?.user_id === profile?.id;
      if (isOwnCoursePage) {
        await getMyCourses();
        setCopyLessonId(lesson_id);
        setCopyLessonModalOpen(true);
        return;
      }
      const res = await fetchPostJson({
        path: "/lessons/copy",
        isSecure: true,
        ...catalogFetchParams(workspace),
        data: { lesson_id },
      });
      const data = await res.json();
      window?.ym(103955671, "reachGoal", "lesson-copy");
      checkResponse(data);
      if (data?.success !== false) {
        window.dispatchEvent(new CustomEvent("catalog-lessons-changed"));
      }
      getLessons();
    },
    [currentCourse, getLessons, getMyCourses, profile?.id, workspace],
  );

  const copyCourse = useCallback(async () => {
    if (!checkSubscription()) {
      router.push("/subscription");
      return;
    }
    setCopyCourseIsLoading(true);
    const res = await fetchPostJson({
      path: "/course/copy",
      isSecure: true,
      ...catalogFetchParams(workspace),
      data: {
        id: currentCourse.id,
      },
    });
    const data = await res.json();
    checkResponse(data);
    setCopyCourseIsLoading(false);
    router.push(`/course/${data.id}`);
  }, [checkSubscription, currentCourse?.id, router, workspace]);

  const createPrimaryBtn =
    "w-full min-h-10 rounded-[14px] bg-primary text-sm font-medium text-white lg:min-h-11 lg:text-base";
  const actionMenuBtn =
    "w-full justify-start rounded-[10px] px-3 py-2 text-left text-sm font-medium text-brand-black";

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 8 },
    }),
  );

  const itemTypeOf = useCallback(
    (lesson: TLesson & { type?: string }): TCatalogOrderItem["type"] => {
      if (lesson.type === "folder" || lesson.type === "course" || lesson.type === "lesson") {
        return lesson.type;
      }
      if (isCourses) return "course";
      return "lesson";
    },
    [isCourses],
  );

  const sortableIds = useMemo(
    () =>
      visibleLessons.map(
        (lesson) => `${itemTypeOf(lesson as any)}:${lesson.id}`,
      ),
    [visibleLessons, itemTypeOf],
  );

  const syncDropTargetHighlight = useCallback(() => {
    const next = intoFolderIdRef.current;
    // Keep UI in sync every move — onDragOver alone won't fire when `over`
    // stays the same folder after leaving the center "into" zone.
    if (dropTargetFolderIdRef.current !== next) {
      dropTargetFolderIdRef.current = next;
      setDropTargetFolderId(next);
    }
  }, []);

  const clearDropTarget = useCallback(() => {
    intoFolderIdRef.current = null;
    reorderFolderIdRef.current = null;
    dropTargetFolderIdRef.current = null;
    setDropTargetFolderId(null);
    setNestDragActive(false);
  }, []);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      if (!enableCatalogDnd) return;
      const isFolder = !!event.active.data.current?.isFolder;
      setNestDragActive(!isFolder);
    },
    [enableCatalogDnd],
  );

  const handleDragMove = useCallback(
    (_event: DragMoveEvent) => {
      if (!enableCatalogDnd) return;
      syncDropTargetHighlight();
    },
    [enableCatalogDnd, syncDropTargetHighlight],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      // Trust only the last collision frame — never stale highlight / intent.
      const currentDropFolderId = intoFolderIdRef.current;
      const currentReorderFolderId = reorderFolderIdRef.current;
      clearDropTarget();
      if (!enableCatalogDnd) return;
      const { active, over } = event;

      const activeData = active.data.current as
        | { type?: string; id?: number; isFolder?: boolean }
        | undefined;

      const activeKey = String(active.id);
      const activeType =
        (activeData?.type as TCatalogOrderItem["type"] | undefined) ||
        (activeKey.startsWith("course:")
          ? "course"
          : activeKey.startsWith("folder:")
            ? "folder"
            : "lesson");
      const activeId = Number(activeData?.id ?? activeKey.split(":")[1]);

      // Nest first — from nest zone ref (not `over`).
      if (
        currentDropFolderId &&
        activeType !== "folder" &&
        Number.isFinite(activeId) &&
        onDropOnFolder
      ) {
        const folderId = parseFolderIdFromDrop(currentDropFolderId);
        if (Number.isFinite(folderId)) {
          onDropOnFolder({ type: activeType, id: activeId }, folderId);
          return;
        }
      }

      // Edge-swap with folder — applied on drop only (no live sortable preview).
      if (
        currentReorderFolderId &&
        activeType !== "folder" &&
        onReorderItems
      ) {
        const oldIndex = sortableIds.indexOf(activeKey);
        const newIndex = sortableIds.indexOf(currentReorderFolderId);
        if (oldIndex >= 0 && newIndex >= 0 && oldIndex !== newIndex) {
          const reordered = arrayMove(visibleLessons, oldIndex, newIndex);
          onReorderItems(
            reordered.map((lesson) => ({
              type: itemTypeOf(lesson as any),
              id: Number(lesson.id),
            })),
          );
          return;
        }
      }

      if (!over || active.id === over.id) return;

      const overKey = String(over.id);

      // Nest ids / folder ids are not live-sortable for lessons.
      if (overKey.startsWith("nest:folder:")) return;
      if (activeType !== "folder" && overKey.startsWith("folder:")) return;

      const oldIndex = sortableIds.indexOf(activeKey);
      const newIndex = sortableIds.indexOf(overKey);
      if (oldIndex < 0 || newIndex < 0 || !onReorderItems) return;
      const reordered = arrayMove(visibleLessons, oldIndex, newIndex);
      onReorderItems(
        reordered.map((lesson) => ({
          type: itemTypeOf(lesson as any),
          id: Number(lesson.id),
        })),
      );
    },
    [
      clearDropTarget,
      enableCatalogDnd,
      itemTypeOf,
      onDropOnFolder,
      onReorderItems,
      sortableIds,
      visibleLessons,
    ],
  );

  const handleEdit = useCallback(
    (lesson: TLesson & { type?: string }) => {
      if (lesson.type === "folder" && onEditFolder) {
        onEditFolder(lesson);
        return;
      }
      onPressEdit(lesson);
    },
    [onEditFolder, onPressEdit],
  );

  const handleDelete = useCallback(
    (lesson: TLesson & { type?: string }) => {
      if (lesson.type === "folder" && onDeleteFolder) {
        onDeleteFolder(lesson);
        return;
      }
      onPressDelete(lesson);
    },
    [onDeleteFolder, onPressDelete],
  );

  const grid = (
    <div className="mx-auto grid w-full max-w-full grid-cols-1 gap-x-3 gap-y-6 max-[1199px]:w-[80%] md:grid-cols-3 md:gap-x-4 md:gap-y-8 min-[1200px]:w-full min-[1200px]:grid-cols-4 min-[1200px]:gap-x-[30px] min-[1200px]:gap-y-10">
      {canCreateLesson && (
        <div className="flex w-full min-w-0 flex-col gap-3.5">
          <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-brand-gray lg:rounded-[30px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  currentCourse?.image_path
                    ? getImageUrl(currentCourse?.image_path)
                    : Bg.src
                })`,
              }}
            />
          </div>
          <Popover
            placement="bottom-start"
            isOpen={actionsOpen}
            onOpenChange={setActionsOpen}
          >
            <PopoverTrigger>
              <Button
                color="primary"
                className={createPrimaryBtn}
                size="lg"
              >
                <T k="lessons.actions" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[220px] items-stretch gap-0.5 bg-white p-2">
              {(profile?.role_id === 1 || profile?.role_id === 2) &&
                currentCourse?.user_id === 1 &&
                subscription?.subscribe_type_id !== 1 && (
                  <Button
                    variant="light"
                    className={actionMenuBtn}
                    isLoading={copyCourseIsLoading}
                    onClick={() => {
                      setActionsOpen(false);
                      void copyCourse();
                    }}
                  >
                    <T k="lessons.addToMyCourses" />
                  </Button>
                )}
              {(!currentCourse ||
                (currentCourse && currentCourse?.user_id === profile?.id)) && (
                <Button
                  variant="light"
                  className={actionMenuBtn}
                  onClick={() => {
                    setActionsOpen(false);
                    onPressCreate?.();
                  }}
                >
                  {currentCourse ? (
                    <T k="lessons.createLessonForCourse" />
                  ) : (
                    <T k="lessons.createLesson" />
                  )}
                </Button>
              )}
              {currentCourse && currentCourse?.user_id === profile?.id && (
                <Button
                  variant="light"
                  className={actionMenuBtn}
                  onClick={() => {
                    setActionsOpen(false);
                    setCoursePageEditVisible(true);
                  }}
                >
                  <T k="lessons.editCourse" />
                </Button>
              )}
              {currentCourse && currentCourse?.user_id === profile?.id && (
                <Button
                  variant="light"
                  className={actionMenuBtn}
                  onClick={() => {
                    setActionsOpen(false);
                    setCoursePageAttachLessonModal(true);
                  }}
                >
                  <T k="lessons.attachStudents" />
                </Button>
              )}
              {!currentCourse && (
                <Button
                  variant="light"
                  className={actionMenuBtn}
                  onClick={() => {
                    setActionsOpen(false);
                    onPressCreateCourse?.();
                  }}
                >
                  <T k="lessons.createCourse" />
                </Button>
              )}
              {!currentCourse && onPressCreateBoard && (
                <Button
                  variant="light"
                  className={actionMenuBtn}
                  onClick={() => {
                    setActionsOpen(false);
                    onPressCreateBoard();
                  }}
                >
                  <T k="boards.createBoard" />
                </Button>
              )}
              {!currentCourse &&
                currentFolderId == null &&
                onPressCreateFolder && (
                  <Button
                    variant="light"
                    className={actionMenuBtn}
                    onClick={() => {
                      setActionsOpen(false);
                      // Let the Actions popover unmount before opening the modal
                      // so portal positioning isn't skewed by the popover transform.
                      window.setTimeout(() => onPressCreateFolder(), 0);
                    }}
                  >
                    <T k="lessons.createFolder" />
                  </Button>
                )}
            </PopoverContent>
          </Popover>
        </div>
      )}
      {visibleLessons?.map((lesson) => {
        const typed = lesson as TLesson & { type?: string };
        return (
          <SortableCatalogCard
            studentId={studentId}
            key={`${itemTypeOf(typed)}:${lesson.id}:${lesson?.["lesson_relations.status"] || 0}`}
            enableDnd={enableCatalogDnd}
            nestDragActive={nestDragActive}
            isDropTarget={
              dropTargetFolderId === `nest:folder:${lesson.id}` ||
              dropTargetFolderId === `folder:${lesson.id}`
            }
            isCourses={isCourses || typed.type === "course"}
            lesson={typed}
            batchResolveEnabled={isTeacher && !!studentId && !isCourses}
            resolvedHw={resolvedHwMap?.[lesson.id] || {}}
            onPressEdit={handleEdit}
            onPressDelete={handleDelete}
            onPressAttach={onAttachLesson}
            hideAttachButton={hideAttachButton}
            showChangeStatusButton={showChangeStatusButton}
            changeLessonStatus={changeLessonStatus}
            hideDeleteLessonButton={hideDeleteLessonButton}
            deleteLessonRelation={deleteLessonRelation}
            showStartLessonButton={showStartLessonButton}
            onPressAttachToCourse={onPressAttachToCourse}
            isStudent={isStudent}
            copyLesson={copyLesson}
            hideContextMenu={hideContextMenu}
            isClosed={isLessonLockedOnFreeTariff(lesson, isFreeTariff, isStudent)}
            currentCourse={currentCourse}
            alwaysOpenLessonMode={alwaysOpenLessonMode}
            onHomeworkCreated={getLessons}
            onEnterFolder={onEnterFolder}
            onMoveToFolderRequest={onMoveToFolderRequest}
          />
        );
      })}

      {hasMoreLessonsToRender && (
        <div
          ref={revealSentinelRef}
          className="w-full min-h-[120px] shrink-0"
          aria-hidden
        />
      )}

      {!!copyLessonId && (
        <CopyLessonToModal
          isOpen={copyLessonModalOpen}
          onClose={() => {
            setCopyLessonModalOpen(false);
          }}
          lessonId={copyLessonId}
          courseOptions={(courses || [])
            .filter(
              (c) =>
                c?.user_id === profile?.id &&
                (!currentCourse || c.id !== currentCourse.id),
            )
            .map((c) => ({ id: c.id, title: c.title, image_path: c.image_path }))}
          onAfterCopy={() => {
            getLessons();
            getCourses();
          }}
        />
      )}

      {currentCourse && (
        <>
          <CreateCourseModalForm
            isVisible={coursePageEditVisible}
            setIsVisible={setCoursePageEditVisible}
            onSuccess={onSuccessEdit}
            chosenCourse={currentCourse}
          />
          <AttachLessonModalForm
            isVisible={coursePageAttachLessonModal}
            setIsVisible={setCoursePageAttachLessonModal}
            isCourses={true}
            onSuccess={() => {
              setCoursePageAttachLessonModal(false);
            }}
            lesson={currentCourse}
          />
        </>
      )}

      {!!chosenLesson && (chosenLesson as any).type === "folder" && (
        <AttachLessonModalForm
          isVisible={attachLessonModal}
          setIsVisible={setAttachLessonModal}
          onSuccess={() => {
            setAttachLessonModal(false);
            getLessons();
          }}
          lesson={chosenLesson}
        />
      )}

      {!!chosenLesson && (chosenLesson as any).type !== "folder" && (
        <>
          {isCourses || (chosenLesson as any).type === "course" ? (
            <CreateCourseModalForm
              isVisible={editIsVisible}
              setIsVisible={setEditIsVisible}
              onSuccess={onSuccessEdit}
              chosenCourse={chosenLesson}
            />
          ) : (
            <EditLessonModalForm
              isVisible={editIsVisible}
              setIsVisible={setEditIsVisible}
              lesson={chosenLesson}
              key={chosenLesson?.id}
              onSuccess={onSuccessEdit}
            />
          )}
          <DeleteLessonModalForm
            isVisible={deleteIsVisible}
            setIsVisible={setDeleteIsVisible}
            lesson={chosenLesson}
            key={chosenLesson?.id}
            onSuccess={onSuccessEdit}
            isCourses={isCourses || (chosenLesson as any).type === "course"}
          />
          <AttachLessonModalForm
            isVisible={attachLessonModal}
            setIsVisible={setAttachLessonModal}
            isCourses={isCourses || (chosenLesson as any).type === "course"}
            onSuccess={() => {
              setAttachLessonModal(false);
            }}
            lesson={chosenLesson}
          />
          <AttachLessonCourseModalForm
            isVisible={attachLessonCourseModalIsVisible}
            setIsVisible={setAttachLessonCourseModalIsVisible}
            lessonId={chosenLesson?.id}
            onSuccess={onSuccessEdit}
            chosenLesson={chosenLesson}
            openCourseModal={openCourseModal}
          />
        </>
      )}
    </div>
  );

  if (!enableCatalogDnd) {
    return grid;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={catalogCollisionDetection}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDropTarget}
    >
      <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
        {grid}
      </SortableContext>
    </DndContext>
  );
};
