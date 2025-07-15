import Logo from "@/assets/icons/logo.svg";
import WaIcon from "@/assets/icons/wa.svg";
import EmailIcon from "@/assets/icons/email.svg";

import Image from "next/image";
import Link from "next/link";
import { ContentWrapper } from "../ContentWrapper";

export const Footer = () => {
  return (
    <div
      className="
    mt-0
    lg:mt-10
    "
    >
      <ContentWrapper>
        <div
          className="
          flex
          items-center
          py-5
          flex-col
          justify-center
          lg:flex-row
          lg:justify-between
          lg:py-20
          "
        >
          <div className="w-[140px]">
            <Image
              priority={false}
              src={Logo}
              alt="logo"
              className="m-auto lg:m-0"
            />
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
          <div
            className="
            w-[140px]
            flex
            items-center
            gap-4
            m-auto
            mt-4
            justify-center
            lg:m-0
            lg:justify-start
            "
          >
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
    </div>
  );
};
