"use client";
import { AuthContext } from "@/auth";
import { ContentWrapper } from "@/components";
import { MainPageInfoBlock } from "@/components/MainPageInfoBlock";
import { useRouter } from "next/navigation";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
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
import { SubscribeTariffs } from "@/subscribe";
import { Button } from "@nextui-org/react";
import ArrowRightIcon from "@/assets/icons/arrow_right.svg";
import ArrowRightIconBlack from "@/assets/icons/arrow_right_black.svg";
import MainBg from "@/assets/images/main_page_bg.png";
import MainImage from "@/assets/images/main_image.png";
import { useCheckSubscription } from "./subscription/helpers";

export default function Home() {
  const { profile, authIsLoading } = useContext(AuthContext);
  const { checkSubscription, hasSubscription } = useCheckSubscription();
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

  const buttonsContent = useMemo(() => {
    if (!profile?.name) {
      return (
        <>
          <div className="h-6 lg:h-14"></div>
          <div className="flex justify-center flex-wrap items-center gap-4">
            <Button
              color="primary"
              className={`min-h-[58px] lg:min-h-[68px] w-[100%] lg:w-[306px] pr-[8px] ${
                profile?.name && "hidden"
              }`}
              style={{ borderRadius: 100 }}
              size="lg"
              onClick={onPressRegistration}
              endContent={
                <div
                  style={{
                    borderRadius: 52,
                    backgroundColor: "#9A84F0",
                  }}
                  className="
                  shrink-0
              flex
              justify-center
              items-center
              w-[42px]
              lg:w-[52px]
              h-[42px]
              lg:h-[52px]
              "
                >
                  <Image src={ArrowRightIcon} alt="arrow" />
                </div>
              }
            >
              <p
                style={{ fontSize: 14, letterSpacing: 2, fontWeight: 600 }}
                className="w-[100%] text-center"
              >
                НАЧАТЬ БЕСПЛАТНО
              </p>
            </Button>
            <Button
              color="primary"
              variant={"flat"}
              className={
                "bg-[#F2F2F2] min-h-[58px] lg:min-h-[68px] w-[100%] lg:w-[346px] pr-[8px]"
              }
              style={{ borderRadius: 100 }}
              size={"lg"}
              onClick={onPressLogin}
              endContent={
                <div
                  style={{
                    borderRadius: 52,
                    backgroundColor: "#fff",
                  }}
                  className="
                    shrink-0
                    flex
                    justify-center
                    items-center
                    w-[42px]
                    lg:w-[52px]
                    h-[42px]
                    lg:h-[52px]
                  "
                >
                  <Image src={ArrowRightIconBlack} alt="arrow" />
                </div>
              }
            >
              <p
                style={{
                  fontSize: 14,
                  letterSpacing: 2,
                  fontWeight: 600,
                  color: "#262626",
                }}
                className="w-[100%] text-center"
              >
                ВОЙТИ В ЛИЧНЫЙ КАБИНЕТ
              </p>
            </Button>
          </div>
        </>
      );
    }
    if (profile?.name && !hasSubscription) {
      return (
        <>
          <div className="h-6 lg:h-14"></div>
          <div className="flex justify-center flex-wrap items-center">
            <Button
              color="primary"
              className={`min-h-[58px] lg:min-h-[68px] w-[100%] lg:w-[206px] pr-[8px] justify-between`}
              style={{ borderRadius: 100 }}
              size="lg"
              onClick={() => router.push("/subscription")}
              endContent={
                <div
                  style={{
                    borderRadius: 52,
                    backgroundColor: "#9A84F0",
                  }}
                  className="
                    shrink-0
                    flex
                    justify-center
                    items-center
                    w-[42px]
                    lg:w-[52px]
                    h-[42px]
                    lg:h-[52px]
                  "
                >
                  <Image src={ArrowRightIcon} alt="arrow" />
                </div>
              }
            >
              <p
                style={{ fontSize: 14, letterSpacing: 2, fontWeight: 600 }}
                className="text-center w-[100%]"
              >
                ТАРИФЫ
              </p>
            </Button>
          </div>
        </>
      );
    }
    return <></>;
  }, [
    profile?.name,
    hasSubscription,
    onPressRegistration,
    onPressLogin,
    router,
  ]);

  return (
    <div
      style={{
        background: `url(${MainBg.src}) top center no-repeat`,
        backgroundSize: "100% auto",
        backgroundColor: "#F9F9F9",
        overflow: "hidden",
      }}
    >
      <section
        // className="bg-[#F9F9F9]"
        style={
          {
            // background: `url(${MainBg.src}) center center no-repeat`,
            // backgroundSize: "cover",
            // backgroundColor: "#F9F9F9",
            // overflow: "hidden",
          }
        }
      >
        <ContentWrapper>
          <div className="h-6 lg:h-14"></div>
          <p className="text-center text-primary font-semibold uppercase">
            ⚡ 2000+ тичеров уже присоединились к 2EASY
          </p>
          <div className="h-5"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            2EASY -- интерактивная платформа с готовыми материалами для{" "}
            <span style={{ color: "#3E1BC9" }}>создания и проведения</span>{" "}
            языковых уроков
          </h1>
          {buttonsContent}
          <div className="h-6 lg:h-14"></div>
          <div className="m-auto">
            <Image
              className="
                w-[140%]
                lg:w-[100%]
                ml-[-20%]
                lg:ml-0
                max-w-[initial]
              "
              src={MainImage}
              alt="main image"
            />
          </div>
        </ContentWrapper>
        <div className="h-6 lg:h-14"></div>
      </section>
      <div
      // className="bg-[#F9F9F9]"
      >
        <ContentWrapper>
          <>
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
                  videoSrc: "/video/Area22222.mp4",
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
                  videoSrc: "/video/Area333.mp4",
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
            <Link href="/lesson_plans">
              <div className="flex relative">
                <div className="flex overflow-scroll w-[100%]">
                  {lessons.map((lesson) => {
                    return (
                      <LessonCard
                        lesson={lesson}
                        key={lesson.id}
                        disableClick
                      />
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
              урока: такие штуки действительно классно разогревают перед
              занятием и поднимают настроение
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
    </div>
  );
}
