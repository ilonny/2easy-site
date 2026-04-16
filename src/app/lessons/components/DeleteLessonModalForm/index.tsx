import { checkResponse, fetchPostJson } from "@/api";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { FC, useCallback } from "react";
import { TLesson } from "../../types";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";

type TProps = {
  isVisible: boolean;
  setIsVisible: (val: boolean) => void;
  onSuccess: () => void;
  lesson: TLesson;
  isCourses?: boolean;
};

export const DeleteLessonModalForm: FC<TProps> = ({
  isVisible,
  setIsVisible,
  onSuccess,
  lesson,
  isCourses,
}) => {
  const onSubmit = useCallback(async () => {
    const lessonRes = await fetchPostJson({
      path: isCourses ? "/course/delete" : "/lesson/delete-lesson",
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
  }, [isCourses, lesson.id, onSuccess]);

  return (
    <Modal size="xl" isOpen={isVisible} onClose={() => setIsVisible(false)}>
      <ModalContent>
        <ModalHeader>
          <p>
            <T
              k="lessons.deleteLessonConfirm"
              values={{
                type: isCourses
                  ? i18n.t("lessons.course")
                  : i18n.t("lessons.lesson"),
                title: lesson.title,
              }}
            />
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
