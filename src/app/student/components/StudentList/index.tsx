import { ProfileEmptyLessons } from "@/app/lessons/components/ProfileEmptyLessons";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Chip,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@nextui-org/react";
import { useStudentList } from "../../hooks/useStudentList";
import { CreateStudentModalForm } from "../CreateStudentModalForm";
import styles from "./styles.module.css";
import Image from "next/image";
import Ellipse from "@/assets/icons/ellipse.svg";

type TProps = {
  hideAddButton?: boolean;
  hidePopoverButton?: boolean;
  onClickStudent?: (id: number) => void;
};

export const StudentList = (props: TProps) => {
  const { hideAddButton, hidePopoverButton, onClickStudent } = props;
  const [createIsVisible, setCreateIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const { students, getStudents, deleteStudent } = useStudentList();
  const [chosenStudent, setChosenStudent] = useState(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);

  useEffect(() => {
    getStudents();
    setPopoverIsOpen(false);
  }, [createIsVisible, deleteIsVisible, getStudents]);

  const onPressCreateGroup = useCallback((student) => {
    setChosenStudent(student || {});
    setCreateIsVisible(true);
  }, []);

  const onSuccessCreate = useCallback(() => {
    setCreateIsVisible(false);
    setChosenStudent(null);
  }, []);

  const onPressDelete = useCallback((student) => {
    setChosenStudent(student || {});
    setDeleteIsVisible(true);
  }, []);

  const getShortName = (name) => {
    return name
      .split(" ")
      ?.map((l) => {
        return l[0] || "";
      })
      ?.slice(0, 2)
      ?.filter(Boolean);
  };

  return (
    <>
      {!students?.length && (
        <ProfileEmptyLessons
          title="У вас пока нет учеников"
          buttonTitle="Добавить"
          onButtonPress={onPressCreateGroup}
        />
      )}
      {!!students?.length && (
        <div className="max-w-[600px] gap-5 flex flex-wrap flex-col">
          {students?.map((student) => {
            return (
              <div
                key={student.id}
                onClick={() =>
                  onClickStudent && onClickStudent(student?.id || 0)
                }
              >
                <Card radius="md" className="p-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-4">
                        <button
                          className={styles["header-profile-short-wrapper"]}
                        >
                          <p className={styles.title}>
                            {getShortName(student.name) || "A"}
                          </p>
                        </button>
                        <div>
                          <p className="font-bold">{student.name}</p>
                          <p className="font-light">{student.email}</p>
                        </div>
                      </div>
                    </div>
                    {!hidePopoverButton && (
                      <div>
                        <Popover
                          color="foreground"
                          placement="bottom-end"
                          key={chosenStudent?.id}
                          // isOpen={popoverIsOpen}
                          // onOpenChange={(open) => setPopoverIsOpen(open)}
                        >
                          <PopoverTrigger>
                            <Button isIconOnly>
                              <Image src={Ellipse} alt="icon" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-white p-2">
                            <Button
                              fullWidth
                              color="primary"
                              onClick={() => {
                                onPressCreateGroup(student);
                              }}
                            >
                              Редактировать
                            </Button>
                            <div className="h-2" />
                            <Button
                              fullWidth
                              color="danger"
                              variant="light"
                              onClick={() => {
                                onPressDelete(student);
                              }}
                            >
                              Удалить
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                  {!!student.tag && (
                    <p className="mt-4">
                      <Chip color="warning">
                        <p className="text-white">{student.tag}</p>
                      </Chip>
                    </p>
                  )}
                </Card>
              </div>
            );
          })}
          {!hideAddButton && (
            <Button
              radius="md"
              color="primary"
              className="px-10"
              onClick={() => onPressCreateGroup(null)}
              size="lg"
            >
              Добавить ученика
            </Button>
          )}
        </div>
      )}
      <div className="h-10" />
      <CreateStudentModalForm
        key={chosenStudent?.id}
        chosenStudent={chosenStudent}
        isVisible={createIsVisible}
        onSuccess={onSuccessCreate}
        setIsVisible={setCreateIsVisible}
      />
      <Modal
        size="xl"
        isOpen={deleteIsVisible}
        onClose={() => setDeleteIsVisible(false)}
      >
        <ModalContent>
          <ModalHeader>
            <p>{"Удалить ученика" + " " + chosenStudent?.name + "?"}</p>
          </ModalHeader>
          <ModalBody>
            <Button
              color="danger"
              variant="light"
              onClick={() => {
                deleteStudent(chosenStudent.id).then(() => {
                  setDeleteIsVisible(false);
                  setChosenStudent(null);
                });
              }}
            >
              Да, удалить
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
