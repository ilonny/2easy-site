"use client";

import { FC, useCallback, useState } from "react";
import Image from "next/image";
import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";
import RefreshIcon from "@/assets/icons/refresh.svg";
import { checkResponse, fetchPostJson } from "@/api";
import { T } from "@/i18n/T";
import { useParams } from "next/navigation";

type TProps = {
  exId: number;
  lessonId?: number;
  exerciseTitle: string;
  studentId: number;
  onSuccess?: () => void;
};

export const ResetAnswersControl: FC<TProps> = ({
  exId,
  lessonId: lessonIdProp,
  exerciseTitle,
  studentId,
  onSuccess,
}) => {
  const paramsId = useParams()?.id;
  const lesson_id = lessonIdProp || Number(paramsId);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onConfirm = useCallback(async () => {
    if (!lesson_id || !exId || !studentId) {
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetchPostJson({
        path: "/answer/reset",
        isSecure: true,
        data: {
          lesson_id: Number(lesson_id),
          ex_id: exId,
          student_id: studentId,
        },
      });
      const data = await res.json();
      checkResponse(data);
      if (data?.success) {
        setModalOpen(false);
        onSuccess?.();
      }
    } finally {
      setIsLoading(false);
    }
  }, [lesson_id, exId, studentId, onSuccess]);

  return (
    <>
      <div className="absolute right-3 bottom-3 z-[1] sm:right-5 sm:bottom-4">
        <Button
          variant="light"
          className="text-default-foreground gap-2 bg-white shadow-sm"
          style={{ fontSize: 14 }}
          onPress={() => setModalOpen(true)}
          startContent={
            <Image src={RefreshIcon} alt="" width={16} height={16} />
          }
        >
          <T k="lessons.resetAnswers" />
        </Button>
      </div>

      <Modal
        size="lg"
        isOpen={modalOpen}
        onClose={() => {
          if (!isLoading) {
            setModalOpen(false);
          }
        }}
      >
        <ModalContent>
          <ModalHeader>
            <p>
              <T
                k="lessons.resetAnswersConfirm"
                values={{ title: exerciseTitle }}
              />
            </p>
          </ModalHeader>
          <ModalFooter className="gap-2">
            <Button
              variant="light"
              isDisabled={isLoading}
              onPress={() => setModalOpen(false)}
            >
              <T k="lessons.resetAnswersCancel" />
            </Button>
            <Button
              color="primary"
              isLoading={isLoading}
              onPress={onConfirm}
            >
              <T k="common.confirm" />
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
