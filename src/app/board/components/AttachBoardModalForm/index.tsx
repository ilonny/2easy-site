"use client";

import { checkResponse, fetchPostJson } from "@/api";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { FC, useCallback, useEffect, useState } from "react";
import { TBoard } from "@/app/board/types";
import { BOARD_FORM_MODAL_CLASS_NAMES } from "@/app/board/constants";
import { BoardCloseButton } from "@/app/board/components/BoardCloseButton";
import { StudentList } from "@/app/student/components/StudentList";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import type { ReactNode } from "react";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  board: TBoard;
  skipChoseStatus?: boolean;
  title?: ReactNode;
  hideToast?: boolean;
};

export const AttachBoardModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  board,
  skipChoseStatus,
  title,
  hideToast,
}) => {
  const isRu = (i18n.language || "").toLowerCase().startsWith("ru");
  const boardOpenText = i18n.t("boards.boardOpen", {
    defaultValue: isRu ? "Доска открыта" : "Board is open",
  });
  const boardClosedText = i18n.t("boards.boardClosed", {
    defaultValue: isRu ? "Доска закрыта" : "Board is closed",
  });

  const [chosenIds, setChosenIds] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [status, setStatus] = useState<"open" | "close">("open");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    const allRes = await Promise.all(
      chosenIds.map(async (student_id) => {
        const res = await fetchPostJson({
          path: "/board-relation/create",
          isSecure: true,
          data: {
            board_id: board.id,
            student_id,
            status,
          },
        });
        return await res.json();
      }),
    );
    setIsLoading(false);
    if (!hideToast) {
      allRes.forEach((res) => {
        checkResponse(res);
      });
    }
    onSuccess();
  }, [board.id, chosenIds, hideToast, onSuccess, status]);

  const onClickStudent = useCallback(
    (id: number) => {
      if (chosenIds?.includes(id)) {
        setChosenIds((ids) => ids?.filter((i) => i !== id));
        return;
      }
      setChosenIds((ids) => ids?.concat(id));
    },
    [chosenIds],
  );

  useEffect(() => {
    if (!isVisible) {
      setChosenIds([]);
      setStep(0);
    }
  }, [isVisible]);

  return (
    <Modal
      size="xl"
      isOpen={isVisible}
      onClose={() => setIsVisible(false)}
      scrollBehavior="outside"
      style={{ backgroundColor: "#F9F9F9" }}
      closeButton={<BoardCloseButton />}
      classNames={BOARD_FORM_MODAL_CLASS_NAMES}
    >
      <ModalContent>
        <ModalHeader>
          <p>
            {step === 0 ? (
              title ?? <T k="boards.attachSelectStudents" />
            ) : (
              <T k="boards.attachStatus" />
            )}
          </p>
        </ModalHeader>
        <ModalBody>
          {step === 0 && (
            <>
              <StudentList
                btnSecondary
                hidePopoverButton
                onClickStudent={onClickStudent}
                chosenIds={chosenIds}
              />
              <Button
                disabled={!chosenIds?.length}
                size="lg"
                color={!chosenIds?.length ? "default" : "primary"}
                className="w-full"
                isLoading={isLoading}
                onClick={() => {
                  if (skipChoseStatus) {
                    void onSubmit();
                  } else {
                    setStep(1);
                  }
                }}
              >
                {skipChoseStatus ? (
                  <T k="boards.startBoardLesson" />
                ) : (
                  <T k="modals.next" />
                )}
              </Button>
            </>
          )}
          {step === 1 && (
            <>
              <Select
                defaultSelectedKeys={[status]}
                size="lg"
                placeholder={i18n.t("boards.selectBoardStatus")}
                onChange={(e) => setStatus(e.target.value as "open" | "close")}
              >
                <SelectItem key="open" textValue={boardOpenText}>
                  <T k="boards.boardOpen" defaultText="Доска открыта" />
                </SelectItem>
                <SelectItem key="close" textValue={boardClosedText}>
                  <T k="boards.boardClosed" defaultText="Доска закрыта" />
                </SelectItem>
              </Select>
              <div className="h-4" />
              <Button
                size="lg"
                color="primary"
                className="w-full"
                isLoading={isLoading}
                onClick={() => void onSubmit()}
              >
                <T k="modals.attachButton" />
              </Button>
              <Button
                size="lg"
                variant="light"
                color="primary"
                className="w-full"
                onClick={() => setStep(0)}
              >
                <T k="common.back" />
              </Button>
            </>
          )}
          <div className="h-4" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
