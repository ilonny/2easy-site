import Logo from "@/assets/icons/logo.svg";
import WaIcon from "@/assets/icons/wa.svg";
import EmailIcon from "@/assets/icons/email.svg";

import Image from "next/image";
import Link from "next/link";
import { ContentWrapper } from "../ContentWrapper";

export const Footer = () => {
  return (
    <ContentWrapper>
      <div className="flex items-center justify-between py-20">
        <div className="w-[140px]">
          <Image priority={false} src={Logo} alt="logo" />
        </div>
        <div className="text-center flex flex-col">
          <p>© 2023 – 2025 2EASY</p>
          <br />
          <Link
            href="#"
            target="_blank"
            className="text-primary underline decoration-1 hover:decoration-0"
          >
            Политика конфиденциальности
          </Link>
          <Link
            href="#"
            target="_blank"
            className="text-primary underline decoration-1 hover:decoration-0"
          >
            Публичная оферта
          </Link>
        </div>
        <div className="w-[140px] flex items-center gap-4">
          <Link
            href="#"
            target="_blank"
            className="text-primary underline hover:opacity-[0.8]"
          >
            <Image src={WaIcon} alt="whatsapp" />
          </Link>
          <Link
            href="#"
            target="_blank"
            className="text-primary underline hover:opacity-[0.8]"
          >
            <Image src={EmailIcon} alt="email" />
          </Link>
        </div>
      </div>
    </ContentWrapper>
  );
};
