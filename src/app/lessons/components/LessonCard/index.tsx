"use client";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { TLesson } from "../../types";
import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import styles from "./styles.module.css";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Radio,
  RadioGroup,
} from "@nextui-org/react";
import Ellipse from "@/assets/icons/ellipse.svg";
import DeleteIcon from "@/assets/icons/delete.svg";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Bg from "@/assets/images/create_lesson_bg_card.png";
import { LessonStatus } from "./LessonStatus";
import { AuthContext } from "@/auth";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { writeToLocalStorage } from "@/auth/utils";
import LockIcon from "@/assets/icons/lock.svg";
import HeartImage from "@/assets/images/3d-glassy-fuzzy-pink-heart-with-a-happy-face.png";
import { SubscribeTariffs } from "@/subscribe";
import { RegistrationForm } from "@/app/registration";
import Link from "next/link";
import { TCourse } from "@/app/course/hooks/useCourses";
import { getImageUrl } from "@/app/editor/helpers";
import { CreateHomeworkModal } from "../CreateHomeworkModal";
import { CreateIndividualHomeworkModal } from "../CreateIndividualHomeworkModal";

type TProps = {
  lesson: TLesson;
  onPressEdit?: (lesson: TLesson) => void;
  onPressDelete?: (lesson: TLesson) => void;
  onPressAttach?: (lesson: TLesson) => void;
  onPressAttachToCourse?: (lesson: TLesson) => void;
  hideAttachButton?: boolean;
  showChangeStatusButton?: boolean;
  changeLessonStatus?: (
    relation_id?: number,
    status?: string,
    lesson_id?: number,
    student_id?: number,
  ) => void;
  deleteLessonRelation?: (relation?: number) => void;
  hideDeleteLessonButton?: boolean;
  showStartLessonButton?: boolean;
  isStudent?: boolean;
  disableClick?: boolean;
  copyLesson?: (lesson_id: number) => Promise<void>;
  isClosed?: boolean;
  isCourses?: boolean;
  currentCourse?: TCourse;
  hideContextMenu?: boolean;
  studentId?: number | string;
  alwaysOpenLessonMode?: boolean;
  onHomeworkCreated?: () => void;
};

export const LessonCard: FC<TProps> = ({
  lesson,
  onPressEdit,
  onPressDelete,
  onPressAttach,
  hideAttachButton,
  showChangeStatusButton,
  changeLessonStatus,
  hideDeleteLessonButton,
  deleteLessonRelation,
  showStartLessonButton,
  isStudent,
  disableClick,
  copyLesson,
  isClosed,
  isCourses,
  onPressAttachToCourse,
  currentCourse,
  hideContextMenu,
  studentId,
  alwaysOpenLessonMode,
  onHomeworkCreated,
}) => {
  const { t } = useTranslation();
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const { profile } = useContext(AuthContext);
  const isTeacher =
    Number(profile?.role_id) === 2 || Number(profile?.role_id) === 1;
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const [lockedModalOpen, setLockedModalOpen] = useState(false);
  const [tryNowModal, setTryNowModal] = useState(false);
  const [regModal, setRegModal] = useState(false);
  const [createHomeworkModalVisible, setCreateHomeworkModalVisible] =
    useState(false);
  const [courseHomeworkModalVisible, setCourseHomeworkModalVisible] =
    useState(false);
  const [courseHomeworkExList, setCourseHomeworkExList] = useState<
    Array<{ id: number; type: string; data?: string; sortIndex?: number }>
  >([]);
  const [courseHomeworkCheck, setCourseHomeworkCheck] = useState<{
    loaded: boolean;
    exists: boolean;
    homeworkId?: number;
  }>({ loaded: false, exists: false });
  const [resolvedHw, setResolvedHw] = useState<{
    homework_lesson_id?: number;
    has_individual_homework?: boolean;
  } | null>(null);

  useEffect(() => {
    if (
      !isTeacher ||
      !studentId ||
      !showStartLessonButton ||
      isCourses ||
      !lesson?.id
    ) {
      setResolvedHw(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const res = await fetchPostJson({
        path: "/lessons/homework/resolve-for-student",
        isSecure: true,
        data: {
          lesson_id: lesson.id,
          student_id: Number(studentId),
        },
      });
      const data = await res?.json();
      if (cancelled) {
        return;
      }
      if (data?.success) {
        setResolvedHw({
          homework_lesson_id: data.homework_lesson_id,
          has_individual_homework: !!data.has_individual_homework,
        });
      } else {
        setResolvedHw(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [
    isTeacher,
    studentId,
    showStartLessonButton,
    isCourses,
    lesson?.id,
  ]);

  useEffect(() => {
    if (
      !isTeacher ||
      studentId ||
      !currentCourse ||
      !lesson?.id ||
      !showStartLessonButton ||
      isCourses
    ) {
      setCourseHomeworkCheck({ loaded: false, exists: false });
      return;
    }
    let cancelled = false;
    fetchPostJson({
      path: "/lessons/homework/check",
      isSecure: true,
      data: { lesson_id: lesson.id },
    })
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) {
          return;
        }
        setCourseHomeworkCheck({
          loaded: true,
          exists: !!data?.exists,
          homeworkId: data?.first_homework_id,
        });
      })
      .catch(() => {
        if (!cancelled) {
          setCourseHomeworkCheck({ loaded: true, exists: false });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    isTeacher,
    studentId,
    currentCourse,
    lesson?.id,
    showStartLessonButton,
    isCourses,
  ]);

  useEffect(() => {
    if (!courseHomeworkModalVisible || !lesson?.id) {
      return;
    }
    fetchGet({
      path: `/ex/list?lesson_id=${lesson.id}`,
      isSecure: true,
    })
      .then((r) => r.json())
      .then((list) => {
        setCourseHomeworkExList(Array.isArray(list) ? list : []);
      })
      .catch(() => setCourseHomeworkExList([]));
  }, [courseHomeworkModalVisible, lesson?.id]);

  const lessonHomeworkExists = useMemo(() => {
    const raw = lesson?.homework_lesson_id;
    if (raw != null && raw !== "") {
      const n = Number(raw);
      if (!Number.isNaN(n) && n > 0) {
        return true;
      }
    }
    return !!lesson?.has_individual_homework;
  }, [lesson?.homework_lesson_id, lesson?.has_individual_homework]);

  const homeworkAlreadyExists = useMemo(() => {
    if (resolvedHw === null) {
      return lessonHomeworkExists;
    }
    const rid = resolvedHw.homework_lesson_id;
    if (rid != null && Number(rid) > 0) {
      return true;
    }
    if (resolvedHw.has_individual_homework) {
      return true;
    }
    return lessonHomeworkExists;
  }, [resolvedHw, lessonHomeworkExists]);

  const effectiveHomeworkLessonId = useMemo(() => {
    const fromResolved =
      resolvedHw !== null &&
      resolvedHw.homework_lesson_id != null &&
      Number(resolvedHw.homework_lesson_id) > 0
        ? Number(resolvedHw.homework_lesson_id)
        : undefined;
    const raw = lesson?.homework_lesson_id;
    const fromLesson =
      raw != null && raw !== ""
        ? (() => {
            const n = Number(raw);
            return !Number.isNaN(n) && n > 0 ? n : undefined;
          })()
        : undefined;
    return fromResolved ?? fromLesson;
  }, [resolvedHw, lesson?.homework_lesson_id]);

  const effectiveHasIndividualHomework = useMemo(() => {
    if (resolvedHw !== null && resolvedHw.has_individual_homework) {
      return true;
    }
    return !!lesson?.has_individual_homework;
  }, [resolvedHw, lesson?.has_individual_homework]);

  const isDisabled =
    isStudent && lesson?.["lesson_relations.status"] === "close";
  const onPressLesson = useCallback(() => {
    if (isDisabled || disableClick) {
      return;
    }

    if (
      !profile?.name &&
      (lesson?.created_from_2easy || lesson?.user_id === 1) &&
      !isCourses
    ) {
      // try now modal
      setTryNowModal(true);
      // router.push("/subscription");
      return;
    }

    if (isCourses) {
      if (isStudent) {
        router.push("/student-account/course/" + lesson?.id);
        return;
      }
      const url =
        "/course/" + lesson?.id + (studentId ? "?student_id=" + studentId : "");
      console.log("lol?", url);
      router.push(url);
      return;
    }

    if (
      alwaysOpenLessonMode &&
      isTeacher &&
      String(studentId ?? "").trim() === ""
    ) {
      router.push("/editor/" + lesson?.id);
      return;
    }

    if (isStudent || alwaysOpenLessonMode) {
      router.push("/lessons/" + lesson?.id);
      const sid = studentId ?? profile?.studentId ?? params.id;
      if (sid != null && String(sid) !== "") {
        writeToLocalStorage(
          "start_lesson_selected_ids",
          JSON.stringify([sid]),
        );
      }
      return;
    }
    if (isClosed || (profile?.name && !hasSubscription)) {
      setLockedModalOpen(true);
      // router.push("/subscription");
      return;
    }

    router.push("/editor/" + lesson?.id);
  }, [
    isDisabled,
    disableClick,
    profile?.name,
    lesson?.created_from_2easy,
    lesson?.user_id,
    lesson?.id,
    isCourses,
    isStudent,
    isTeacher,
    alwaysOpenLessonMode,
    isClosed,
    hasSubscription,
    router,
    studentId,
    profile?.studentId,
    params.id,
  ]);

  const tags = useMemo(() => {
    if (isStudent) {
      return <></>;
    }
    if (lesson?.tags) {
      return (
        <div className="flex flex-wrap gap-2 items-center">
          {lesson?.tags?.split(",")?.map((tag) => {
            return (
              <Button
                size="sm"
                color="primary"
                radius="full"
                className="text-white"
                key={tag}
                onPress={onPressLesson}
              >
                {tag.replaceAll("[", "").replaceAll("]", "")}
              </Button>
            );
          }, [])}
        </div>
      );
    }
  }, [lesson?.tags, isStudent, onPressLesson]);

  return (
    <div
      className={`p-2 w-[100%] lg:w-[25%] ${styles["lesson-card"]} flex-shrink-0`}
    >
      <div
        onClick={onPressLesson}
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
          className={styles["image-bg"]}
          style={{
            width: "100%",
            height: "100%",
            background: `url(${
              lesson.image_path ? getImageUrl(lesson.image_path) : Bg.src
            })`,
            // backgroundPosition: "center",
            transition: "all 500ms ease",
            // backgroundSize: "cover",
          }}
        />
        <div className={styles["shadow"]} />
        {!isStudent && !disableClick && !hideContextMenu && (
          <div className={styles["btn-wrapper"]}>
            <Popover
              color="foreground"
              placement="bottom-end"
              isOpen={popoverIsOpen}
              onOpenChange={(open) => {
                if (checkSubscription()) {
                  setPopoverIsOpen(open);
                }
              }}
            >
              <PopoverTrigger>
                <Button isIconOnly variant="flat">
                  <Image src={Ellipse} alt="icon" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="bg-white p-2 items-start">
                {!!onPressEdit && lesson.canEdit && (
                  <Button
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onClick={() => {
                      setPopoverIsOpen(false);
                      onPressEdit(lesson);
                    }}
                  >
                    {t("lessons.edit")}
                  </Button>
                )}
                {!!showChangeStatusButton && (
                  <>
                    <div className="py-1 px-2">
                      <p className="mb-2">
                        {isCourses ? t("lessons.lessonStatusCourse") : t("lessons.lessonStatusLesson")}
                      </p>
                      <RadioGroup
                        value={lesson?.["lesson_relations.status"]}
                        onValueChange={(val) => {
                          if (changeLessonStatus) {
                            console.log("lol???");
                            changeLessonStatus(
                              lesson?.["lesson_relations.id"],
                              val,
                              lesson?.id,
                              Number(studentId || 0),
                            );
                          }
                        }}
                        color="default"
                      >
                        <Radio size="sm" value="open">
                          {t("lessons.statusOpen")}
                        </Radio>
                        <Radio size="sm" value="close">
                          {t("lessons.statusClosed")}
                        </Radio>
                        {!isCourses && (
                          <Radio size="sm" value="complete">
                            {t("lessons.statusComplete")}
                          </Radio>
                        )}
                      </RadioGroup>
                    </div>
                    {!currentCourse && (
                      <Button
                        size="sm"
                        variant="light"
                        className="w-full text-default-foreground py-1 px-2 justify-start"
                        style={{ fontSize: 14 }}
                        endContent={<Image src={DeleteIcon} alt="icon" />}
                        onClick={() => {
                          setPopoverIsOpen(false);
                          if (deleteLessonRelation) {
                            deleteLessonRelation(
                              lesson?.["lesson_relations.id"],
                            );
                          }
                        }}
                      >
                        {t("lessons.deleteFromStudent")}
                      </Button>
                    )}
                  </>
                )}
                {!currentCourse && !!onPressAttach && !hideAttachButton && (
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onClick={() => {
                      setPopoverIsOpen(false);
                      onPressAttach(lesson);
                    }}
                  >
                    {t("lessons.attachToStudent")}
                  </Button>
                )}
                {!isCourses && !currentCourse && !!onPressAttachToCourse && (
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onClick={() => {
                      setPopoverIsOpen(false);
                      onPressAttachToCourse(lesson);
                    }}
                  >
                    {t("lessons.addToCourse")}
                  </Button>
                )}
                {!isCourses && !!copyLesson && !showChangeStatusButton && (
                  <Button
                    size="sm"
                    variant="light"
                    className="w-full text-default-foreground py-1 px-2 text-left justify-start"
                    style={{ fontSize: 14 }}
                    onClick={() => {
                      setPopoverIsOpen(false);
                      copyLesson(lesson.id);
                    }}
                  >
                    {lesson?.user_id === 1
                      ? t("lessons.addToMyLessons")
                      : t("lessons.copyLesson")}
                  </Button>
                )}
                {!!onPressDelete &&
                  !hideDeleteLessonButton &&
                  lesson.canEdit && (
                    <Button
                      size="sm"
                      variant="light"
                      className="w-full text-default-foreground py-1 px-2 justify-start"
                      style={{ fontSize: 14 }}
                      endContent={<Image src={DeleteIcon} alt="icon" />}
                      onClick={() => {
                        setPopoverIsOpen(false);
                        onPressDelete(lesson);
                      }}
                    >
                      {t("common.delete")}
                    </Button>
                  )}
              </PopoverContent>
            </Popover>
          </div>
        )}
        {isClosed && (
          <div
            style={{
              position: "absolute",
              background: "rgba(255, 255, 255, 0.5)",
              width: "100%",
              height: "100%",
              top: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Image src={LockIcon} alt="locked" />
          </div>
        )}
      </div>
      <div
        onClick={onPressLesson}
        className="p-4 bg-white "
        style={{
          borderBottomLeftRadius: 4,
          borderBottomRightRadius: 4,
          // height: "135px",
        }}
      >
        <p className="text-black font-bold" style={{ fontSize: 18 }}>
          {lesson.title}
        </p>
        <div className="h-2" />
        {!!tags && tags}
        <div className="h-2" />
        {!!lesson?.["lesson_relations.status"] && (
          <>
            <LessonStatus
              status={lesson?.["lesson_relations.status"]}
              isCourses={isCourses}
            />
            <div className="h-2" />
          </>
        )}
        {!!lesson.description && (
          <div style={{ whiteSpace: "break-spaces", fontSize: 14 }}>
            {lesson.description.length > 100
              ? lesson.description.slice(0, 110) + "..."
              : lesson.description}
          </div>
        )}
        {!!showStartLessonButton &&
          !isCourses &&
          (isTeacher && studentId ? (
            <>
              <div className="h-4"></div>
              {homeworkAlreadyExists ? (
                <Button
                  color="secondary"
                  variant="bordered"
                  className="w-full"
                  size="md"
                  onClick={async (e) => {
                    e.stopPropagation();
                    const saveSelectedAndNavigate = (hwId: number) => {
                      writeToLocalStorage(
                        "start_lesson_selected_ids",
                        JSON.stringify([studentId])
                      );
                      router.push(`/lessons/${hwId}`);
                    };
                    if (
                      effectiveHasIndividualHomework &&
                      effectiveHomeworkLessonId
                    ) {
                      saveSelectedAndNavigate(effectiveHomeworkLessonId);
                    } else {
                      const res = await fetchPostJson({
                        path: "/lessons/homework/get-or-create-for-student",
                        isSecure: true,
                        data: {
                          lesson_id: lesson.id,
                          student_id: studentId,
                        },
                      });
                      const data = await res?.json();
                      checkResponse(data);
                      if (data?.homework_lesson_id) {
                        saveSelectedAndNavigate(data.homework_lesson_id);
                      }
                    }
                  }}
                >
                  {t("lessons.homeworkLabel")}
                </Button>
              ) : (
                <Button
                  color="secondary"
                  variant="bordered"
                  className="w-full"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCreateHomeworkModalVisible(true);
                  }}
                >
                  {t("lessons.createHomework")}
                </Button>
              )}
            </>
          ) : isTeacher && !studentId && currentCourse ? (
            <>
              <div className="h-4"></div>
              {courseHomeworkCheck.loaded &&
              courseHomeworkCheck.exists &&
              courseHomeworkCheck.homeworkId ? (
                <Button
                  color="secondary"
                  variant="bordered"
                  className="w-full"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/editor/${courseHomeworkCheck.homeworkId}`);
                  }}
                >
                  {t("lessons.homeworkLabel")}
                </Button>
              ) : (
                <Button
                  color="secondary"
                  variant="bordered"
                  className="w-full"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    setCourseHomeworkModalVisible(true);
                  }}
                >
                  {t("lessons.createHomework")}
                </Button>
              )}
            </>
          ) : isStudent && homeworkAlreadyExists ? (
            <>
              <div className="h-4"></div>
              <Button
                color="secondary"
                variant="bordered"
                className="w-full"
                size="md"
                onClick={async (e) => {
                  e.stopPropagation();
                  const sid = studentId || profile?.studentId;
                  const saveSelectedAndNavigate = (hwId: number) => {
                    if (sid) {
                      writeToLocalStorage(
                        "start_lesson_selected_ids",
                        JSON.stringify([sid])
                      );
                    }
                    router.push(`/lessons/${hwId}`);
                  };
                  if (lesson.has_individual_homework && lesson.homework_lesson_id) {
                    saveSelectedAndNavigate(Number(lesson.homework_lesson_id));
                  } else {
                    const res = await fetchPostJson({
                      path: "/lessons/homework/create-my",
                      isSecure: true,
                      data: {
                        lesson_id: lesson.id,
                        student_id: sid,
                      },
                    });
                    const data = await res?.json();
                    checkResponse(data);
                    if (data?.homework_lesson_id) {
                      saveSelectedAndNavigate(data.homework_lesson_id);
                    }
                  }
                }}
              >
                {t("lessons.homeworkLabel")}
              </Button>
            </>
          ) : null)}
        {!!showStartLessonButton && (
          <>
            <div className="h-4"></div>
            <Button
              color="primary"
              className="w-full"
              size="md"
              isDisabled={isDisabled}
              onClick={() => {
                if (isCourses) {
                  if (isStudent) {
                    router.push(`/student-account/course/${lesson.id}`);
                    return;
                  }

                  router.push(`/course/${lesson.id}`);
                  return;
                }

                if (!isStudent && checkSubscription()) {
                  const noStudentForTeacher =
                    isTeacher &&
                    alwaysOpenLessonMode &&
                    String(studentId ?? "").trim() === "";
                  if (noStudentForTeacher) {
                    router.push(`/editor/${lesson.id}`);
                    return;
                  }
                  router.push(`/lessons/${lesson.id}`);

                  const selectedStudentId =
                    studentId != null && String(studentId) !== ""
                      ? studentId
                      : params.id;
                  writeToLocalStorage(
                    "start_lesson_selected_ids",
                    JSON.stringify([selectedStudentId]),
                  );
                  return;
                }
                if (isStudent) {
                  router.push(`/lessons/${lesson.id}`);
                  const sid = studentId ?? profile?.studentId;
                  if (sid != null && String(sid) !== "") {
                    writeToLocalStorage(
                      "start_lesson_selected_ids",
                      JSON.stringify([sid]),
                    );
                  }
                }
              }}
            >
              {isStudent || isCourses ? t("lessons.open") : t("lessons.startLesson")}
            </Button>
          </>
        )}
        {isClosed && (
          <>
            <div className="h-4"></div>
            <Button
              color="primary"
              className="w-full"
              size="md"
              isDisabled={isDisabled}
              onClick={onPressLesson}
            >
              {t("lessons.openWithSubscription")}
            </Button>
          </>
        )}
      </div>
      <Modal
        size="xl"
        isOpen={lockedModalOpen}
        onClose={() => setLockedModalOpen(false)}
        style={{ background: "#fff" }}
        className="p-6"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody style={{ minHeight: 460 }}>
            <p
              style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
              className="mb-4"
            >
              {t("lessons.chooseTariffToOpenFull")}
            </p>
            <p
              style={{ fontWeight: "400", textAlign: "center" }}
              className="mb-4 whitespace-pre-line"
            >
              {t("lessons.tariffsDifferByPeriod")}
            </p>

            <SubscribeTariffs
              hideTitle
              hideTopBlocks
              hideTariffsTitle
              fullWidth
            />
            <div className="h-4"></div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        size="2xl"
        isOpen={tryNowModal}
        onClose={() => setTryNowModal(false)}
        style={{ background: "#fff" }}
        className="p-12"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody
            style={{ minHeight: 400 }}
            className="flex-col justify-between"
          >
            <div className=""></div>
            <div className="">
              <p
                style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                className="mb-4"
              >
                Еще не пользовались 2EASY?
              </p>

              <p
                style={{ fontWeight: "400", textAlign: "center" }}
                className="mb-4"
              >
                Начните с бесплатного пробного периода.
              </p>
              <p style={{ fontWeight: "400", textAlign: "center" }}>
                У вас будет 7 дней доступа к конструктору уроков и части
                материалов -- это позволит познакомиться с платформой перед
                оформлением подписки.
              </p>
            </div>
            <div
              style={{
                width: 175,
                position: "absolute",
                top: 0,
                right: 0,
                zIndex: -1,
              }}
            >
              <Image src={HeartImage} alt="heart image" />
            </div>
            <div className="">
              <Button
                size="lg"
                color="primary"
                fullWidth
                className="mb-4"
                onClick={() => {
                  router.push("/registration");
                }}
              >
                Начать бесплатно
              </Button>
              <Link
                href="/login"
                className="text-[#3F28C6] underline w-[100%] text-center block"
              >
                У меня уже есть аккаунт
              </Link>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        size="xl"
        isOpen={regModal}
        onClose={() => setRegModal(false)}
        style={{ background: "#F9F9F9" }}
        className="p-12"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalBody style={{ minHeight: 400 }}>
            <RegistrationForm />
          </ModalBody>
        </ModalContent>
      </Modal>
      {isTeacher && studentId && (
        <CreateIndividualHomeworkModal
          isVisible={createHomeworkModalVisible}
          setIsVisible={setCreateHomeworkModalVisible}
          lesson={lesson}
          studentId={studentId}
          onSuccess={onHomeworkCreated}
        />
      )}
      {isTeacher && !studentId && currentCourse && (
        <CreateHomeworkModal
          isVisible={courseHomeworkModalVisible}
          setIsVisible={setCourseHomeworkModalVisible}
          lesson={lesson}
          exList={courseHomeworkExList}
          onSuccess={() => {
            onHomeworkCreated?.();
            fetchPostJson({
              path: "/lessons/homework/check",
              isSecure: true,
              data: { lesson_id: lesson.id },
            })
              .then((r) => r.json())
              .then((data) => {
                setCourseHomeworkCheck({
                  loaded: true,
                  exists: !!data?.exists,
                  homeworkId: data?.first_homework_id,
                });
              })
              .catch(() => {});
          }}
        />
      )}
    </div>
  );
};
