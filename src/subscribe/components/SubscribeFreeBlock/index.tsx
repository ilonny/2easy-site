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

export const SubscribeFreeBlock = () => {
  const [modalIsOpen, setModalIsOpened] = useState(false);
  return (
    <div className="w-[100%] lg:w-[771px] border-pinkSecondary border-3 rounded-[13px] overflow-hidden relative m-auto">
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
    </div>
  );
};
