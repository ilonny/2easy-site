"use client";

import { useCallback, useState } from "react";
import { startBoardSession } from "@/app/board/api/boardSession";
import { TBoard } from "@/app/board/types";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { AttachBoardModalForm } from "../AttachBoardModalForm";
import { Button } from "@nextui-org/react";
import { T } from "@/i18n/T";

type TProps = {
  board: TBoard;
  onLessonStarted: () => void;
};

export const BoardStartLessonButton: React.FC<TProps> = ({
  board,
  onLessonStarted,
}) => {
  const { checkSubscription } = useCheckSubscription();
  const [modalVisible, setModalVisible] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const startLesson = useCallback(async () => {
    setIsStarting(true);
    try {
      await startBoardSession(board.id);
      onLessonStarted();
    } finally {
      setIsStarting(false);
    }
  }, [board.id, onLessonStarted]);

  const onPressButton = useCallback(() => {
    if (!checkSubscription()) {
      return;
    }
    setModalVisible(true);
  }, [checkSubscription]);

  return (
    <>
      <Button
        color="primary"
        size="sm"
        className="shrink-0"
        isLoading={isStarting}
        onPress={onPressButton}
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
          void startLesson();
        }}
      />
    </>
  );
};
