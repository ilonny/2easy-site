import { FC, useCallback, useContext, useEffect, useState } from "react";
import { TLesson } from "../../types";
import { LessonCard } from "../LessonCard";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { Button } from "@nextui-org/react";
import { EditLessonModalForm } from "../EditLessonModalForm";
import { DeleteLessonModalForm } from "../DeleteLessonModalForm";
import { AttachLessonModalForm } from "../AttachLessonModalForm";
import { BASE_URL, checkResponse, fetchPostJson } from "@/api";
import { CreateCourseModalForm } from "../CreateCourseModalForm";
import { useLessons } from "../../hooks/useLessons";
import { AttachLessonCourseModalForm } from "../AttachLessonCourseModalForm";
import { TCourse } from "@/app/course/hooks/useCourses";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";

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
  isCourses?: boolean;
  openCourseModal?: () => void;
  currentCourse?: TCourse;
  hideContextMenu?: boolean;
  studentId?: string | number;
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
  isCourses,
  getCourses,
  openCourseModal,
  currentCourse,
  hideContextMenu,
  studentId,
}) => {
  const { checkSubscription, subscription } = useCheckSubscription();
  const router = useRouter();
  const { profile } = useContext(AuthContext);
  const [editIsVisible, setEditIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [chosenLesson, setChosenLesson] = useState<TLesson | null>(null);
  const [attachLessonModal, setAttachLessonModal] = useState(false);

  const [coursePageEditVisible, setCoursePageEditVisible] = useState(false);
  const [coursePageAttachLessonModal, setCoursePageAttachLessonModal] =
    useState(false);

  const [copyCourseIsLoading, setCopyCourseIsLoading] = useState(false);

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
      const res = await fetchPostJson({
        path: "/lessons/copy",
        isSecure: true,
        data: {
          lesson_id,
        },
      });
      const data = await res.json();
      window?.ym(103955671, "reachGoal", "lesson-copy");
      checkResponse(data);
      getLessons();
    },
    [getLessons]
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

  return (
    <div className="flex items-start justify-start w-full flex-wrap">
      {canCreateLesson && (
        <div className="p-2 w-[100%] lg:w-[25%]">
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
                    ? `${BASE_URL}/${currentCourse.image_path}`
                    : Bg.src
                }) center center no-repeat #fff`,
                backgroundSize: "cover",
              }}
            />
          </div>
          <div
            className="p-4 bg-white flex items-center justify-center flex-col gap-2"
            style={{
              height: !currentCourse ? 140 : "auto",
              borderBottomLeftRadius: 4,
              borderBottomRightRadius: 4,
            }}
          >
            {(profile?.role_id === 1 || profile?.role_id === 2) &&
              currentCourse?.user_id === 1 &&
              subscription?.subscribe_type_id !== 1 && (
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={copyCourse}
                  isLoading={copyCourseIsLoading}
                >
                  Добавить в "Мои курсы"
                </Button>
              )}
            {(!currentCourse ||
              (currentCourse && currentCourse?.user_id === profile?.id)) && (
              <Button
                color="primary"
                className="w-full"
                size="lg"
                onClick={onPressCreate}
              >
                {currentCourse ? "Создать урок для курса" : "Создать урок"}
              </Button>
            )}
            {currentCourse && currentCourse?.user_id === profile?.id && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className="btn-secondary-bg w-full"
                size="lg"
                onClick={() => {
                  setCoursePageEditVisible(true);
                }}
              >
                <span style={{ color: "#3F28C6" }}>Редактировать курс</span>
              </Button>
            )}
            {currentCourse && currentCourse?.user_id === profile?.id && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className="btn-secondary-bg w-full"
                size="lg"
                onClick={() => setCoursePageAttachLessonModal(true)}
              >
                <span style={{ color: "#3F28C6" }}>Прикрепить учеников</span>
              </Button>
            )}
            {!currentCourse && (
              <Button
                color="secondary"
                variant="flat"
                style={{ outline: "none" }}
                className="btn-secondary-bg w-full"
                size="lg"
                onClick={onPressCreateCourse}
              >
                <span style={{ color: "#3F28C6" }}>Создать курс</span>
              </Button>
            )}
          </div>
        </div>
      )}
      {lessons?.map((lesson) => {
        return (
          <LessonCard
            studentId={studentId}
            key={
              lesson.id.toString() + lesson?.["lesson_relations.status"] || 0
            }
            isCourses={isCourses}
            lesson={lesson}
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
          />
        );
      })}

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
