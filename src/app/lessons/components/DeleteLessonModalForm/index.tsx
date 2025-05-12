import { checkResponse, fetchPostJson } from "@/api";
import { ImageUpload } from "@/components/ImageUpload";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Tag, TagInput } from "emblor";
import { FC, useCallback, useState } from "react";
import { Controller } from "react-hook-form";
import { TLesson } from "../../types";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
};

export const DeleteLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lesson,
}) => {
  const onSubmit = useCallback(async () => {
    const lessonRes = await fetchPostJson({
      path: "/lesson/delete-lesson",
      isSecure: true,
      data: {
        id: lesson.id,
      },
    });
    const lessonResJson = await lessonRes.json();
    if (lessonResJson.success) {
      onSuccess();
    }
    checkResponse(lessonResJson);
  }, [onSuccess, lesson]);

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>{"Удалить урок " + lesson.title + "?"}</p>
        </ModalHeader>
        <ModalBody>
          <div className="flex gap-4">
            <Button
              color="danger"
              className="w-full"
              size="lg"
              onClick={onSubmit}
            >
              Подтвердить
            </Button>
            <Button
              color="secondary"
              className="w-full"
              size="lg"
              onClick={() => setIsVisible(false)}
            >
              Отменить
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
