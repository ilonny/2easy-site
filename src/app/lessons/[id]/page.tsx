/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Image,
  Input,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Switch,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { BASE_URL, checkResponse, fetchGet, fetchPostJson } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";
import { ExList } from "@/app/editor/components/view/ExList";
import { useExList } from "@/app/editor/hooks/useExList";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { readFromLocalStorage } from "@/auth/utils";
import EyeIcon from "@/assets/icons/eye_enable.svg";
import InfoIcon from "@/assets/icons/info.svg";
import CheckedYellow from "@/assets/icons/checked_yellow.svg";
import Tutor2 from "@/assets/images/tutor_2.png";
import Tutor1 from "@/assets/images/tutor_1.png";
import Tutor3 from "@/assets/images/tutor_3.png";
import HeartImage from "@/assets/images/3d-glassy-fuzzy-pink-heart-with-a-happy-face.png";
import { toast } from "react-toastify";
import { Chat } from "@/components/Chat";
import { CopyLessonLink } from "../components/CopyLessonLink";

export default function StartRegistrationPage() {
  withLogin();
  const router = useRouter();
  const params = useParams();
  const { subscription } = useContext(SibscribeContext);
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const { exList, getExList, setExList } = useExList(
    params.id,
    isPresentationMode
  );
  const { lesson, getLesson } = useLessons();
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(1);
  const [students, setStudents] = useState([]);
  const [activeStudentId, setActiveStudentId] = useState(0);

  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  useEffect(() => {
    //@ts-ignore
    getLesson(params.id);
    getExList();
  }, [getExList, getLesson, params.id]);

  const fetchStudents = useCallback(async () => {
    const list = await (
      await fetchGet({
        path: `/lesson-students?lesson_id=${params.id}`,
        isSecure: true,
      })
    )?.json();
    try {
      const selectedIds = JSON.parse(
        readFromLocalStorage("start_lesson_selected_ids") || ""
      )?.map((el) => Number(el));
      const filteredIds = selectedIds?.length
        ? list?.studentList?.filter((s) => {
            return selectedIds.includes(s.student_id);
          })
        : [];
      setStudents(filteredIds);
      if (filteredIds?.length === 1) {
        setActiveStudentId(filteredIds[0]?.student_id);
      }
    } catch (err) {}
  }, [params.id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    if (!isStudent) {
      return;
    }
    let canGetList = true;
    const getList = async () => {
      if (!canGetList) {
        return;
      }
      const res = await fetchGet({
        path: `/ex/list?lesson_id=${params.id}`,
        isSecure: true,
      });
      const list = await res?.json();
      if (exList.length && list.length && list.length !== exList.length) {
        getExList();
        // setExList(list);
      }

      setTimeout(() => {
        getList();
      }, 1000);
      return list;
    };
    getList();
    return () => (canGetList = false);
    // const interval = setInterval(() => {
    //   getExList();
    // }, 1000);
    // return () => clearInterval(interval);
  }, [getExList, isStudent, params.id, exList, setExList]);

  useEffect(() => {
    if (!tutorialOpen) {
      setTutorialStep(1);
    }
  }, [tutorialOpen]);

  const onChangePresentationMode = useCallback((e) => {
    e.stopPropagation();
    setIsPresentationMode((s) => !s);
  }, []);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          {isTeacher && (
            <div className="flex items-start justify-between flex-wrap">
              <Link href={`/editor/${params.id}`} className="text-secondary">
                <Button variant="light">← Вернуться к редактированию</Button>
              </Link>
              <div className="flex items-center flex-wrap">
                <div
                  className="switcher flex items-center cursor-pointer"
                  onClick={onChangePresentationMode}
                >
                  <p className="text-small mr-2">Режим демонстрации экрана</p>
                  <Switch
                    size="sm"
                    isSelected={isPresentationMode}
                    style={{ pointerEvents: "none" }}
                  />
                </div>
                <Button
                  endContent={<img src={InfoIcon.src} alt="icon" />}
                  variant="light"
                  onClick={() => {
                    setTutorialOpen(true);
                    setTutorialStep(4);
                  }}
                  isIconOnly
                />
                <Button
                  endContent={<img src={InfoIcon.src} alt="icon" />}
                  variant="light"
                  onClick={() => setTutorialOpen(true)}
                >
                  Как работает режим урока?
                </Button>
                <CopyLessonLink />
              </div>
            </div>
          )}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-start gap-4">
          <div className="w-[100%]">
            <div
              className="p-2 lg:p-10"
              style={{
                width: "100%",
                maxWidth: 1160,
                backgroundColor: "#fff",
                borderRadius: 10,
                margin: isStudent ? "auto" : "none",
              }}
            >
              <h1
                style={{
                  fontSize: 44,
                  textAlign: "center",
                  color: "#3f28c6",
                  fontWeight: 700,
                }}
              >
                {lesson?.title}
              </h1>
              {!!lesson?.description && (
                <h2
                  style={{
                    fontSize: 20,
                    textAlign: "center",
                    // color: "#3f28c6",
                    fontWeight: 500,
                    maxWidth: 800,
                    margin: "auto",
                    whiteSpace: "break-spaces",
                  }}
                >
                  {lesson?.description}
                </h2>
              )}
              <div className="h-8"></div>
              {!!lesson?.image_path && (
                <Zoom>
                  <img
                    src={BASE_URL + "/" + lesson.image_path}
                    style={{ maxHeight: 400, margin: "auto", marginBottom: 60 }}
                    alt="image lesson"
                  />
                </Zoom>
              )}
              <div className="h-8"></div>
              <div key={exList.length}>
                <ExList
                  list={exList}
                  isView
                  activeStudentId={activeStudentId}
                  key={exList.length}
                  is2easy={lesson?.user_id === 1}
                  isAdmin={profile?.role_id === 1}
                  isPresentationMode={isPresentationMode}
                />
              </div>
            </div>
          </div>
          {!isStudent && !!students?.length && (
            <div
              className="w-[200px]"
              style={{ position: "sticky", top: 40, marginTop: -48 }}
            >
              <div className="flex">
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#231F20",
                    marginBottom: 27,
                  }}
                >
                  УЧАСТНИКИ
                </p>
              </div>
              {students?.map((s) => {
                const isActive = s?.student_id === activeStudentId;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveStudentId(s.student_id)}
                    style={{ cursor: "pointer" }}
                  >
                    <Card
                      className="p-4 w-[200px] mb-4"
                      shadow="none"
                      style={{ backgroundColor: isActive ? "#EEEBFF" : "#fff" }}
                    >
                      <p
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#231F20",
                        }}
                        className="uppercase"
                      >
                        {s["student.name"]}
                      </p>
                      {!!s["student.email"] && (
                        <p
                          style={{
                            fontSize: 14,
                            color: "#767676",
                          }}
                        >
                          {s["student.email"]}
                        </p>
                      )}
                    </Card>
                  </div>
                );
              })}
              {/* пока скрываем */}
              {/* {!!activeStudentId && (
                <Button
                  color="primary"
                  className="w-full uppercase"
                  size="md"
                  onClick={() => setActiveStudentId(0)}
                >
                  {"<-teacher’s screen"}
                </Button>
              )} */}
            </div>
          )}
        </div>
        <div className="relative">
          <div className="fixed right-0 bottom-0" style={{ zIndex: 10 }}>
            <Chat
              students={students}
              lesson_id={lesson?.id || 0}
              isTeacher={isTeacher}
            />
          </div>
        </div>
        <div className="h-20"></div>
      </ContentWrapper>
      <Modal
        size="xl"
        isOpen={tutorialOpen}
        onClose={() => setTutorialOpen(false)}
        style={{ background: "#fff  " }}
        className=" relative"
      >
        <ModalContent>
          <ModalHeader className="justify-center"></ModalHeader>
          <ModalBody style={{ minHeight: 460 }}>
            {tutorialStep === 1 && (
              <>
                <div className="h-14"></div>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Сейчас вы находитесь в режиме урока
                </p>
                <p className="text-center mb-2">
                  Пролистайте небольшой туториал, который
                  <br />
                  расскажет, что можно делать в этом режиме
                </p>
                <div
                  style={{
                    backgroundColor: "#F0EEFF",
                    padding: 12,
                    borderRadius: 10,
                    margin: "auto",
                    maxWidth: 350,
                    width: "100%",
                  }}
                >
                  <p className="text-primary text-center">
                    Время на изучение ~ 1 минута
                  </p>
                  <p className="text-primary text-center">
                    Польза в работе + 110%
                  </p>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(2)}
                >
                  <p>Листать →</p>
                </Button>
                <div
                  style={{
                    width: 175,
                    position: "absolute",
                    top: 0,
                    right: 0,
                    zIndex: -1,
                  }}
                >
                  <Image src={HeartImage.src} alt="heart image" />
                </div>
              </>
            )}
            {tutorialStep === 2 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Чтобы начать урок, нужно
                  <br />
                  поделиться им с учеником
                </p>
                <p className="text-center mb-2">
                  Сделать это можно двумя способами:
                </p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      попросить ученика зайти в нужный урок в своем личном
                      кабинете
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>отправить ученику прямую ссылку на урок</p>
                  </div>
                  <div className="h-8"></div>
                  <div className="flex justify-end">
                    <div style={{ marginRight: -30 }}>
                      <CopyLessonLink />
                    </div>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(3)}
                >
                  <p>Дальше →</p>
                </Button>
              </>
            )}
            {tutorialStep === 3 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Когда ученик присоединился к уроку,
                  <br />
                  вы можете:
                </p>
                <p className="text-center mb-2"></p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>видеть его ответы в режиме real-time</p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      менять видимость заданий прямо на уроке с помощью{" "}
                      <img
                        src={EyeIcon.src}
                        style={{ display: "inline", margin: "0 5px" }}
                      />{" "}
                      слева от задания
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      делать заметки или записывать новые слова в чате урока
                    </p>
                  </div>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px] opacity-0">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p style={{ color: "#ACACAC", fontSize: 12 }}>
                      *История чата сохраняется: если ученик снова зайдет в
                      урок, он будет видеть все сообщения
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(4)}
                >
                  <p>Дальше →</p>
                </Button>
              </>
            )}
            {tutorialStep === 4 && (
              <>
                <p
                  style={{ fontSize: 22, fontWeight: 500, textAlign: "center" }}
                >
                  Если ведете урок с помощью
                  <br />
                  демонстрации экрана или офлайн:
                </p>
                <p className="text-center mb-2"></p>
                <div style={{ maxWidth: 500, margin: "auto" }}>
                  <div className="flex items-start gap-2 mb-2">
                    <div className="shrink-0 pt-[3px]">
                      <Image src={CheckedYellow.src} alt="checked" />
                    </div>
                    <p>
                      включите опцию “Режим демонстрации экрана”. Она позволит
                      скрыть правильные ответы, подсказки и блоки, которые вы
                      сделали невидимыми для ученика.
                      <br />
                      <br />
                      По сути, вы будете видеть урок так, как видел бы его
                      ученик в своем личном кабинете.
                    </p>
                  </div>
                </div>
                <div className="h-4"></div>
                <Button
                  color="primary"
                  className="w-full"
                  size="lg"
                  onClick={() => setTutorialStep(5)}
                >
                  <p>Дальше →</p>
                </Button>
              </>
            )}
            {tutorialStep === 5 && (
              <>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      Если вы ведете групповой урок:
                    </p>
                    <p></p>
                    <div className="h-2"></div>
                    <div style={{ maxWidth: 500, margin: "auto" }}>
                      <div className="flex items-start gap-2 mb-2">
                        <div className="shrink-0 pt-[3px]">
                          <Image src={CheckedYellow.src} alt="checked" />
                        </div>
                        <p>
                          если занятие групповое, вы можете переключаться между
                          учениками на панели справа, чтобы увидеть ответы
                          каждого* из них
                        </p>
                      </div>
                      <div className="flex items-start justify-between flex-wrap">
                        <div className="flex items-start gap-2 mb-2 pt-4">
                          <div className="shrink-0 pt-[3px] opacity-0">
                            <Image src={CheckedYellow.src} alt="checked" />
                          </div>
                          <p style={{ color: "#3F28C6", fontSize: 12 }}>
                            *Светло-фиолетовым отмечен ученик,
                            <br />
                            ответы которого отображаются на экране
                          </p>
                        </div>
                        <img src={Tutor2.src} style={{ width: 183 }} />
                      </div>
                      {/* <div className="h-6"></div> */}
                    </div>
                  </div>
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onClick={() => setTutorialStep(6)}
                  >
                    <p>Дальше →</p>
                  </Button>
                </div>

                <img
                  src={Tutor1.src}
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    zIndex: -1,
                    width: 370,
                  }}
                />
              </>
            )}
            {tutorialStep === 6 && (
              <>
                <div className="flex flex-col flex-1 justify-between">
                  <div>
                    <p
                      style={{
                        fontSize: 22,
                        fontWeight: 500,
                        textAlign: "center",
                      }}
                    >
                      После завершения урока
                    </p>
                    <p className="text-center">
                      Все ответы ученика сохраняются.
                      <br />
                      Посмотреть ответы после завершения урока вы можете,
                      <br />
                      перейдя в личный кабинет ученика и выбрав нужный урок
                    </p>
                    <div className="h-4"></div>
                  </div>
                  <Button
                    color="primary"
                    className="w-full"
                    size="lg"
                    onClick={() => setTutorialOpen(false)}
                  >
                    <p>За работу!</p>
                  </Button>
                </div>

                <img
                  src={Tutor3.src}
                  style={{
                    position: "absolute",
                    left: 0,
                    bottom: 0,
                    zIndex: -1,
                    width: 500,
                  }}
                />
              </>
            )}
            <div className="flex items-center justify-between">
              <div className="w-[100px]">
                {tutorialStep >= 2 && (
                  <div
                    style={{
                      fontSize: 14,
                      color:
                        tutorialStep === 5 || tutorialStep === 6
                          ? "#fff"
                          : "#B7B7B7",
                    }}
                    className="cursor-pointer hover:underline"
                    onClick={() => setTutorialStep((s) => s - 1)}
                  >
                    ← назад
                  </div>
                )}
              </div>
              <p
                className="text-center"
                style={{
                  fontSize: 14,
                  color:
                    tutorialStep === 5 || tutorialStep === 6
                      ? "#fff"
                      : "#B7B7B7",
                }}
              >
                {tutorialStep} / 6
              </p>
              <div className="w-[100px]"></div>
            </div>
            <div className="h-2"></div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}
