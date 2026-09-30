"use client";
import Image from "next/image";
import { HeaderProfile } from "../HeaderProfile";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentWrapper } from "../ContentWrapper";
import { Skeleton } from "@nextui-org/react";
import { HeaderMenuList } from "../HeaderMenuList";
import BurgerMenuIcon from "@/assets/icons/burger_menu.svg";
import BurgerCloseIcon from "@/assets/icons/burger_close.svg";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import { SideBar } from "../SIdeBar";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Logo } from "../Logo";
import { T } from "@/i18n/T";
import { BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX, BOARD_LESSON_PAGE_PATH_PREFIX } from "@/app/board/constants";
import { useUserAccess } from "@/app/subscription/helpers";
import { headerCtaClassName } from "./styles";

export const Header = () => {
  const pathname = usePathname();
  const { profile, authIsLoading } = useContext(AuthContext);
  const access = useUserAccess();
  const [sidebarIsOpened, setSidebarIsOpened] = useState(false);

  useEffect(() => {
    if (!sidebarIsOpened) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.body.classList.add("site-menu-open");
    return () => {
      document.body.style.overflow = previous;
      document.body.classList.remove("site-menu-open");
    };
  }, [sidebarIsOpened]);

  useEffect(() => {
    setSidebarIsOpened(false);
  }, [pathname]);

  if (
    [
      "/login",
      "/registration",
      "/restore-password",
      "/start-registration",
      "/taboo_a1_a2",
      "/taboo_b1_b2",
      "/taboo_b1_b2_slang",
    ].includes(pathname) ||
    pathname?.startsWith(BOARD_LESSON_PAGE_PATH_PREFIX) ||
    pathname?.startsWith(BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX)
  ) {
    return null;
  }

  const isGuest = !authIsLoading && !profile?.name;

  return (
    <header className="site-header-root bg-white">
      <div className="site-header-bar fixed left-0 top-0 w-full bg-white lg:static">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 pt-10 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-[65px]">
          <div className="hidden lg:flex">
            <LanguageSwitcher variant="brand" />
          </div>
          <a
            href={
              profile?.studentId
                ? `/student-account/${profile?.studentId}`
                : "/"
            }
            className="flex shrink-0"
          >
            <Logo className="text-[28.45px] md:text-[34.56px] lg:text-[43.2px]" />
          </a>
          <div className="flex min-w-0 items-center justify-end gap-3 max-[374px]:gap-2 md:gap-[15px] lg:gap-2">
            {authIsLoading ? (
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-24 rounded-[14px]" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
            ) : isGuest ? (
              <>
                <Link
                  href="/login"
                  className="hidden h-[47px] items-center justify-center rounded-[14px] px-3 text-sm font-bold leading-none tracking-brand text-brand-black transition-colors hover:bg-brand-gray lg:flex"
                >
                  <T k="header.login" />
                </Link>
                <Link href="/registration" className={headerCtaClassName}>
                  <T k="header.tryFree" />
                  <Image
                    src={FireButtonIcon}
                    alt=""
                    aria-hidden
                    className="hidden md:block"
                  />
                </Link>
              </>
            ) : (
              <>
                {profile?.isStudent && (
                  <div className="lg:hidden">
                    <LanguageSwitcher variant="brand" />
                  </div>
                )}
                <HeaderProfile isStudent={profile?.isStudent} access={access} />
              </>
            )}
            {!profile?.isStudent && (
              <button
                type="button"
                className="flex size-10 shrink-0 touch-manipulation items-center justify-center rounded-[9.6px] bg-brand-gray lg:hidden"
                aria-label={sidebarIsOpened ? "Close menu" : "Open menu"}
                aria-expanded={sidebarIsOpened}
                onClick={() => setSidebarIsOpened((o) => !o)}
              >
                <Image
                  src={sidebarIsOpened ? BurgerCloseIcon : BurgerMenuIcon}
                  alt=""
                  aria-hidden
                />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="h-20 md:h-[86px] lg:hidden"></div>
      {!profile?.isStudent && profile?.name && (
        <ContentWrapper>
          <div className="hidden pt-6 lg:block">
            <HeaderMenuList />
          </div>
        </ContentWrapper>
      )}
      <SideBar
        isOpened={sidebarIsOpened}
        onClose={() => setSidebarIsOpened(false)}
        access={access}
      />
    </header>
  );
};
