"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { T } from "@/i18n/T";

export const HeaderMenuList = () => {
  return (
    <div
      className="
      flex
      flex-col
      lg:flex-row
      lg:items-center
      lg:justify-center
      lg:gap-3
      lg:mx-8
      lg:py-2
      lg:pb-6
    "
    >
      <Link href="/lesson_plans">
        <Button variant="light" className="font-bold">
          <T k="header.lessonPlans" />
        </Button>
      </Link>
      <Link href="/speaking_games">
        <Button variant="light" className="font-bold">
          <T k="header.speakingGames" />
        </Button>
      </Link>
      <Link href="/cards">
        <Button variant="light" className="font-bold">
          <T k="header.discussionCards" />
        </Button>
      </Link>
      <Link href="/grammar">
        <Button variant="light" className="font-bold">
          <T k="header.grammar" />
        </Button>
      </Link>
      <Link href="/subscription">
        <Button variant="light" className="font-bold">
          <T k="header.subscription" />
        </Button>
      </Link>
      <Link href="/tutorial">
        <Button variant="light" className="font-bold">
          <T k="header.tutorial" />
        </Button>
      </Link>
    </div>
  );
};
