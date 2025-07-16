"use client";
import { Panel } from "@/ui";
import Image from "next/image";
import Logo from "@/assets/icons/logo.svg";
import Link from "next/link";
import { RegistrationForm } from "./components";

export default function RegistrationPage() {
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
      <div className="w-[100%] max-w-[460px]">
        <Panel>
          <div className="flex justify-center">
            <Link href={"/"}>
              <Image priority={false} src={Logo} alt="logo" />
            </Link>
          </div>
        </Panel>
      </div>
      <div className="w-[100%] max-w-[460px]">
        <Panel>
          <RegistrationForm />
        </Panel>
      </div>
    </main>
  );
}
