"use client";
import Logo from "../../assets/icons/logo.svg";
import Image from "next/image";
import { HeaderProfile } from "../HeaderProfile";
import { useContext } from "react";
import { AuthContext } from "@/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ContentWrapper } from "../ContentWrapper";
import { Button, Skeleton } from "@nextui-org/react";
import { HeaderMenuList } from "../HeaderMenuList";
export const Header = () => {
  const pathname = usePathname();
  const { profile, authIsLoading } = useContext(AuthContext);
  if (
    [
      "/login",
      "/registration",
      "/restore-password",
      "/start-registration",
    ].includes(pathname)
  ) {
    return null;
  }
  return (
    <ContentWrapper>
      <div className="flex flex-row items-center justify-between border-b-[1px] border-[#D9D9D9] mx-8 py-8 min-h-[115px]">
        <div className="left"></div>
        <a href="/">
          <div className="center absolute top-8 left-1/2 -ml-[53px]">
            <Image priority={false} src={Logo} alt="logo" />
          </div>
        </a>
        <div className="right">
          {authIsLoading ? (
            <div className="flex items-center gap-5">
              <Skeleton className="w-20 h-10 rounded-lg" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
          ) : (
            <>
              {profile?.name ? (
                <HeaderProfile />
              ) : (
                <div className="flex items-center gap-4">
                  <Link href="/start-registration">
                    <Button variant="light">
                      <span className="underline">Зарегистрироваться</span>
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button radius="sm" color="primary" className="px-10">
                      Войти
                    </Button>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <HeaderMenuList />
    </ContentWrapper>
  );
};
