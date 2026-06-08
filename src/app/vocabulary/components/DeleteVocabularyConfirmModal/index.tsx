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

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onConfirm: () => void;
  count: number;
};

export const DeleteVocabularyConfirmModal: FC<TProps> = ({
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
    <Modal size="md" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>
            <T
              k="vocabulary.deleteConfirm"
              values={{ count }}
              defaultText="Удалить выбранные слова ({{count}})?"
            />
          </p>
        </ModalHeader>
        <ModalBody className="pb-6 flex flex-col gap-2">
          <Button color="danger" variant="light" onClick={handleConfirm}>
            <T k="editor.confirmDelete" />
          </Button>
          <Button color="primary" onClick={() => setIsVisible(false)}>
            <T k="common.cancel" />
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
