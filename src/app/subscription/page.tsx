"use client";
import { Panel } from "@/ui";
import Image from "next/image";
import Link from "next/link";
import CheckedIcon from "@/assets/icons/checked.svg";
import {
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tab,
  Tabs,
} from "@nextui-org/react";
import Bg from "@/assets/images/start_registration_bg.png";
import { ContentWrapper } from "@/components";
import { useState } from "react";
import SaleIcon from "@/assets/icons/sale.svg";
import TariffCheckedIcon from "@/assets/icons/tariff_checked.svg";
import TariffCheckedGrayIcon from "@/assets/icons/tariff_checked_gray.svg";
import { RegistrationForm } from "../registration";

export default function StartRegistrationPage() {
  const [tabIndex, setTabIndex] = useState(0);
  const [modalIsOpened, setModalIsOpened] = useState(false);
  return (
    <main style={{ backgroundColor: "#f9f9f9" }}>
      <ContentWrapper>
        <div className="w-[771px] mx-8">
          <div className="h-14" />
          <Breadcrumbs>
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>
            <BreadcrumbItem>Подписка</BreadcrumbItem>
          </Breadcrumbs>
        </div>
        <div className="h-10" />
        <div className="h-10" />
        <div className="flex flex-col items-center">
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            подписка 2easy
          </h1>
          <div className="h-3" />
          <h2 className="font-medium text-lg">
            Доступ к материалам и платформе для создания уроков
          </h2>
          <div className="h-5" />
          <p className="text-center max-w-[750px]">
            Подписка открывает доступ к материалам и обновлениям, которые
            появляются в период действия подписки, платформе для создания уроков
            и личному кабинету с учениками для проведения уроков в real-time.
            <br />
            <br />
            Продление подписки происходит автоматически.Вы можете отменить ее в
            любое время в личном кабинете или по ссылке –{" "}
            <span className="underline">https://my.cloudpayments.ru</span>
          </p>
          <div className="h-10" />
          <div className="h-10" />
          <div className="w-[771px] border-pinkSecondary border-3 rounded-[13px] overflow-hidden relative">
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

              <h2
                className="font-medium text-lg cursor-pointer"
                onClick={() => setModalIsOpened(true)}
              >
                Начните с{" "}
                <span className="border-primary border-b-2">
                  бесплатного пробного периода
                </span>
              </h2>

              <div className="h-4" />
              <div className="max-w-[420px]">
                У вас будет 3 дня полного доступа ко всему, что есть на сайте.
                Это позволит познакомиться с платформой перед оформлением
                подписки
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
                <Button
                  fullWidth
                  size="lg"
                  color="warning"
                  style={{ backgroundColor: "#FF7EB3", color: "#fff" }}
                  onClick={() => setModalIsOpened(true)}
                >
                  Начать бесплатно
                </Button>
              </div>
            </Panel>
          </div>
          <div className="h-10" />
          <div className="h-10" />
          <h1 className={"text-primary font-bold text-3xl uppercase"}>
            тарифы 2easy
          </h1>
          <div className="h-3" />
          <h2 className="font-medium text-lg text-center">
            Выберите тариф, чтобы оформить подписку на сайт,
            <br />
            или{" "}
            <Link href="/login">
              <span className="text-primary underline">
                войдите в личный кабинет
              </span>
            </Link>
            , если у вас уже есть подписка
          </h2>
          <div className="h-10" />
          <div className="h-10" />
          <div className="relative">
            <Tabs
              aria-label="Options"
              selectedKey={tabIndex}
              color="primary"
              size="lg"
              radius="sm"
              onSelectionChange={setTabIndex}
            >
              <Tab key={0} title="Месяц" style={{ minWidth: "100px" }} />
              <Tab key={1} title="Год" style={{ minWidth: "100px" }} />
            </Tabs>
            <Image
              src={SaleIcon}
              alt="sale-icon"
              className="absolute right-[0px] top-[-2px]"
            />
          </div>
          <div className="h-10" />
          <div className="flex items-start justify-center gap-4">
            <div
              className="p-7 text-white"
              style={{
                background: "linear-gradient(180deg, #7B2DD6 0%, #3F28C6 100%)",
                width: 376,
                borderRadius: 10,
              }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-2xl">2EASY Pro</p>
                <p className="font-medium">790₽ / месяц</p>
              </div>
              <div className="h-10" />
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedIcon} alt="tariff icon" />
                <p>Доступ ко всем материалам 2easy</p>
              </div>
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedIcon} alt="tariff icon" />
                <p>Конструктор для создания уроков</p>
              </div>
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedIcon} alt="tariff icon" />
                <p>Личный кабинет с учениками</p>
              </div>
              <div
                className="flex items-start justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image
                  src={TariffCheckedIcon}
                  alt="tariff icon"
                  className="top-1 relative"
                />
                <p>Удобный доступ к уроку для каждого участника в real-time</p>
              </div>
            </div>
            <div
              className="p-7 text-white"
              style={{
                background: "linear-gradient(180deg, #7B2DD6 0%, #3F28C6 100%)",
                width: 376,
                borderRadius: 10,
              }}
            >
              <div className="flex items-center justify-between">
                <p className="font-bold text-2xl">2EASY Base</p>
                <p className="font-medium">590₽ / месяц</p>
              </div>
              <div className="h-10" />
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedGrayIcon} alt="tariff icon" />
                <p style={{ color: "#C4C4C4", textDecoration: "line-through" }}>
                  Доступ ко всем материалам 2easy
                </p>
              </div>
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedIcon} alt="tariff icon" />
                <p>Конструктор для создания уроков</p>
              </div>
              <div
                className="flex items-center justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image src={TariffCheckedIcon} alt="tariff icon" />
                <p>Личный кабинет с учениками</p>
              </div>
              <div
                className="flex items-start justify-start gap-2"
                style={{ fontSize: 15 }}
              >
                <Image
                  src={TariffCheckedIcon}
                  alt="tariff icon"
                  className="top-1 relative"
                />
                <p>Удобный доступ к уроку для каждого участника в real-time</p>
              </div>
            </div>
          </div>
          <div className="h-4" />
          <div className="flex items-start justify-center gap-4">
            <div
              style={{
                width: 376,
              }}
            >
              <Button
                fullWidth
                color="primary"
                size="lg"
                onClick={() => setModalIsOpened(true)}
              >
                Подписаться за 790₽
              </Button>
            </div>
            <div
              style={{
                width: 376,
              }}
            >
              <Button
                fullWidth
                color="primary"
                size="lg"
                onClick={() => setModalIsOpened(true)}
              >
                Подписаться за 590₽
              </Button>
            </div>
          </div>
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
          <div className="h-10" />
        </div>
      </ContentWrapper>
      <Modal
        size="lg"
        isOpen={modalIsOpened}
        onClose={() => setModalIsOpened(false)}
      >
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <RegistrationForm />
            <div className="h-10" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}
