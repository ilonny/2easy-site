import { Button } from "@nextui-org/react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLessons } from "../../hooks/useLessons";
import { ProfileEmptyLessons } from "../ProfileEmptyLessons";
import { CreateLessonModalForm } from "../CreateLessonModalForm";
import { LessonsList } from "../LessonsList";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Dino from "@/assets/images/dino.gif";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AuthContext } from "@/auth";

type TProps = {
  canCreateLesson?: boolean;
  studentId?: string;
  hideTabs?: boolean;
  hideAttachButton?: boolean;
  showChangeStatusButton?: boolean;
  hideDeleteLessonButton?: boolean;
  searchString?: string;
  showStartLessonButton?: boolean;
  isStudent?: boolean;
};

export const ProfileLessons = (props: TProps) => {
  const {
    canCreateLesson = true,
    studentId,
    hideTabs,
    hideAttachButton,
    showChangeStatusButton,
    hideDeleteLessonButton,
    searchString,
    showStartLessonButton,
    isStudent,
  } = props;
  const router = useRouter();
  const { profile } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2;

  const [tabIndex, setTabIndex] = useState<"userLessons" | "savedLessons">(
    "userLessons"
  );

  const [createLessonModalIsVisible, setCreateLessonModalIsVisible] =
    useState(false);

  const {
    lessons,
    getLessons,
    lessonsListIslLoading,
    changeLessonStatus,
    deleteLessonRelation,
  } = useLessons(studentId, searchString);

  const data = useMemo(() => {
    const title =
      tabIndex === "userLessons"
        ? "У вас пока нет уроков.\nСоздайте свой первый урок с конструктором 2EASY"
        : "У вас нет сохраненных уроков.";
    const buttonTitle =
      tabIndex === "userLessons" ? "Cоздать урок" : "Выбрать урок 2EASY";

    const onButtonPress = () => {
      if (tabIndex === "userLessons") {
        setCreateLessonModalIsVisible(true);
        return;
      }
    };

    return { title, buttonTitle, onButtonPress };
  }, [tabIndex]);

  const onCreateLesson = useCallback(
    (lessonId: number) => {
      setCreateLessonModalIsVisible(false);
      getLessons();
      router.push("/editor/" + lessonId);
    },
    [getLessons, router]
  );

  useEffect(() => {
    getLessons();
  }, [getLessons]);

  const { checkSubscription } = useCheckSubscription();

  const lessonsToRender = useMemo(() => {
    if (!isTeacher) {
      return lessons;
    }
    if (tabIndex === "userLessons" && !studentId) {
      return lessons.filter((l) => l.user_id !== 1);
    }
    // return lessons;
    return lessons.filter((l) => l.user_id === 1);
  }, [isTeacher, lessons, tabIndex, studentId]);

  return (
    <>
      {!hideTabs && (
        <div className="flex gap-5">
          <Button
            radius="full"
            color="primary"
            variant={tabIndex === "userLessons" ? "solid" : "faded"}
            onClick={() => setTabIndex("userLessons")}
          >
            Мои уроки
          </Button>
          <Button
            radius="full"
            color="primary"
            variant={tabIndex === "savedLessons" ? "solid" : "faded"}
            onClick={() => setTabIndex("savedLessons")}
          >
            Уроки 2EASY
          </Button>
        </div>
      )}
      <div className="h-10" />
      {lessonsListIslLoading && (
        <div className="w-full h-[500px] flex justify-center items-center ">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      )}
      {!lessons.length && (
        <ProfileEmptyLessons
          title={studentId ? "Пока нет уроков." : data.title}
          hideButton={!!studentId}
          buttonTitle={data.buttonTitle}
          onButtonPress={data.onButtonPress}
        />
      )}
      {!!lessons?.length && (
        <LessonsList
          onPressCreate={() => {
            if (checkSubscription()) {
              setCreateLessonModalIsVisible(true);
            }
          }}
          canCreateLesson={canCreateLesson}
          lessons={lessonsToRender}
          getLessons={getLessons}
          hideAttachButton={hideAttachButton}
          showChangeStatusButton={showChangeStatusButton}
          changeLessonStatus={changeLessonStatus}
          hideDeleteLessonButton={hideDeleteLessonButton}
          deleteLessonRelation={deleteLessonRelation}
          showStartLessonButton={showStartLessonButton}
          isStudent={isStudent}
        />
      )}
      <CreateLessonModalForm
        isVisible={createLessonModalIsVisible}
        setIsVisible={setCreateLessonModalIsVisible}
        onSuccess={onCreateLesson}
      />
    </>
  );
};
