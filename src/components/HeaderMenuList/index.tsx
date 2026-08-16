"use client";

import { Button } from "@nextui-org/react";
import Link from "next/link";
import { T } from "@/i18n/T";
import { LanguageSwitcher } from "../LanguageSwitcher";

type TProps = {
  variant?: "header" | "sidebar";
  onNavigate?: () => void;
};

const links = [
  { href: "/lesson_plans", key: "header.lessonPlans" as const },
  { href: "/speaking_games", key: "header.speakingGames" as const },
  { href: "/cards", key: "header.discussionCards" as const },
  { href: "/grammar", key: "header.grammar" as const },
  { href: "/subscription", key: "header.subscription" as const },
  { href: "/tutorial", key: "header.tutorial" as const },
];

export const HeaderMenuList = ({
  variant = "header",
  onNavigate,
}: TProps) => {
  if (variant === "sidebar") {
    return (
      <nav className="flex h-full min-h-0 w-full flex-1 flex-col items-center justify-center gap-5 px-6 py-8 sm:gap-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            className="w-full max-w-[280px]"
          >
            <Button
              variant="light"
              className="h-12 min-h-12 w-full touch-manipulation text-base font-bold text-[#231F20] sm:text-lg"
            >
              <T k={link.key} />
            </Button>
          </Link>
        ))}
        <div className="mt-4 flex justify-center">
          <LanguageSwitcher />
        </div>
      </nav>
    );
  }

  return (
    <div className="mx-8 hidden flex-row items-center justify-center gap-3 py-2 pb-6 lg:flex">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          <Button variant="light" className="font-bold">
            <T k={link.key} />
          </Button>
        </Link>
      ))}
    </div>
  );
};
