"use client";
import { Panel } from "@/ui";
import Bg from "@/assets/images/start_registration_bg.png";
import CheckedIcon from "@/assets/icons/checked.svg";
import Image from "next/image";
import { useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { RegistrationForm } from "@/app/registration";
import SubscribeGreenImage from "@/assets/images/subscribe_green.png";
import CardIcon from "@/assets/icons/card.svg";

export const SubscribeFreeBlock = () => {
  const [modalIsOpen, setModalIsOpened] = useState(false);
  return (
    <>
      <div
        className="p-4 lg:p-10 flex flex-col justify-between flex-1 gap-4"
        style={{
          width: "100%",
          minHeight: 318,
          maxWidth: 793,
          background: `url(${SubscribeGreenImage.src}) center center no-repeat`,
          backgroundSize: "cover",
          margin: "auto",
          borderRadius: 20,
        }}
      >
        <div>
          <p
            style={{
              maxWidth: 482,
              fontWeight: 600,
              fontSize: 22,
              lineHeight: "120%",
              color: "#292929",
            }}
          >
            Еще не пользовались 2easy?
          </p>
          <div className="h-4" />
          <div style={{ maxWidth: 570 }}>
            <p>Начните с бесплатного пробного периода.</p>
            <p className="mt-2">
              У вас будет 3 дня доступа к конструктору уроков и части материалов
              -- это позволит познакомиться с платформой перед оформлением
              подписки.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-block">
            <div
              className="py-2 px-4 flex items-center gap-2"
              style={{
                background: "rgba(255, 255, 255, 0.3)",
                borderRadius: 100,
                fontSize: 14,
              }}
            >
              <Image src={CardIcon} alt="card icon" />
              <p>Не нужно вводить данные карты</p>
            </div>
          </div>
          <Button
            onClick={() => setModalIsOpened(true)}
            style={{ backgroundColor: "#D2FF88" }}
            className="uppercase"
            size="lg"
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                lineHeight: "120%",
                letterSpacing: 1,
              }}
            >
              Начать бесплатно
            </span>
          </Button>
        </div>
      </div>
      <Modal
        size="lg"
        isOpen={modalIsOpen}
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
    </>
  );
};
