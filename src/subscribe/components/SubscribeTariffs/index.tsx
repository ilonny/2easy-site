/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";
import { RegistrationForm } from "@/app/registration";
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
import SubscribePurpleImage from "@/assets/images/subscribe_purple.png";
import tariff_checked_2 from "@/assets/icons/tariff_checked_2.svg";

import { FC, useCallback, useContext, useState } from "react";

import { SubscribeFreeBlock } from "../SubscribeFreeBlock";
import { tariffs } from "./tariffs";
import { SubscribeCancel } from "../SubscribeCancel";

type TProps = {
  hideTitle?: boolean;
};

export const SubscribeTariffs: FC<TProps> = ({ hideTitle = false }) => {
  const { profile } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  const userTariff =
    hasTariff && tariffs.find((t) => t.id === subscription?.subscribe_type_id);

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
      window?.ym(103955671, "reachGoal", "open-subscribe-modal");
    },
    [profile?.login]
  );

  return (
    <div>
      {!hideTitle && (
        <>
          <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
            Подписка 2easy
          </h1>
          <div className="h-4"></div>
          <p className="max-w-[650px] m-auto text-center font-normal text-[18px]">
            Доступ к материалам, платформе для создания уроков и личному
            кабинету с учениками для проведения уроков в real-time
          </p>
          <div className="h-4"></div>
        </>
      )}

      <div
        className="
        flex
        items-stretch
        justify-center
        gap-4
        flex-wrap
        wrap
      "
      ></div>
      <div className="h-4" />
      <div
        className="p-4 lg:p-10"
        style={{
          width: "100%",
          minHeight: 406,
          maxWidth: 793,
          background: `url(${SubscribePurpleImage.src}) center center no-repeat`,
          backgroundSize: "cover",
          margin: "auto",
          borderRadius: 20,
        }}
      >
        <div
          className="
          px-4
          py-2
        "
          style={{
            color: "#D2FF88",
            background: "rgb(107, 97, 205)",
            display: "inline-block",
            borderRadius: 100,
            fontSize: 14,
          }}
        >
          Подписка 2EASY
        </div>
        <div className="h-4"></div>
        <p
          className="
            text-white
          "
          style={{
            maxWidth: 482,
            fontWeight: 600,
            fontSize: 22,
            lineHeight: "120%",
          }}
        >
          Каждый тариф включает в себя полный доступ ко всему, что есть на
          сайте, а именно:
        </p>
        <div className="h-4"></div>
        <div
          style={{
            width: "100%",
            height: 1,
            background: "rgba(255, 255, 255, 0.3)",
          }}
        ></div>
        <div className="h-4"></div>
        <div style={{ maxWidth: 410 }}>
          <div className="flex gap-2 mb-2">
            <img src={tariff_checked_2.src} />
            <p className="text-white">
              конструктор для создания интерактивных уроков
            </p>
          </div>
          <div className="flex gap-2 mb-2">
            <img src={tariff_checked_2.src} />
            <p className="text-white">все lesson plans 2EASY (80+)</p>
          </div>
          <div className="flex gap-2 mb-2">
            <img src={tariff_checked_2.src} />
            <p className="text-white">
              все speaking games (Taboo, Would you rather, etc) и duscussion
              cards (150+)
            </p>
          </div>
          <div className="flex gap-2 mb-2">
            <img src={tariff_checked_2.src} />
            <p className="text-white">новые материалы каждую неделю</p>
          </div>
          <div className="flex gap-2 mb-2">
            <img src={tariff_checked_2.src} />
            <p className="text-white">
              раздел «grammar» с разговорными упражнениями
            </p>
          </div>
        </div>
      </div>
      <div className="h-10"></div>
      {!profile?.login && (
        <>
          <SubscribeFreeBlock />
          <div className="h-10"></div>
        </>
      )}
      {/* onClickTariff */}

      <div>
        <h1 className="text-center font-semibold max-w-[800px] text-[24px] lg:text-[38px] m-auto leading-[120%]">
          {hasTariff ? "Ваш тариф" : "Тарифы"}
        </h1>
        <div className="h-4" />
        <div className="flex flex-wrap wrap justify-center items-start gap-4">
          {(hasTariff ? [userTariff] : tariffs).map((tariff, index) => {
            return (
              <div
                className="p-4 lg:p-6 bg-white w-[100%] max-w-[387px]"
                style={{ maxWidth: 387, borderRadius: 20 }}
                key={tariff.id}
              >
                <div className="relative">
                  <p
                    style={{
                      fontSize: 22,
                      fontWeight: 600,
                      position: "relative",
                      zIndex: 2,
                      display: "inline-block",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        right: -10,
                        top: 0,
                        background: tariff.color,
                        width:
                          index === 0 ? "54%" : index === 1 ? "60%" : "46%",
                        height: 30,
                        zIndex: 1,
                      }}
                    />
                    <span
                      style={{
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      {tariff.title}
                    </span>
                  </p>
                </div>
                <div className="h-2"></div>
                <div className="flex items-end gap-2">
                  {tariff.oldPrice && (
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#C9C9C9",
                        textDecoration: "line-through",
                      }}
                    >
                      {tariff.oldPrice} ₽
                    </span>
                  )}
                  {tariff.price && (
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 600,
                        color: "#292929",
                      }}
                    >
                      {tariff.price} ₽
                    </span>
                  )}
                  {tariff.desc && (
                    <span
                      style={{
                        fontSize: 16,
                        fontWeight: 400,
                        color: "#292929",
                      }}
                    >
                      {tariff.desc}
                    </span>
                  )}
                </div>
                {!hasTariff ? (
                  <>
                    <div className="h-4"></div>
                    <Button
                      style={{ float: "right" }}
                      size="lg"
                      color="primary"
                      onClick={() =>
                        onClickTariff(tariff.type as TSubscribePeriod)
                      }
                    >
                      <span
                        style={{
                          fontSize: 14,
                          // fontWeight: 600,
                          lineHeight: "120%",
                          letterSpacing: 1,
                          textTransform: "uppercase",
                        }}
                      >
                        Подписаться
                      </span>
                    </Button>
                  </>
                ) : (
                  <SubscribeCancel />
                )}
              </div>
            );
          })}
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
        scrollBehavior="inside"
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
