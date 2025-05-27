"use client";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Image,
  Input,
  Link,
  Tab,
  Tabs,
} from "@nextui-org/react";
import { ContentWrapper } from "@/components";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { withLogin } from "@/auth/hooks/withLogin";
import { checkResponse, fetchGet } from "@/api";
import { useParams, useRouter } from "next/navigation";
import { StudentList } from "@/app/student/components/StudentList";
import Loupe from "@/assets/icons/loupe.svg";
import { useLessons } from "@/app/lessons/hooks/useLessons";
import { ProfileLessons } from "@/app/lessons/components/ProfileLessons";

export default function StartRegistrationPage() {
  withLogin();
  const [searchString, setSearchString] = useState("");
  const router = useRouter();
  const studentId = useParams().id;

  const { subscription } = useContext(SibscribeContext);
  const { profile, authIsLoading } = useContext(AuthContext);

  const [studentInfo, setStudentInfo] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const fetchStudentInfo = useCallback(async () => {
    setIsLoading(true);
    const res = await fetchGet({
      path: `/student-info?id=${studentId}`,
      isSecure: true,
    });
    const json = await res?.json();
    checkResponse(json);
    if (json.success) {
      setStudentInfo(json);
    }
    setIsLoading(false);
    return json;
  }, [studentId]);

  useEffect(() => {
    fetchStudentInfo();
  }, [studentId, fetchStudentInfo]);

  const isTeacher = profile?.role_id === 2;

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
              <BreadcrumbItem>lalala</BreadcrumbItem>
            </Breadcrumbs>
          )}
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex items-end justify-center gap-6">
          <Link href="/profile?students">← все ученики</Link>
          <h1
            className={"text-primary text-center font-bold text-3xl uppercase"}
          >
            Кабинет ученика
          </h1>
          <div className="w-[112px]"></div>
        </div>
        <div className="h-5" />
        {(isLoading || authIsLoading) && (
          <div className="w-full h-[225px] flex justify-center items-center ">
            <Button
              isIconOnly
              isLoading={isLoading}
              color="primary"
              variant="light"
              size="lg"
            />
          </div>
        )}
        <div className="flex items-end gap-6">
          <div className="w-[415px]">
            {!!studentInfo && (
              <StudentList
                onSuccessEditCallback={fetchStudentInfo}
                onSuccessDeleteCallback={() => router.push("/profile?students")}
                hideAccountButton
                studentsList={[studentInfo]}
                hideAddButton
              />
            )}
          </div>
          <div className="w-[525px]">
            <Input
              value={searchString}
              onValueChange={setSearchString}
              placeholder="Поиск уроков"
              size="lg"
              classNames={{ inputWrapper: "bg-white hove" }}
              startContent={
                <Image
                  src={Loupe.src}
                  alt="search"
                  style={{ borderRadius: 0 }}
                />
              }
            />
          </div>
        </div>
        {!!studentInfo && (
          <ProfileLessons
            searchString={searchString}
            canCreateLesson={false}
            //@ts-ignore
            studentId={studentId}
            hideTabs
            hideAttachButton
            showChangeStatusButton
            hideDeleteLessonButton
          />
        )}
      </ContentWrapper>
    </main>
  );
}
