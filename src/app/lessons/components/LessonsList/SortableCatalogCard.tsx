"use client";

import { useDroppable } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties, FC } from "react";
import { LessonCard } from "../LessonCard";
import { TLesson } from "../../types";
import { TCourse } from "@/app/course/hooks/useCourses";
import { T } from "@/i18n/T";

export const nestFolderDropId = (folderId: number | string) =>
  `nest:folder:${folderId}`;

/** Visual size of the nest overlay on the folder cover. */
export const NEST_ZONE_RATIO = 0.72;

/** Edge strips on the folder cover used for reorder/swap on drop (both sides). */
export const REORDER_NEAR_RATIO = 0.24;

type TProps = {
  lesson: TLesson & { type?: string };
  enableDnd?: boolean;
  /** Dragging a lesson/course — show nest zones on folders. */
  nestDragActive?: boolean;
  /** Pointer is over this folder's center nest square. */
  isDropTarget?: boolean;
  studentId?: string | number;
  isCourses?: boolean;
  batchResolveEnabled?: boolean;
  resolvedHw?: { homework_lesson_id?: number; has_individual_homework?: boolean };
  onPressEdit?: (lesson: TLesson) => void;
  onPressDelete?: (lesson: TLesson) => void;
  onPressAttach?: (lesson: TLesson) => void;
  hideAttachButton?: boolean;
  showChangeStatusButton?: boolean;
  changeLessonStatus?: (...args: any[]) => void;
  hideDeleteLessonButton?: boolean;
  deleteLessonRelation?: (relation_id?: number) => void;
  showStartLessonButton?: boolean;
  onPressAttachToCourse?: (lesson: TLesson) => void;
  isStudent?: boolean;
  copyLesson?: (lesson_id: number) => Promise<void>;
  hideContextMenu?: boolean;
  isClosed?: boolean;
  currentCourse?: TCourse;
  alwaysOpenLessonMode?: boolean;
  onHomeworkCreated?: () => void;
  onEnterFolder?: (folderId: number) => void;
  onMoveToFolderRequest?: (lesson: TLesson & { type?: string }) => void;
};

export const SortableCatalogCard: FC<TProps> = ({
  lesson,
  enableDnd,
  nestDragActive = false,
  isDropTarget = false,
  onEnterFolder,
  onMoveToFolderRequest,
  ...cardProps
}) => {
  const itemType =
    (lesson as any).type || (cardProps.isCourses ? "course" : "lesson");
  const isFolder = itemType === "folder";
  const canDrag = !!enableDnd && !!lesson.canEdit;
  const sortableId = `${itemType}:${lesson.id}`;
  const nestId = nestFolderDropId(lesson.id);

  const {
    attributes,
    listeners,
    setNodeRef: setSortableRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: sortableId,
    disabled: !canDrag,
    // Only pin layout on the folder currently targeted for nest — elsewhere
    // keep normal sortable slide animations.
    animateLayoutChanges:
      isFolder && isDropTarget ? () => false : undefined,
    data: {
      type: itemType,
      id: Number(lesson.id),
      isFolder,
    },
  });

  const { setNodeRef: setNestRef } = useDroppable({
    id: nestId,
    disabled: !isFolder || !enableDnd,
    data: {
      type: "folder",
      id: Number(lesson.id),
      isFolder: true,
      isNestZone: true,
    },
  });

  // Freeze only the nest-target folder so its hit-rect stays put; other cards
  // keep sortable transforms/animations (including other folders on reorder).
  const freezeForNest = isFolder && isDropTarget && !isDragging;

  const style: CSSProperties = {
    transform: freezeForNest ? undefined : CSS.Transform.toString(transform),
    transition: freezeForNest ? undefined : transition,
    opacity: isDragging ? 0.55 : 1,
    // Above nest overlays so the dragged card (ghost) stays visible.
    zIndex: isDragging ? 40 : undefined,
    position: isDragging ? "relative" : undefined,
  };

  return (
    <div
      ref={setSortableRef}
      style={style}
      className="relative min-w-0 rounded-[20px] lg:rounded-[30px]"
      data-drop-folder={isFolder ? "1" : undefined}
      data-catalog-id={sortableId}
    >
      <LessonCard
        {...cardProps}
        lesson={lesson}
        isFolder={isFolder}
        isCourses={
          isFolder ? false : cardProps.isCourses || itemType === "course"
        }
        onPressFolder={
          isFolder && onEnterFolder
            ? () => onEnterFolder(lesson.id)
            : undefined
        }
        onMoveToFolder={
          !isFolder && onMoveToFolderRequest
            ? () => onMoveToFolderRequest(lesson)
            : undefined
        }
        onPressEdit={
          cardProps.onPressEdit
            ? (l) => cardProps.onPressEdit?.(l)
            : undefined
        }
        dragHandleProps={
          canDrag ? ({ ...attributes, ...listeners } as any) : undefined
        }
      />
      {isFolder && (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-[6] aspect-square"
          aria-hidden
        >
          <div
            ref={setNestRef}
            className="absolute left-1/2 top-1/2 aspect-square -translate-x-1/2 -translate-y-1/2"
            style={{ width: `${NEST_ZONE_RATIO * 100}%` }}
            data-nest-folder={lesson.id}
          >
            <div
              className={`flex h-full w-full flex-col items-center justify-center gap-1.5 rounded-[18px] border-2 border-dashed px-2.5 text-center shadow-lg backdrop-blur-md transition-[transform,opacity,background-color,border-color] duration-150 ease-out ${
                nestDragActive
                  ? isDropTarget
                    ? "scale-100 border-primary bg-primary/92 text-white opacity-100"
                    : "scale-95 border-white/40 bg-brand-black/25 text-white/90 opacity-40"
                  : "scale-90 border-transparent bg-transparent opacity-0"
              }`}
            >
              {nestDragActive ? (
                <>
                  <span className="text-[28px] leading-none drop-shadow-sm lg:text-[32px]">
                    📁
                  </span>
                  <span className="max-w-[9.5rem] text-[11px] font-semibold leading-snug tracking-brand lg:text-xs">
                    <T k="lessons.moveToFolder" />
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
