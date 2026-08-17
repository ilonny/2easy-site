"use client";
import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import { HeaderProfile } from "../HeaderProfile";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentWrapper } from "../ContentWrapper";
import { Button, Skeleton } from "@nextui-org/react";
import { HeaderMenuList } from "../HeaderMenuList";
import MenuIcon from "@/assets/icons/menu.svg";
import CloseIcon from "@/assets/icons/close.svg";
import { SideBar } from "../SIdeBar";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { T } from "@/i18n/T";
import { BOARD_LESSON_PAGE_LEGACY_PATH_PREFIX, BOARD_LESSON_PAGE_PATH_PREFIX } from "@/app/board/constants";

export const Header = () => {
  const pathname = usePathname();
  const { profile, authIsLoading } = useContext(AuthContext);
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
  return (
    <div
      className="site-header-root"
      style={{
        boxShadow: "0px 4px 20px 1px rgb(0 0 0 / 5%)",
      }}
    >
      <ContentWrapper>
        <div
          className="site-header-bar fixed left-0 w-[100%] bg-white px-4 lg:static lg:px-0"
        >
          <div
            className={`flex min-h-[80px] flex-row items-center justify-between border-[#D9D9D9] py-4 lg:min-h-[115px] lg:py-8 border-b-[${
              profile?.isStudent ? "0" : "1"
            }px]`}
          >
            <div className="left flex items-center gap-3">
              {!profile?.isStudent && (
                <button
                  type="button"
                  className="touch-manipulation lg:hidden"
                  aria-label={sidebarIsOpened ? "Close menu" : "Open menu"}
                  aria-expanded={sidebarIsOpened}
                  onClick={() => setSidebarIsOpened((o) => !o)}
                >
                  <Image
                    src={sidebarIsOpened ? CloseIcon : MenuIcon}
                    alt={sidebarIsOpened ? "close" : "menu"}
                    className="w-[40px]"
                  />
                </button>
              )}
              <div className={profile?.isStudent ? "" : "hidden lg:block"}>
                <LanguageSwitcher />
              </div>
            </div>
            <a
              href={
                profile?.studentId
                  ? `/student-account/${profile?.studentId}`
                  : "/"
              }
            >
              <div className="center absolute left-1/2 top-4 -ml-[53px] lg:top-8">
                <Image priority={false} src={Logo} alt="logo" />
              </div>
            </a>
            <div className="right min-w-0">
              <div className="">
                {authIsLoading ? (
                  <div className="flex items-center gap-5">
                    <Skeleton className="h-10 w-20 rounded-lg" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                ) : (
                  <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                    {profile?.name ? (
                      <HeaderProfile isStudent={profile?.isStudent} />
                    ) : (
                      <>
                        <Link
                          href="/registration"
                          className="hidden lg:block"
                        >
                          <Button variant="light">
                            <span className="underline">
                              <T k="header.register" />
                            </span>
                          </Button>
                        </Link>
                        <Link href="/login">
                          <Button
                            radius="sm"
                            color="primary"
                            className="sm:px-0 lg:px-10"
                          >
                            <T k="header.login" />
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-[80px] lg:hidden"></div>
        {!profile?.isStudent && profile?.name && (
          <div className="hidden lg:block">
            <HeaderMenuList />
          </div>
        )}
        <SideBar
          isOpened={sidebarIsOpened}
          onClose={() => setSidebarIsOpened(false)}
        />
      </ContentWrapper>
    </div>
  );
};
