import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Radio,
  RadioGroup,
  Textarea,
} from "@nextui-org/react";
import { FC, useCallback, useState } from "react";
import { checkResponse, fetchPostJson } from "@/api";

const CANCEL_REASONS = [
  { value: "other_platforms", label: "использую другие платформы для работы" },
  {
    value: "few_materials",
    label: "мало новых уроков и материалов",
  },
  {
    value: "inconvenient",
    label: "неудобно проводить уроки на платформе",
  },
  {
    value: "quality",
    label: "не нравится качество материалов",
  },
  {
    value: "expensive",
    label: "слишком дорогая подписка",
  },
  { value: "other", label: "другая причина" },
] as const;

type TProps = {
  disableUppercase?: boolean;
};

export const SubscribeCancel: FC<TProps> = ({
  disableUppercase = false,
}) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [otherReasonText, setOtherReasonText] = useState("");

  const resetForm = useCallback(() => {
    setSelectedReason("");
    setOtherReasonText("");
  }, []);

  const closeModal = useCallback(() => {
    setModalIsOpen(false);
    resetForm();
  }, [resetForm]);

  const cancelSub = useCallback(async () => {
    setLoading(true);
    const reasonLabel =
      CANCEL_REASONS.find((r) => r.value === selectedReason)?.label || selectedReason;
    const reasonText =
      selectedReason === "other"
        ? `${reasonLabel}${otherReasonText ? `: ${otherReasonText}` : ""}`
        : reasonLabel || "не указана";

    const cancelRes = await fetchPostJson({
      path: "/subscription/cancel",
      isSecure: true,
      data: { cancelReason: reasonText },
    });

    const cancel = await cancelRes.json();
    window?.ym(103955671, "reachGoal", "subscribe-cancel");
    setLoading(false);
    checkResponse(cancel);
    closeModal();
  }, [selectedReason, otherReasonText, closeModal]);

  return (
    <>
      <Button
        style={{
          background: "transparent",
          color: "#C9C9C9",
          fontSize: 14,
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
        onClose={closeModal}
        classNames={{
          base: "max-w-[600px]",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1 pt-6 pb-2">
            <p
              className="text-center text-xl font-medium"
              style={{ fontWeight: 500, fontSize: 22 }}
            >
              Поделитесь, почему вы решили отменить подписку
            </p>
            <p
              className="text-center text-default-500"
              style={{ fontSize: 14, marginTop: 4 }}
            >
              It&apos;s very valuable to us.
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              classNames={{ wrapper: "gap-2" }}
            >
              {CANCEL_REASONS.map((reason) => (
                <Radio
                  key={reason.value}
                  value={reason.value}
                  classNames={{
                    base: "m-0 p-3 rounded-lg border border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
                    label: "font-medium",
                  }}
                >
                  {reason.label}
                </Radio>
              ))}
            </RadioGroup>

            {selectedReason === "other" && (
              <Textarea
                placeholder="Расскажете о ней подробнее?"
                value={otherReasonText}
                onValueChange={setOtherReasonText}
                minRows={3}
                classNames={{
                  base: "mt-2",
                }}
              />
            )}

            <div className="flex gap-3 mt-6">
              <Button
                color="default"
                variant="flat"
                onClick={cancelSub}
                isLoading={isLoading}
                className="flex-1"
                style={{
                  backgroundColor: "#6B7280",
                  color: "white",
                }}
              >
                Отменить подписку
              </Button>
              <Button
                color="primary"
                onClick={closeModal}
                className="flex-1"
              >
                Остаться с 2EASY
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
