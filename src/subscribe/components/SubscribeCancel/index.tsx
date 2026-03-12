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
import { useTranslation } from "react-i18next";
import { checkResponse, fetchPostJson } from "@/api";

const CANCEL_REASON_KEYS = [
  "other_platforms",
  "few_materials",
  "inconvenient",
  "quality",
  "expensive",
  "other",
] as const;

type TProps = {
  disableUppercase?: boolean;
};

const REASON_KEY_MAP: Record<(typeof CANCEL_REASON_KEYS)[number], string> = {
  other_platforms: "subscriptionCancel.reasonOtherPlatforms",
  few_materials: "subscriptionCancel.reasonFewMaterials",
  inconvenient: "subscriptionCancel.reasonInconvenient",
  quality: "subscriptionCancel.reasonQuality",
  expensive: "subscriptionCancel.reasonExpensive",
  other: "subscriptionCancel.reasonOther",
};

export const SubscribeCancel: FC<TProps> = ({
  disableUppercase = false,
}) => {
  const { t } = useTranslation();
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
    const reasonLabel = REASON_KEY_MAP[selectedReason as (typeof CANCEL_REASON_KEYS)[number]]
      ? t(REASON_KEY_MAP[selectedReason as (typeof CANCEL_REASON_KEYS)[number]])
      : selectedReason;
    const reasonText =
      selectedReason === "other"
        ? `${reasonLabel}${otherReasonText ? `: ${otherReasonText}` : ""}`
        : reasonLabel || t("subscriptionCancel.reasonNotSpecified");

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
  }, [selectedReason, otherReasonText, closeModal, t]);

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
        {t("subscriptionCancel.cancelButton")}
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
              {t("subscriptionCancel.shareWhyTitle")}
            </p>
            <p
              className="text-center text-default-500"
              style={{ fontSize: 14, marginTop: 4 }}
            >
              {t("subscriptionCancel.itsValuable")}
            </p>
          </ModalHeader>
          <ModalBody className="pb-6">
            <RadioGroup
              value={selectedReason}
              onValueChange={setSelectedReason}
              classNames={{ wrapper: "gap-2" }}
            >
              {CANCEL_REASON_KEYS.map((key) => (
                <Radio
                  key={key}
                  value={key}
                  classNames={{
                    base: "m-0 p-3 rounded-lg border border-default-200 data-[selected=true]:border-primary data-[selected=true]:bg-primary-50",
                    label: "font-medium",
                  }}
                >
                  {t(REASON_KEY_MAP[key])}
                </Radio>
              ))}
            </RadioGroup>

            {selectedReason === "other" && (
              <Textarea
                placeholder={t("subscriptionCancel.placeholderOther")}
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
                {t("subscriptionCancel.cancelButton")}
              </Button>
              <Button
                color="primary"
                onClick={closeModal}
                className="flex-1"
              >
                {t("subscriptionCancel.stayWith2Easy")}
              </Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
