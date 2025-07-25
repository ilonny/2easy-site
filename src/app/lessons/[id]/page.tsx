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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { BASE_URL, checkResponse, fetchGet } from "@/api";
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
import LinkIcon from "@/assets/icons/link.svg";
import CopyIcon from "@/assets/icons/copy.svg";
import { toast } from "react-toastify";

export default function StartRegistrationPage() {
  withLogin();
  const router = useRouter();
  const params = useParams();
  const { subscription } = useContext(SibscribeContext);
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2;
  const isStudent = profile?.isStudent;
  const { exList, getExList } = useExList(params.id);
  const { lesson, getLesson } = useLessons();

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
        : list?.studentList;
      setStudents(filteredIds);
      if (filteredIds?.length === 1) {
        setActiveStudentId(filteredIds[0]?.student_id);
      }
    } catch (err) {}
  }, [params.id]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          {isTeacher && (
            <div className="flex items-start justify-between">
              <Breadcrumbs>
                <BreadcrumbItem href="/">Главная</BreadcrumbItem>
                <BreadcrumbItem href="/profile?lessons">
                  Мои уроки
                </BreadcrumbItem>
                <BreadcrumbItem>{lesson?.title}</BreadcrumbItem>
              </Breadcrumbs>
              <div className="">
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
                      endContent={<img src={LinkIcon.src} alt="icon" />}
                      variant="light"
                    >
                      Ссылка на урок
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-4 bg-white items-start cursor-pointer">
                    <div
                      className=""
                      onClick={() => {
                        navigator.clipboard
                          .writeText(window.location.href)
                          .then(() => {
                            toast.success(
                              "Ссылка на урок скопирована в буфер обмена. Вы можете поделиться ей с учеником"
                            );
                            setPopoverIsOpen(false)
                          });
                      }}
                    >
                      <div className="flex justify-between items-center gap-4">
                        <p>Скопировать ссылку</p>
                        <img src={CopyIcon.src} />
                      </div>
                      <div
                        className="p-2 mt-2"
                        style={{ border: "1px solid #191919" }}
                      >
                        {window.location.href}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          )}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-start gap-4">
          <div className="w-[100%]">
            <div
              className="p-10"
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
              <ExList list={exList} isView activeStudentId={activeStudentId} />
            </div>
          </div>
          {!isStudent && (
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
        <div className="h-20"></div>
      </ContentWrapper>
    </main>
  );
}
