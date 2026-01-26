import { FC, useContext, useEffect, useMemo, useState } from "react";
import { TProps } from "./types";
import Link from "next/link";
import HandIcon from "@/assets/icons/hand.png";
import Image from "next/image";
import { AuthContext } from "@/auth";

export const MainPageGamesSlider: FC<TProps> = ({ data }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeEl = data[activeIndex];

  const [handIconIsVisible, setHandIconIsVisible] = useState(true);
  const { profile, authIsLoading } = useContext(AuthContext);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHandIconIsVisible((prev) => !prev);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      {/* desktop version */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between">
          <div className="w-[310px] bg-[#3E1BC9] p-4 rounded-[20px] flex flex-col gap-2">
            {data.map((el, index) => {
              return (
                <div
                  onClick={() => setActiveIndex(index)}
                  key={el.title}
                  className="w-[100%] cursor-pointer p-4 rounded-[10px] transition-all duration-250 ease-in-out hover:opacity-[0.8]"
                  style={{
                    backgroundColor:
                      index === activeIndex
                        ? "rgb(43, 18, 164)"
                        : "rgb(77, 51, 198)",
                  }}
                >
                  <p className="text-white text-[20px]">{el.title}</p>
                  <p className="text-white font-semibold uppercase text-[14px] opacity-[0.5]">
                    {el.subTitle}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="w-[100%] max-w-[800px]">
            <div
              className={`${activeEl.videoSrc} min-h-[412px] rounded-[20px]`}
            >
              {!!activeEl.videoSrc && <video src={activeEl.videoSrc} />}
              {!!activeEl.imageSrc && (
                <Image alt="image" src={activeEl.imageSrc} />
              )}
            </div>
            <div className="h-6"></div>
            <p className="font-semibold text-[24px] leading-[120%]">
              {activeEl.title}
            </p>
            <div className="h-4"></div>
            <p className="text-[14px] text-[#ACACAC] leading-[120%] uppercase max-w-[600px] font-semibold">
              {activeEl.description}
            </p>
            <div className="h-4"></div>
            {!!profile?.name && (
              <Link href={activeEl.link}>
                <p
                  style={{ color: "#5837dc" }}
                  className="uppercase font-semibold"
                >
                  открыть →
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
      {/* mobile version */}
      <div className="lg:hidden">
        <div className="flex relative">
          <div className="flex overflow-scroll gap-4">
            {data.map((activeEl) => {
              return (
                <div key={activeEl.title} className="w-[100%] flex-shrink-0">
                  <div className="bg-white min-h-[212px] rounded-[20px]">
                    {!!activeEl.videoSrc && <video src={activeEl.videoSrc} />}
                    {!!activeEl.imageSrc && (
                      <Image alt="image" src={activeEl.imageSrc} />
                    )}
                  </div>
                  <div className="h-6"></div>
                  <p className="font-semibold text-[24px] leading-[120%]">
                    {activeEl.title}
                  </p>
                  <div className="h-4"></div>
                  <p className="text-[14px] text-[#ACACAC] leading-[120%] uppercase max-w-[600px] font-semibold">
                    {activeEl.description}
                  </p>
                  <div className="h-4"></div>
                  <Link href={activeEl.link}>
                    <p
                      style={{ color: "#5837dc" }}
                      className="uppercase font-semibold"
                    >
                      открыть →
                    </p>
                  </Link>
                </div>
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
      </div>
    </>
  );
};
