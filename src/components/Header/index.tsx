"use client";
import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import { HeaderProfile } from "../HeaderProfile";
import { useContext, useState } from "react";
import { AuthContext } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentWrapper } from "../ContentWrapper";
import { Button, Skeleton } from "@nextui-org/react";
import { HeaderMenuList } from "../HeaderMenuList";
import MenuIcon from "@/assets/icons/menu.svg";
import { SideBar } from "../SIdeBar";

export const Header = () => {
  const pathname = usePathname();
  const { profile, authIsLoading } = useContext(AuthContext);
  const [sidebarIsOpened, setSidebarIsOpened] = useState(false);
  if (
    [
      "/login",
      "/registration",
      "/restore-password",
      "/start-registration",
      "/taboo_a1_a2",
      "/taboo_b1_b2",
      "/taboo_b1_b2_slang",
    ].includes(pathname)
  ) {
    return null;
  }
  return (
    <div
      style={{
        position: "relative",
        boxShadow: "0px 4px 20px 1px rgb(0 0 0 / 5%)",
      }}
    >
      <ContentWrapper>
        <div
          className="fixed left-0 w-[100%] px-4 lg:static lg:px-0 bg-white"
          style={{ zIndex: 3 }}
        >
          <div
            className={`flex flex-row items-center justify-between border-b-[${
              profile?.isStudent ? "0" : "1"
            }px] border-[#D9D9D9] py-4 lg:py-8 min-h-[80px] lg:min-h-[115px]`}
          >
            <div className="left">
              {!profile?.isStudent && (
                <div
                  className="lg:hidden"
                  onClick={() => setSidebarIsOpened((o) => !o)}
                >
                  <Image src={MenuIcon} alt="menu" className="w-[40px]" />
                </div>
              )}
            </div>
            <a
              href={
                profile?.studentId
                  ? `/student-account/${profile.studentId}`
                  : "/"
              }
            >
              <div className="center absolute top-4 lg:top-8 left-1/2 -ml-[53px]">
                <Image priority={false} src={Logo} alt="logo" />
              </div>
            </a>
            <div className="right">
              {/* desktop right side */}
              <div className="">
                {authIsLoading ? (
                  <div className="flex items-center gap-5">
                    <Skeleton className="w-20 h-10 rounded-lg" />
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                ) : (
                  <>
                    {profile?.name ? (
                      <HeaderProfile isStudent={profile?.isStudent} />
                    ) : (
                      <>
                        <div className="flex items-center gap-4">
                          <Link
                            href="/start-registration"
                            className="hidden lg:block"
                          >
                            <Button variant="light">
                              <span className="underline">
                                Зарегистрироваться
                              </span>
                            </Button>
                          </Link>
                          <Link href="/login">
                            <Button
                              radius="sm"
                              color="primary"
                              className="sm:px-0 lg:px-10"
                            >
                              Войти
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="lg:hidden h-[80px]"></div>
        {!profile?.isStudent && (
          // desktop links
          <div className="hidden lg:block">
            <HeaderMenuList />
          </div>
          // mobile links
        )}
        <SideBar isOpened={sidebarIsOpened} />
      </ContentWrapper>
    </div>
  );
};
