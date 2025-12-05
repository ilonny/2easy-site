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
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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
import { CopyLessonLink } from "../../lessons/components/CopyLessonLink";
import { useCourses } from "../hooks/useCourses";

export default function StartRegistrationPage() {
  withLogin();
  const router = useRouter();
  const params = useParams();
  const { subscription } = useContext(SibscribeContext);
  const { profile, authIsLoading } = useContext(AuthContext);
  const isTeacher = profile?.role_id === 2 || profile?.role_id === 1;
  const isStudent = profile?.isStudent;
  const { getCourses, courses } = useCourses();

  useEffect(() => {
    getCourses();
  }, [getCourses]);

  const currentCourse = useMemo(() => {
    return courses.find((c) => c.id == params.id);
  }, [courses, params.id]);

  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem href="/lesson_plans">Lesson plans</BreadcrumbItem>
            <BreadcrumbItem>Course</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <h1
          color="primary"
          style={{
            fontSize: 44,
            textAlign: "center",
            color: "#3f28c6",
            fontWeight: 700,
          }}
        >
          COURSE
        </h1>
        <p
          className="max-w-[745px] text-center m-auto"
          style={{ fontSize: 20, fontWeight: 500, lineHeight: "26px" }}
        >
          Ready-to-use lessons on current topics with juicy vocabulary,
          authentic videos and stories, complemented by grammar topics,
          exercises and quizzes.
        </p>
        <div className="h-10" />
        <div className="h-10" />
        {!!currentCourse && <ProfileLessons currentCourse={currentCourse} />}
        <div className="h-10" />
        <div className="h-10" />
      </ContentWrapper>
    </main>
  );
}
