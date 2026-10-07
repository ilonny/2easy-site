"use client";

import Link from "next/link";
import { T } from "@/i18n/T";

type TProps = {
  variant?: "header" | "sidebar";
  onNavigate?: () => void;
  revealed?: boolean;
};

const links = [
  { href: "/lesson_plans", menuKey: "headerMenu.lessonPlans" },
  { href: "/speaking_games", menuKey: "headerMenu.speakingGames" },
  { href: "/cards", menuKey: "headerMenu.discussionCards" },
  { href: "/grammar", menuKey: "headerMenu.grammar" },
  { href: "/subscription", menuKey: "headerMenu.subscription" },
  { href: "/tutorial", menuKey: "headerMenu.tutorial" },
];

export const HeaderMenuList = ({
  variant = "header",
  onNavigate,
  revealed = true,
}: TProps) => {
  if (variant === "sidebar") {
    return (
      <nav className="flex flex-col items-center gap-[25px]">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onNavigate}
            style={{ transitionDelay: revealed ? `${70 + index * 45}ms` : "0ms" }}
            className={`touch-manipulation text-base font-bold leading-[1.2] tracking-brand text-brand-black transition-[opacity,transform,color] duration-500 ease-out-expo hover:text-brand-violet motion-reduce:transition-none motion-reduce:delay-0 ${
              revealed ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <T k={link.menuKey} />
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <nav className="hidden flex-row items-center justify-center gap-[30px] lg:flex">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="text-sm font-bold leading-none tracking-brand text-brand-black transition-colors hover:text-brand-violet"
        >
          <T k={link.menuKey} />
        </Link>
      ))}
    </nav>
  );
};
