"use client";
import { FC, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { TLesson } from "../../types";
import { LessonCard } from "../LessonCard";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { EditLessonModalForm } from "../EditLessonModalForm";
import { DeleteLessonModalForm } from "../DeleteLessonModalForm";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { checkResponse, fetchPostJson } from "@/api";
import { CreateCourseModalForm } from "../CreateCourseModalForm";
import { AttachLessonCourseModalForm } from "../AttachLessonCourseModalForm";
import { TCourse } from "@/app/course/hooks/useCourses";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { getImageUrl } from "@/app/editor/helpers";
import { CopyLessonToModal } from "../CopyLessonToModal";
import { useCourses } from "@/app/course/hooks/useCourses";
import { T } from "@/i18n/T";

const INITIAL_LESSON_BATCH = 24;
const LESSON_RENDER_STEP = 24;

type TProps = {
  lessons: TLesson[];
  canCreateLesson?: boolean;
  canAttachLesson?: boolean;
  onPressCreate?: () => void;
  getLessons: () => void;
  getCourses: () => void;
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
  isCourses?: boolean;
  openCourseModal?: () => void;
  currentCourse?: TCourse;
  hideContextMenu?: boolean;
  studentId?: string | number;
  alwaysOpenLessonMode?: boolean;
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
  isCourses,
  getCourses,
  openCourseModal,
  currentCourse,
  hideContextMenu,
  studentId,
  alwaysOpenLessonMode,
}) => {
  const { checkSubscription, subscription } = useCheckSubscription();
  const router = useRouter();
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
    () => lessons.slice(0, visibleLessonCount),
    [lessons, visibleLessonCount],
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
        data: { lesson_id },
      });
      const data = await res.json();
      window?.ym(103955671, "reachGoal", "lesson-copy");
      checkResponse(data);
      getLessons();
    },
    [currentCourse, getLessons, getMyCourses, profile?.id],
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
      data: {
        id: currentCourse.id,
      },
    });
    const data = await res.json();
    checkResponse(data);
    setCopyCourseIsLoading(false);
    router.push(`/course/${data.id}`);
  }, [checkSubscription, currentCourse?.id, router]);

  const createCardFooterHeight = useMemo(() => {
    if (currentCourse) {
      return undefined;
    }
    return onPressCreateBoard ? 196 : 140;
  }, [currentCourse, onPressCreateBoard]);

  const createActionButtonClass =
    "w-full flex-shrink-0 min-h-12 h-12";

  return (
    <div className="flex items-start justify-start w-full flex-wrap">
      {canCreateLesson && (
        <div className="p-2 w-[100%] md:w-1/2 lg:w-[25%]">
          <div
            className="image-wrapper"
            style={{
              width: "100%",
              height: 317,
              position: "relative",
              overflow: "hidden",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            <div
              style={{
                width: "104%",
                height: "104%",
                background: `url(${
                  currentCourse?.image_path
                    ? getImageUrl(currentCourse?.image_path)
                    : Bg.src
                }) center center no-repeat #fff`,
                backgroundSize: "cover",
              }}
            />
          </div>
          <div
            className="p-4 bg-white flex items-center justify-center flex-col gap-2"
            style={{
              height: createCardFooterHeight,
              minHeight: createCardFooterHeight,
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            {(profile?.role_id === 1 || profile?.role_id === 2) &&
              currentCourse?.user_id === 1 &&
              subscription?.subscribe_type_id !== 1 && (
                <Button
                  color="primary"
                  className={createActionButtonClass}
                  size="lg"
                  onClick={copyCourse}
                  isLoading={copyCourseIsLoading}
                >
                  <T k="lessons.addToMyCourses" />
                </Button>
              )}
            {(!currentCourse ||
              (currentCourse && currentCourse?.user_id === profile?.id)) && (
              <Button
                color="primary"
                className={createActionButtonClass}
                size="lg"
                onClick={onPressCreate}
              >
                {currentCourse ? <T k="lessons.createLessonForCourse" /> : <T k="lessons.createLesson" />}
              </Button>
            )}
            {currentCourse && currentCourse?.user_id === profile?.id && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className={`btn-secondary-bg ${createActionButtonClass}`}
                size="lg"
                onClick={() => {
                  setCoursePageEditVisible(true);
                }}
              >
                <span style={{ color: "#3F28C6" }}><T k="lessons.editCourse" /></span>
              </Button>
            )}
            {currentCourse && currentCourse?.user_id === profile?.id && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className={`btn-secondary-bg ${createActionButtonClass}`}
                size="lg"
                onClick={() => setCoursePageAttachLessonModal(true)}
              >
                <span style={{ color: "#3F28C6" }}><T k="lessons.attachStudents" /></span>
              </Button>
            )}
            {!currentCourse && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className={`btn-secondary-bg ${createActionButtonClass}`}
                size="lg"
                onClick={onPressCreateCourse}
              >
                <span style={{ color: "#3F28C6" }}><T k="lessons.createCourse" /></span>
              </Button>
            )}
            {!currentCourse && onPressCreateBoard && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className={`btn-secondary-bg ${createActionButtonClass}`}
                size="lg"
                onClick={onPressCreateBoard}
              >
                <span style={{ color: "#3F28C6" }}><T k="boards.createBoard" /></span>
              </Button>
            )}
          </div>
        </div>
      )}
      {visibleLessons?.map((lesson) => {
        return (
          <LessonCard
            studentId={studentId}
            key={
              lesson.id.toString() + lesson?.["lesson_relations.status"] || 0
            }
            isCourses={isCourses}
            lesson={lesson}
            batchResolveEnabled={isTeacher && !!studentId && !isCourses}
            resolvedHw={resolvedHwMap?.[lesson.id] || {}}
            onPressEdit={onPressEdit}
            onPressDelete={onPressDelete}
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
            isClosed={
              isFreeTariff &&
              !lesson.is_free &&
              (lesson.user_id === 1 || lesson.created_from_2easy)
            }
            currentCourse={currentCourse}
            alwaysOpenLessonMode={alwaysOpenLessonMode}
            onHomeworkCreated={getLessons}
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

      {!!chosenLesson && (
        <>
          {isCourses ? (
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
            isCourses={isCourses}
          />
          <AttachLessonModalForm
            isVisible={attachLessonModal}
            setIsVisible={setAttachLessonModal}
            isCourses={isCourses}
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
};
