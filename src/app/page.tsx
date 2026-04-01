"use client";
import { useTranslation } from "react-i18next";
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
import { Button, Chip } from "@nextui-org/react";
import ArrowRightIcon from "@/assets/icons/arrow_right.svg";
import ArrowRightIconBlack from "@/assets/icons/arrow_right_black.svg";
import MainBg from "@/assets/images/main_page_bg.png";
import MainImage from "@/assets/images/main_image.png";
import { useCheckSubscription } from "./subscription/helpers";

export default function Home() {
  const { t } = useTranslation();
  const { profile, authIsLoading } = useContext(AuthContext);
  const { checkSubscription, hasSubscription } = useCheckSubscription();
  const router = useRouter();

  const onPressRegistration = useCallback(() => {
    router.push("/registration");
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
            <div className="relative">
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
                <div>
                  <p
                    style={{ fontSize: 14, letterSpacing: 2, fontWeight: 600 }}
                    className="w-[100%] text-center"
                  >
                    {t("home.startFree")}
                  </p>
                </div>
              </Button>
              <Chip
                color="success"
                variant="shadow"
                className="absolute left-[0%] top-[0%] mt-[-14px] ml-[-30px]"
                style={{ transform: "rotate(-6deg)", pointerEvents: "none" }}
              >
                <span className="text-white">{t("home.sevenDaysFree")}</span>
              </Chip>
            </div>
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
                {t("home.loginToAccount")}
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
                {t("home.tariffs")}
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
    t,
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
            {t("home.teachersJoined")}
          </p>
          <div className="h-5"></div>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            {t("home.mainTitle")}{" "}
            <span style={{ color: "#3E1BC9" }}>{t("home.mainTitleHighlight")}</span>{" "}
            {t("home.mainTitleEnd")}
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
              {t("home.easyTitle")}
            </h1>
            <div className="h-6 lg:h-14"></div>
            <MainPageInfoBlock
              sides={[
                {
                  title: t("home.createLessonsTitle"),
                  description: t("home.createLessonsDesc"),
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
                  title: t("home.lessonPlansTitle"),
                  description: t("home.lessonPlansDesc"),
                },
              ]}
            />
            <div className="h-6 lg:h-14"></div>
            <MainPageInfoBlock
              sides={[
                {
                  title: t("home.studentAccountsTitle"),
                  description: t("home.studentAccountsDesc"),
                },
                {
                  videoSrc: "/video/Area333.mp4",
                },
              ]}
            />
            <div className="h-6 lg:h-14"></div>
            <div className="flex justify-center">
              <Button
                color="primary"
                className={`min-h-[48px] lg:min-h-[58px] w-[100%] lg:w-[306px] pr-[8px] ${
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
              w-[32px]
              lg:w-[42px]
              h-[32px]
              lg:h-[42px]
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
                  {t("home.startFree")}
                </p>
              </Button>
            </div>
            <div className="h-6 lg:h-14"></div>
            <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
              {t("home.lessonPlansSection")}
            </h1>
            <div className="h-2"></div>
            <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
              {t("home.lessonPlansSectionDesc")}
            </p>
            <div className="h-6 lg:h-14"></div>
            <div className="flex relative">
              <div className="flex overflow-x-auto overflow-y-hidden w-full gap-3 pb-2 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] -mx-1 px-1">
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
            <div className="h-6 lg:h-14"></div>
            <div className="h-6 lg:h-14"></div>
            <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
              {t("home.speakingGamesSection")}
            </h1>
            <div className="h-2"></div>
            <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
              {t("home.speakingGamesSectionDesc")}
            </p>
            <div className="h-6 lg:h-14"></div>
            <MainPageGamesSlider data={speakingGames} />
            <div className="h-6 lg:h-14"></div>
            <div className="h-6 lg:h-14"></div>
            <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
              {t("home.discussionCardsSection")}
            </h1>
            <div className="h-2"></div>
            <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
              {t("home.discussionCardsSectionDesc")}
            </p>
            <div className="h-6 lg:h-14"></div>
            <MainPageGamesSlider data={discussionCards} />
            <div className="h-6 lg:h-14"></div>
            <div className="flex justify-center">
              <Button
                color="primary"
                className={`min-h-[48px] lg:min-h-[58px] w-[100%] lg:w-[306px] pr-[8px] ${
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
              w-[32px]
              lg:w-[42px]
              h-[32px]
              lg:h-[42px]
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
                  {t("home.startFree")}
                </p>
              </Button>
            </div>
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
