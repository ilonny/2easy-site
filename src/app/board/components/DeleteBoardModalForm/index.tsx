"use client";

import { checkResponse, fetchPostJson } from "@/api";
import { TBoard } from "@/app/board/types";
import { BOARD_FORM_MODAL_CLASS_NAMES } from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback } from "react";
import { T } from "@/i18n/T";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  board: TBoard;
};

export const DeleteBoardModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  board,
}) => {
  const onSubmit = useCallback(async () => {
    const res = await fetchPostJson({
      path: "/board/delete",
      isSecure: true,
      data: {
        id: board.id,
      },
    });
    const json = await res.json();
    if (json.success) {
      onSuccess();
    }
    checkResponse(json);
  }, [board.id, onSuccess]);

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      closeButton={<BoardCloseButton />}
      classNames={BOARD_FORM_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            <T k="boards.deleteConfirm" values={{ title: board.title }} />
          </p>
        </ModalHeader>
        <ModalBody>
          <Button color="danger" variant="light" onClick={onSubmit}>
            <T k="editor.confirmDelete" />
          </Button>
          <Button
            color="primary"
            className="w-full"
            onClick={() => setIsVisible(false)}
          >
            <T k="common.cancel" />
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
