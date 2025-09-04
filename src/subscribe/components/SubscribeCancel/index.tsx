import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import ErrorIcon from "@/assets/icons/error.svg";
import Image from "next/image";
import { checkResponse, fetchPostJson } from "@/api";

type TProps = {
  disableUppercase?: boolean;
};

export const SubscribeCancel: FC<disableUppercase> = ({
  disableUppercase = false,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);

  const cancelSub = useCallback(async () => {
    setLoading(true);
    const cancelRes = await fetchPostJson({
      path: "/subscription/cancel",
      isSecure: true,
    });

    const cancel = await cancelRes.json();
    window?.ym(103955671, "reachGoal", "subscribe-cancel");
    setLoading(false);
    checkResponse(cancel);
    setModalIsOpen(false);
  }, []);

  return (
    <>
      <Button
        style={{
          background: "transparent",
          color: "#C9C9C9",
          fontSize: 14,
          // fontWeight: 600,
          lineHeight: "120%",
          letterSpacing: 1,
          textTransform: disableUppercase ? "initial" : "uppercase",
          paddingLeft: 0,
        }}
        onClick={() => setModalIsOpen(true)}
      >
        Отменить подписку
      </Button>
      <Modal
        size="xl"
        isOpen={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
      >
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalBody>
            <p style={{ fontWeight: 500, fontSize: 22, textAlign: "center" }}>
              Вы уверены, что хотите отменить подписку?
            </p>
            <p style={{ fontWeight: 500, fontSize: 16, textAlign: "center" }}>
              Вы потеряете доступ к возможностям 2easy:
            </p>
            <div
              className="m-auto"
              style={{ color: "#ACACAC", fontWeight: 500 }}
            >
              <div className="flex gap-2 mb-2">
                <Image src={ErrorIcon} alt="error icon" />
                <span>доступ ко всем материалам 2easy</span>
              </div>
              <div className="flex gap-2 mb-2">
                <Image src={ErrorIcon} alt="error icon" />
                <span>создание уроков в конструкторе</span>
              </div>
              <div className="flex gap-2 mb-2">
                <Image src={ErrorIcon} alt="error icon" />
                <span>проведение уроков в режиме real-time</span>
              </div>
            </div>
            <div className="h-10" />
            <Button
              color="danger"
              onClick={cancelSub}
              variant="light"
              isLoading={isLoading}
            >
              Отменить подписку
            </Button>
            <Button color="primary" onClick={() => setModalIsOpen(false)}>
              Отмена
            </Button>
            <div className="h-4" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
