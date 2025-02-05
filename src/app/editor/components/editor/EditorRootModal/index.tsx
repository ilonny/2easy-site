import { FC, useMemo, useState } from "react";
import { TTemplate } from "../../create/ChooseTemplateModal/templates";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/react";
import { mapTypeToTitle } from "../mappers";
import { ImageEx } from "../ImageEx";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  type?: TTemplate["type"];
  onBack?: () => void;
  id?: number;
};

export const EditorRootModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  type,
  id,
  onBack,
}) => {
  const EditorComponent = useMemo(() => {
    switch (type) {
      case "image":
        return ImageEx;
      default:
    }
  }, [type]);

  return (
    <Modal
      size="4xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      style={{ background: "#F9F9F9" }}
    >
      <ModalContent>
        <ModalHeader className="justify-center">
          <div>{mapTypeToTitle(type)}</div>
          {!id && (
            <div
              onClick={() => onBack && onBack()}
              className="font-light absolute left-4 text-small top-5"
              style={{ cursor: "pointer" }}
            >
              {"<- другие шаблоны"}
            </div>
          )}
        </ModalHeader>
        <ModalBody>{!!EditorComponent && <EditorComponent />}</ModalBody>
      </ModalContent>
    </Modal>
  );
};
