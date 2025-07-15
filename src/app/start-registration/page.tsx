"use client";
import { Panel } from "@/ui";
import Image from "next/image";
import Logo from "@/assets/icons/logo.svg";
import Link from "next/link";
import CheckedIcon from "@/assets/icons/checked.svg";
import { Button } from "@nextui-org/react";
import Bg from "@/assets/images/start_registration_bg.png";

export default function StartRegistrationPage() {
  return (
    <main
      className="
      flex
      flex-col
      flex-1
      justify-center
      items-center
      justify-items-center
      min-h-screen
      bg-[#20107D]
      p-4
      pb-0
      gap-3
      lg:p-8
      lg:pb-20
      lg:gap-6"
    >
      <div className="w-[100%] max-w-[771px]">
        <Panel>
          <div className="flex justify-center">
            <Link href={"/"}>
              <Image priority={false} src={Logo} alt="logo" />
            </Link>
          </div>
        </Panel>
      </div>
      <div className="w-[100%] max-w-[771px] border-pinkSecondary border-3 rounded-[13px] overflow-hidden relative">
        <Panel
          style={{
            background: `url(${Bg.src}) right top no-repeat #fff`,
            backgroundSize: "contain",
          }}
        >
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            Еще не пользовались 2easy?
          </h1>
          <div className="h-4" />
          <Link href="/registration">
            <h2 className="font-medium text-lg">
              Начните с{" "}
              <span className="border-primary border-b-2">
                бесплатного пробного периода
              </span>
            </h2>
          </Link>
          <div className="h-4" />
          <div className="max-w-[420px]">
            У вас будет 3 дня полного доступа ко всему, что есть на сайте. Это
            позволит познакомиться с платформой перед оформлением подписки
          </div>
          <div className="h-4" />
          <div className="max-w-[420px] flex items-center gap-4">
            <Image priority={false} src={CheckedIcon} alt="ckecked-icon" />
            <p className="text-[#219F59] text-small">
              Не нужно вводить данные карты, пока сами не захотите оформить
              подписку
            </p>
          </div>
          <div className="h-9" />
          <div className="max-w-[320px]">
            <Link href="/registration">
              <Button
                fullWidth
                size="lg"
                color="warning"
                style={{ backgroundColor: "#FF7EB3", color: "#fff" }}
              >
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </Panel>
      </div>
    </main>
  );
}
