"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { startBoardSession } from "@/app/board/api/boardSession";
import { TBoard } from "@/app/board/types";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AttachBoardModalForm } from "../AttachBoardModalForm";
import { Button } from "@nextui-org/react";
import { T } from "@/i18n/T";

type TProps = {
  board: TBoard;
  className?: string;
};

export const StartBoardButton: React.FC<TProps> = ({ board, className }) => {
  const router = useRouter();
  const { checkSubscription } = useCheckSubscription();
  const [modalVisible, setModalVisible] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const navigateToBoard = useCallback(() => {
    router.push(`/boards/${board.id}`);
  }, [board.id, router]);

  const startSessionAndNavigate = useCallback(async () => {
    setIsStarting(true);
    try {
      await startBoardSession(board.id);
    } finally {
      setIsStarting(false);
    }
    navigateToBoard();
  }, [board.id, navigateToBoard]);

  const onPressButton = useCallback(
    (event: React.MouseEvent) => {
      event.stopPropagation();
      if (!checkSubscription()) {
        return;
      }
      setModalVisible(true);
    },
    [checkSubscription],
  );

  return (
    <>
      <Button
        color="primary"
        className={className || "w-full"}
        size="md"
        isLoading={isStarting}
        onClick={onPressButton}
      >
        <T k="boards.startBoardLesson" />
      </Button>
      <AttachBoardModalForm
        isVisible={modalVisible}
        setIsVisible={setModalVisible}
        skipChoseStatus
        hideToast
        title={<T k="boards.chooseStudentsToStart" />}
        board={board}
        onSuccess={() => {
          setModalVisible(false);
          void startSessionAndNavigate();
        }}
      />
    </>
  );
};
