"use client";
import { useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@nextui-org/react";
import { AuthContext } from "@/auth";
import { T } from "@/i18n/T";
import { useUserAccess } from "@/app/subscription/helpers";
import { TrialChip } from "@/components/TrialChip";
import NoCardIcon from "@/assets/icons/no_card.svg";

const buttonClassName =
  "relative flex h-[46px] items-center justify-center whitespace-nowrap min-w-[200px] rounded-[14px] bg-brand-violet px-5 text-xs font-bold leading-none tracking-brand text-white transition-opacity hover:opacity-90 lg:min-w-[240px] lg:px-6 lg:text-sm";

export const HeroCta = () => {
  const { profile } = useContext(AuthContext);
  const access = useUserAccess();

  if (access === "loading") {
    return (
      <div className="flex flex-col items-center gap-3 pt-2.5">
        <Skeleton className="h-[46px] w-[200px] rounded-[14px] lg:w-[240px]" />
      </div>
    );
  }

  if (access === "guest") {
    return (
      <div className="flex flex-col items-center gap-3 pt-2.5">
        <Link href="/registration" className={buttonClassName}>
          <T k="header.tryFree" />
          <TrialChip
            responsive
            className="absolute right-[3.5px] top-[-14px] md:right-[15px] md:top-[-14.4px] lg:right-[23px] lg:top-[-19.3px]"
          />
        </Link>
        <p className="flex items-center gap-1.5 text-xs font-bold leading-4 tracking-brand text-brand-black lg:text-sm lg:leading-[19px]">
          <span className="relative size-[18px] shrink-0">
            <Image
              src={NoCardIcon}
              alt=""
              aria-hidden
              className="absolute left-[3px] top-1"
            />
          </span>
          <T k="hero.noCard" />
        </p>
      </div>
    );
  }

  if (access === "noSubscription") {
    return (
      <div className="flex flex-col items-center gap-3 pt-2.5">
        <Link href="/subscription" className={buttonClassName}>
          <T k="header.chooseTariff" />
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 pt-2.5">
      <Link
        href={
          access === "student"
            ? `/student-account/${profile?.studentId}`
            : "/lesson_plans"
        }
        className={buttonClassName}
      >
        <T k="hero.goToLessons" />
      </Link>
    </div>
  );
};
