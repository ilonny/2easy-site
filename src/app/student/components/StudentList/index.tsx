import { ProfileEmptyLessons } from "@/app/lessons/components/ProfileEmptyLessons";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Checkbox,
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
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";

type TProps = {
  hideAddButton?: boolean;
  hidePopoverButton?: boolean;
  onClickStudent?: (id: number) => void;
  chosenIds?: number[];
  studentsList?: Array<Record<string, never>>;
  hideAccountButton?: boolean;
  onSuccessEditCallback?: () => void;
  onSuccessDeleteCallback?: () => void;
  btnSecondary?: boolean;
};

export const StudentList = (props: TProps) => {
  const {
    hideAddButton,
    hidePopoverButton,
    onClickStudent,
    chosenIds,
    studentsList,
    hideAccountButton,
    onSuccessEditCallback,
    onSuccessDeleteCallback,
    btnSecondary,
  } = props;
  const [createIsVisible, setCreateIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const { students, getStudents, deleteStudent } = useStudentList(studentsList);
  const [chosenStudent, setChosenStudent] = useState(null);
  const [popoverIsOpen, setPopoverIsOpen] = useState(false);
  const router = useRouter();

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
    if (onSuccessEditCallback) {
      onSuccessEditCallback();
    }
  }, [onSuccessEditCallback]);

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

  const { checkSubscription } = useCheckSubscription();
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
        <div
          className="w-[100%] max-w-[600px] gap-5 flex flex-wrap flex-col"
          style={{ cursor: "pointer" }}
        >
          {students?.map((student) => {
            const isChosen = chosenIds?.includes(student?.id);
            return (
              <div
                key={student.id}
                onClick={(e) => {
                  if (onClickStudent) {
                    onClickStudent(student?.id || 0);
                    return;
                  }
                  router.push("/student-account/" + student?.id);
                }}
              >
                <Card
                  radius="md"
                  className="p-4"
                  style={{ backgroundColor: isChosen ? "#eeebff" : "#fff" }}
                  shadow="none"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {onClickStudent && (
                        <div className="w-[50px] pl-2">
                          <Checkbox
                            isSelected={isChosen}
                            onChange={() => onClickStudent(student?.id || 0)}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <button
                          className={styles["header-profile-short-wrapper"]}
                          style={{ flexShrink: 0 }}
                        >
                          <p className={styles.title}>
                            {getShortName(student.name) || "A"}
                          </p>
                        </button>
                        <div className="">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold">{student.name}</p>
                            <p className="font-light">{student.email}</p>
                          </div>
                          {!!student.tag && (
                            <div className="flex items-center">
                              <p className="mt-4">
                                <Chip color="warning">
                                  <span className="text-white">
                                    {student.tag}
                                  </span>
                                </Chip>
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {!hidePopoverButton && (
                      <div>
                        <Popover
                          as="div"
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
                            {!hideAccountButton && (
                              <>
                                <Button
                                  fullWidth
                                  color="primary"
                                  onClick={() => {
                                    router.push(
                                      "/student-account/" + student?.id
                                    );
                                  }}
                                >
                                  В кабинет ученика →
                                </Button>
                                <div className="h-2" />
                              </>
                            )}
                            <Button
                              fullWidth
                              color="primary"
                              onClick={(e) => {
                                if (checkSubscription()) {
                                  e.preventDefault();
                                  setTimeout(() => {
                                    onPressCreateGroup(student);
                                  }, 100);
                                }
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
                                if (checkSubscription()) {
                                  onPressDelete(student);
                                }
                              }}
                            >
                              Удалить
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            );
          })}
          {!hideAddButton && (
            <Button
              radius="md"
              color="primary"
              variant={btnSecondary ? "bordered" : undefined}
              className="px-10"
              onClick={() => {
                if (checkSubscription()) {
                  onPressCreateGroup(null);
                }
              }}
              size="lg"
            >
              Добавить нового ученика
            </Button>
          )}
        </div>
      )}
      {/* <div className="h-10" /> */}
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
                  if (onSuccessDeleteCallback) {
                    onSuccessDeleteCallback();
                  }
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
