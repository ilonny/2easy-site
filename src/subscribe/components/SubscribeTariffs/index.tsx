"use client";
import { RegistrationForm } from "@/app/registration";
import TariffCheckedIcon from "@/assets/icons/tariff_checked.svg";
import { AuthContext } from "@/auth";
import { PaymentForm } from "@/payment";
import { SibscribeContext } from "@/subscribe/context";
import { TSubscribePeriod } from "@/subscribe/types";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import Image from "next/image";
import { useCallback, useContext, useState } from "react";

import Bg from "@/assets/images/year_tariff.png";

export const SubscribeTariffs = () => {
  const { profile } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);

  const isMonthTariff = subscription?.subscribe_type_id === 2;
  const isYearTariff = subscription?.subscribe_type_id === 3;
  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  const [regModalIsOpened, setRegModalIsOpened] = useState(false);
  const [paymentOpened, setPaymentOpened] = useState(false);
  const [selectedType, setSelectedType] = useState<TSubscribePeriod>("month");

  const onClickTariff = useCallback(
    (type: TSubscribePeriod) => {
      if (!profile?.login) {
        setRegModalIsOpened(true);
        return;
      }

      setSelectedType(type);
      setPaymentOpened(true);
    },
    [profile?.login]
  );

  return (
    <div>
      <div className="flex items-stretch justify-center gap-4">
        {!isYearTariff && (
          <div
            className="text-white"
            style={{
              background: "linear-gradient(180deg, #7B2DD6 0%, #3F28C6 100%)",
              width: 376,
              borderRadius: 10,
              padding: "20px",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-2xl">2EASY month</p>
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
        )}
        {isMonthTariff ? (
          <div
            style={{
              background: `url(${Bg.src})  center center / cover no-repeat rgb(255, 255, 255)`,
              width: 376,
              borderRadius: 10,
              padding: "20px",
            }}
          ></div>
        ) : (
          <div
            className="p-7 text-white"
            style={{
              background:
                "linear-gradient(121.74deg, #FF9966 15.45%, #FF5E62 80.53%)",
              width: 376,
              borderRadius: 10,
              padding: "20px",
            }}
          >
            <div className="flex items-center justify-between">
              <p className="font-bold text-2xl">2EASY Year</p>
              <p className="font-medium">6990₽ / год</p>
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
        )}
      </div>
      <div className="h-4" />
      <div className="flex items-start justify-center gap-4">
        <div
          style={{
            width: 376,
          }}
        >
          {!hasTariff && (
            <Button
              fullWidth
              color="primary"
              size="lg"
              onClick={() => onClickTariff("month")}
            >
              Подписаться за 790₽
            </Button>
          )}
        </div>
        <div
          style={{
            width: 376,
          }}
        >
          {!hasTariff && (
            <Button
              style={{ backgroundColor: "#FF5E62" }}
              fullWidth
              color="primary"
              size="lg"
              onClick={() => onClickTariff("year")}
            >
              Подписаться за 6990₽
            </Button>
          )}
          {isMonthTariff && (
            <Button
              style={{ textDecoration: "underline" }}
              variant="light"
              fullWidth
              color="primary"
              size="lg"
              onClick={() => onClickTariff("year")}
            >
              Продлить на год со скидкой 30%
            </Button>
          )}
        </div>
      </div>
      <Modal
        size="lg"
        isOpen={regModalIsOpened}
        onClose={() => setRegModalIsOpened(false)}
      >
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <RegistrationForm />
            <div className="h-10" />
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        size="lg"
        isOpen={paymentOpened}
        onClose={() => setPaymentOpened(false)}
      >
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <PaymentForm type={selectedType} />
            <div className="h-10" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};
