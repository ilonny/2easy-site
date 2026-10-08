"use client";
import Image from "next/image";
import { HeaderProfile } from "../HeaderProfile";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentWrapper } from "../ContentWrapper";
import { Skeleton } from "@nextui-org/react";
import { HeaderMenuList } from "../HeaderMenuList";
import FireButtonIcon from "@/assets/icons/fire_button.svg";
import { SideBar } from "../SIdeBar";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { Logo } from "../Logo";
import { T } from "@/i18n/T";
import { BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX, BOARD_LESSON_PAGE_PATH_PREFIX } from "@/app/board/constants";
import { useUserAccess } from "@/app/subscription/helpers";
import { headerCtaClassName, headerGhostLinkClassName } from "./styles";

const burgerBarClassName =
  "absolute left-0 h-[1.85px] w-[18.5px] rounded-full bg-brand-black transition-transform duration-300 ease-out-expo motion-reduce:transition-none";

const BurgerIcon = ({ open }: { open: boolean }) => (
  <span className="relative block h-[13px] w-[18.5px]" aria-hidden>
    <span
      className={`${burgerBarClassName} ${
        open ? "top-[5.6px] rotate-45" : "top-0"
      }`}
    />
    <span
      className={`${burgerBarClassName} top-[5.6px] ${
        open ? "scale-x-0" : ""
      }`}
    />
    <span
      className={`${burgerBarClassName} ${
        open ? "top-[5.6px] -rotate-45" : "top-[11.15px]"
      }`}
    />
  </span>
);

export const Header = () => {
  const pathname = usePathname();
  const { profile, authIsLoading } = useContext(AuthContext);
  const access = useUserAccess();
  const [sidebarIsOpened, setSidebarIsOpened] = useState(false);
  const rootRef = useRef<HTMLElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

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

  const isHidden =
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
    pathname?.startsWith(BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX);

  // Constructor (/editor) and lesson mode (/lessons/[id]): header scrolls with
  // the page so it does not cover exercises. While the mobile menu is open,
  // keep the bar pinned so the close control stays reachable.
  const isUnpinnedPath =
    !!pathname?.startsWith("/editor/") ||
    !!pathname?.startsWith("/lessons/");
  const headerScrollsAway = isUnpinnedPath && !sidebarIsOpened;

  useEffect(() => {
    const docStyle = document.documentElement.style;
    const root = rootRef.current;
    const bar = barRef.current;
    if (isHidden || !root || !bar) {
      docStyle.setProperty("--site-header-h", "0px");
      return () => {
        docStyle.removeProperty("--site-header-h");
        docStyle.removeProperty("--site-header-extra-h");
      };
    }
    const desktop = window.matchMedia("(min-width: 1024px)");
    const update = () => {
      // On the landing page the desktop header scrolls away, so sticky
      // sections should sit at the top of the viewport.
      if (pathname === "/" && desktop.matches) {
        docStyle.setProperty("--site-header-h", "0px");
        // The overlaid header can grow below the bar (teacher menu row);
        // the hero is pushed down by that extra height.
        docStyle.setProperty(
          "--site-header-extra-h",
          `${Math.max(0, root.offsetHeight - bar.offsetHeight)}px`,
        );
        return;
      }
      docStyle.removeProperty("--site-header-extra-h");
      // Unpinned editor/lesson header: sticky children sit at the viewport top.
      if (headerScrollsAway) {
        docStyle.setProperty("--site-header-h", "0px");
        return;
      }
      const pinned = desktop.matches ? root : bar;
      docStyle.setProperty("--site-header-h", `${pinned.offsetHeight}px`);
    };
    update();
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(root);
    resizeObserver.observe(bar);
    desktop.addEventListener("change", update);
    return () => {
      resizeObserver.disconnect();
      desktop.removeEventListener("change", update);
      docStyle.removeProperty("--site-header-h");
      docStyle.removeProperty("--site-header-extra-h");
    };
  }, [isHidden, pathname, headerScrollsAway]);

  const isLanding = pathname === "/";

  if (isHidden) {
    return null;
  }

  const isGuest = !authIsLoading && !profile?.name;

  return (
    <header
      ref={rootRef}
      className={`site-header-root ${
        isLanding
          ? "site-header-overlay"
          : `bg-white lg:pb-3 min-[1200px]:pb-5${isUnpinnedPath ? " site-header-unpinned" : ""}`
      }`}
    >
      <div
        ref={barRef}
        className={`site-header-bar w-full ${
          headerScrollsAway ? "relative" : "fixed left-0 top-0 lg:static"
        } ${isLanding ? "bg-transparent" : "bg-white"}`}
      >
        <div
          className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 pb-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:px-[65px] lg:pb-0 ${
            isLanding
              ? "pt-6 lg:pt-4 min-[1200px]:pt-8"
              : "pt-10 lg:pt-4 min-[1200px]:pt-10"
          }`}
        >
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher variant="brand" />
            {isGuest && (
              <Link
                href="/login?role=student"
                className={`${headerGhostLinkClassName} text-brand-violet`}
              >
                <T k="header.imStudent" />
              </Link>
            )}
          </div>
          <a
            href={
              profile?.studentId
                ? `/student-account/${profile?.studentId}`
                : "/"
            }
            className="flex shrink-0"
          >
            <Logo
              animated={isLanding}
              className="text-[28.45px] md:text-[34.56px] min-[1200px]:text-[43.2px]"
            />
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
                  className={`${headerGhostLinkClassName} text-brand-black`}
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
                <BurgerIcon open={sidebarIsOpened} />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="h-[var(--site-header-h)] lg:hidden"></div>
      {!profile?.isStudent && profile?.name && (
        <ContentWrapper>
          <div className="hidden pt-3 lg:block min-[1200px]:pt-6">
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
