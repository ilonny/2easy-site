"use client";
import { AuthContext } from "@/auth";
import { ContentWrapper } from "@/components";
import { MainPageInfoBlock } from "@/components/MainPageInfoBlock";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useState } from "react";
import { useLessons } from "./lessons/hooks/useLessons";
import { LessonCard } from "./lessons/components/LessonCard";
import HandIcon from "@/assets/icons/hand.png";
import Image from "next/image";
import { MainPageGamesSlider } from "@/components/MainPageGamesSlider";
import {
  speakingGames,
  discussionCards,
} from "@/components/MainPageGamesSlider/data";
import Link from "next/link";
import { SubscribeFreeBlock, SubscribeTariffs } from "@/subscribe";

export default function Home() {
  const { profile, authIsLoading } = useContext(AuthContext);
  const router = useRouter();

  const onPressRegistration = useCallback(() => {
    router.push("/start-registration");
  }, [router]);

  const onPressLogin = useCallback(() => {
    if (profile?.name) {
      router.push("/profile");
      return;
    }
    router.push("/login");
  }, [router, profile]);

  const { lessons, getMainPageLessons } = useLessons();

  useEffect(() => {
    getMainPageLessons();
  }, [getMainPageLessons]);

  const [handIconIsVisible, setHandIconIsVisible] = useState(true);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHandIconIsVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-[#F9F9F9]">
      <ContentWrapper>
        <>
          <div className="h-6 lg:h-14"></div>
          <p className="text-center text-primary font-semibold uppercase">
            ⚡ 2000+ тичеров уже присоединились к 2EASY
          </p>
          <div className="h-5"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            2EASY -- интерактивная платформа для преподавателей с готовыми
            уроками, играми и разговорными картами
          </h1>
          <div className="h-6 lg:h-14"></div>
          <MainPageInfoBlock
            flipMobileOrder
            sides={[
              {
                buttons: [
                  {
                    children: (
                      <p className="font-semibold text-[14px]">
                        НАЧАТЬ БЕСПЛАТНО
                      </p>
                    ),
                    color: "primary",
                    className: `w-[100%] lg:w-[306px] ${
                      profile?.name && "hidden"
                    }`,
                    size: "lg",
                    onClick: onPressRegistration,
                  },
                  {
                    children: (
                      <p className="font-semibold text-[14px] text-primary">
                        ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ
                      </p>
                    ),
                    color: "primary",
                    variant: "flat",
                    className: "bg-transparent w-[100%] lg:w-[306px]",
                    size: "lg",
                    onClick: onPressLogin,
                  },
                ],
              },
              {
                videoSrc: "MAIN VIDEO SRC",
              },
            ]}
          />
          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            2EASY -- это легко
          </h1>
          <div className="h-6 lg:h-14"></div>
          <MainPageInfoBlock
            sides={[
              {
                title: "Создавай уроки в удобном конструкторе",
                description:
                  "интерактивные задания, тексты, видео и многое другое -- в простом конструкторе 2easy",
              },
              {
                videoSrc: "/video/area23.mp4",
              },
            ]}
          />
          <div className="h-6 lg:h-14"></div>
          <MainPageInfoBlock
            flipMobileOrder
            sides={[
              {
                videoSrc: "MAIN VIDEO SRC",
              },
              {
                title: "Используй готовые lesson plans",
                description:
                  "готовые уроки -- гордость 2easy. нативные материалы, бережно адаптированные под разные уровни учеников",
              },
            ]}
          />
          <div className="h-6 lg:h-14"></div>
          <MainPageInfoBlock
            sides={[
              {
                title: "Создавай личные кабинеты учеников",
                description:
                  "добавляй учеников и проводи уроки в режиме real-time",
              },
              {
                videoSrc: "MAIN VIDEO SRC",
              },
            ]}
          />
          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            Lesson plans
          </h1>
          <div className="h-2"></div>
          <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
            Готовые уроки по актуальным темам с juicy-лексикой, аутентичными
            видео и статьями, дополненные грамматикой, упражнениями и квизами
          </p>
          <div className="h-6 lg:h-14"></div>
          <Link href="/lessons_plans">
            <div className="flex relative">
              <div className="flex overflow-scroll w-[100%]">
                {lessons.map((lesson) => {
                  return (
                    <LessonCard lesson={lesson} key={lesson.id} disableClick />
                  );
                })}
              </div>
              <div
                className={`
                absolute
                bottom-0
                right-0
                lg:hidden
                w-[40px]
                transition-opacity duration-500 ${
                  handIconIsVisible ? "opacity-100" : "opacity-0"
                }
                `}
                style={{ pointerEvents: "none" }}
              >
                <Image src={HandIcon} alt="hand icon" />
              </div>
            </div>
          </Link>
          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            Speaking games
          </h1>
          <div className="h-2"></div>
          <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
            Игры, которые отлично подходят для warm up и вообще любой части
            урока: такие штуки действительно классно разогревают перед занятием
            и поднимают настроение
          </p>
          <div className="h-6 lg:h-14"></div>
          <MainPageGamesSlider data={speakingGames} />
          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            Discussion cards
          </h1>
          <div className="h-2"></div>
          <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
            Нетривиальные вопросы на актуальные темы: психология, отношения,
            бизнес, феминизм и многое другое
          </p>
          <div className="h-6 lg:h-14"></div>
          <MainPageGamesSlider data={discussionCards} />
          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
          <SubscribeTariffs />

          <div className="h-6 lg:h-14"></div>
          <div className="h-6 lg:h-14"></div>
        </>
      </ContentWrapper>
    </div>
  );
}
