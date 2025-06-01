"use client";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Card,
  Image,
  Input,
  Link,
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
    setStudents(list?.studentList);
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
            <Breadcrumbs>
              <BreadcrumbItem href="/">Главная</BreadcrumbItem>
              <BreadcrumbItem href="/profile?students">
                Мои ученики
              </BreadcrumbItem>
            </Breadcrumbs>
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
              {!!activeStudentId && (
                <Button
                  color="primary"
                  className="w-full uppercase"
                  size="md"
                  onClick={() => setActiveStudentId(0)}
                >
                  {"<-teacher’s screen"}
                </Button>
              )}
            </div>
          )}
        </div>
        <div className="h-20"></div>
      </ContentWrapper>
    </main>
  );
}
