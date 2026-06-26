"use client";

import { FC, useCallback } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { T } from "@/i18n/T";
import {
  DICTIONARY_CONFIRM_MODAL_CLASS_NAMES,
  DICTIONARY_CONFIRM_MODAL_TITLE_CLASS,
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onConfirm: () => void;
  count: number;
};

export const DeleteDictionaryConfirmModal: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onConfirm,
  count,
}) => {
  const handleConfirm = useCallback(async () => {
    await onConfirm();
    setIsVisible(false);
  }, [onConfirm, setIsVisible]);

  return (
    <Modal
      size="md"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="inside"
      placement="center"
      classNames={DICTIONARY_CONFIRM_MODAL_CLASS_NAMES}
    >
      <ModalContent className={DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS}>
        <ModalHeader className={DICTIONARY_MODAL_SECTION_PADDING_CLASS}>
          <p className={DICTIONARY_CONFIRM_MODAL_TITLE_CLASS}>
            <T
              k="dictionary.deleteConfirm"
              values={{ count }}
              defaultText="Удалить выбранные слова ({{count}})?"
            />
          </p>
        </ModalHeader>
        <ModalBody className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-6 flex flex-col gap-2`}>
          <Button
            color="danger"
            variant="light"
            size="md"
            className={DICTIONARY_TOUCH_BUTTON_CLASS}
            onClick={handleConfirm}
          >
            <T k="common.delete" defaultText="Удалить" />
          </Button>
          <Button
            color="primary"
            size="md"
            className={DICTIONARY_TOUCH_BUTTON_CLASS}
            onClick={() => setIsVisible(false)}
          >
            <T k="common.cancel" />
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
