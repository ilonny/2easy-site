import { ProfileEmptyLessons } from "@/app/lessons/components/ProfileEmptyLessons";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Checkbox,
  Chip,
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
import Image from "next/image";
import Ellipse from "@/assets/icons/ellipse.svg";
import { useRouter } from "next/navigation";
import { useCheckSubscription } from "@/app/subscription/helpers";
import { T } from "@/i18n/T";
import { UserAvatar } from "@/components/UserAvatar";
import { StudentPasswordReveal } from "../StudentPasswordReveal";
import { brandModalClassNames } from "@/components/brandUi";

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
  /** Show active/archive toggle (profile list only; pickers stay active-only). */
  showArchiveToggle?: boolean;
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
    showArchiveToggle = false,
  } = props;
  const [createIsVisible, setCreateIsVisible] = useState(false);
  const [deleteIsVisible, setDeleteIsVisible] = useState(false);
  const [archiveConfirmVisible, setArchiveConfirmVisible] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const { students, getStudents, deleteStudent, setStudentArchived } =
    useStudentList(studentsList, {
      archived: showArchiveToggle ? showArchived : false,
    });
  const [chosenStudent, setChosenStudent] = useState(null);
  const router = useRouter();

  useEffect(() => {
    getStudents();
  }, [createIsVisible, deleteIsVisible, archiveConfirmVisible, getStudents]);

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

  const onPressArchiveToggle = useCallback((student) => {
    setChosenStudent(student || {});
    setArchiveConfirmVisible(true);
  }, []);

  const { checkSubscription } = useCheckSubscription();
  const isPicker = Boolean(onClickStudent);

  return (
    <>
      {showArchiveToggle && !isPicker && (
        <div className="mx-auto mb-4 flex w-full max-w-[600px] gap-2">
          <Button
            radius="full"
            color="primary"
            variant={!showArchived ? "solid" : "bordered"}
            onClick={() => setShowArchived(false)}
            size="sm"
          >
            <T k="students.activeTab" />
          </Button>
          <Button
            radius="full"
            color="primary"
            variant={showArchived ? "solid" : "bordered"}
            onClick={() => setShowArchived(true)}
            size="sm"
          >
            <T k="students.archivedTab" />
          </Button>
        </div>
      )}
      {!students?.length && (
        <ProfileEmptyLessons
          title={
            showArchived ? (
              <T k="students.noArchivedStudents" />
            ) : (
              <T k="students.noStudents" />
            )
          }
          buttonTitle={<T k="students.add" />}
          onButtonPress={() => onPressCreateGroup(null)}
          hideButton={showArchived}
        />
      )}
      {!!students?.length && (
        <div className="mx-auto flex w-full max-w-[600px] cursor-pointer flex-col flex-wrap gap-3">
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
                <div
                  className={`rounded-[20px] p-4 transition-colors lg:rounded-[24px] ${
                    isChosen
                      ? "bg-[#F0EDFD]"
                      : "bg-brand-gray hover:bg-[#e6e6ea]"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      {onClickStudent && (
                        <div className="w-[50px] pl-2">
                          <Checkbox
                            isSelected={isChosen}
                            classNames={{ base: "pointer-events-none" }}
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <UserAvatar
                          name={student.name}
                          avatar={student.avatar}
                          size={48}
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold">{student.name}</p>
                            <p className="font-light">{student.email}</p>
                          </div>
                          {!!student.tag && (
                            <div className="mt-2 flex items-center">
                              <Chip color="warning">
                                <span className="text-white">{student.tag}</span>
                              </Chip>
                            </div>
                          )}
                          {!hidePopoverButton && !onClickStudent && (
                            <StudentPasswordReveal studentId={student.id} />
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
                        >
                          <PopoverTrigger>
                            <Button
                              isIconOnly
                              className="rounded-[14px] bg-brand-black/40 text-white backdrop-blur-md hover:!bg-brand-black/55"
                              onClick={(e) => e.stopPropagation()}
                            >
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
                                      "/student-account/" + student?.id,
                                    );
                                  }}
                                >
                                  <T k="students.toStudentCabinet" />
                                </Button>
                                <div className="h-2" />
                              </>
                            )}
                            {!showArchived && (
                              <>
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
                                  <T k="lessons.edit" />
                                </Button>
                                <div className="h-2" />
                              </>
                            )}
                            <Button
                              fullWidth
                              color="primary"
                              variant="bordered"
                              onClick={() => {
                                if (checkSubscription()) {
                                  onPressArchiveToggle(student);
                                }
                              }}
                            >
                              {showArchived ? (
                                <T k="students.unarchive" />
                              ) : (
                                <T k="students.archive" />
                              )}
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
                              <T k="common.delete" />
                            </Button>
                          </PopoverContent>
                        </Popover>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {!hideAddButton && !showArchived && (
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
              <T k="students.addNewStudent" />
            </Button>
          )}
        </div>
      )}
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
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <p>
              <T
                k="students.deleteStudentConfirm"
                values={{ name: chosenStudent?.name || "" }}
              />
            </p>
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
              <T k="editor.confirmDelete" />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        size="xl"
        isOpen={archiveConfirmVisible}
        onClose={() => setArchiveConfirmVisible(false)}
        classNames={brandModalClassNames}
      >
        <ModalContent>
          <ModalHeader>
            <p>
              {showArchived ? (
                <T
                  k="students.unarchiveStudentConfirm"
                  values={{ name: chosenStudent?.name || "" }}
                />
              ) : (
                <T
                  k="students.archiveStudentConfirm"
                  values={{ name: chosenStudent?.name || "" }}
                />
              )}
            </p>
          </ModalHeader>
          <ModalBody>
            {!showArchived && (
              <p className="mb-3 text-sm text-default-500">
                <T k="students.archiveStudentHint" />
              </p>
            )}
            <Button
              color="primary"
              onClick={() => {
                setStudentArchived(chosenStudent.id, !showArchived).then(
                  () => {
                    setArchiveConfirmVisible(false);
                    setChosenStudent(null);
                    getStudents();
                    if (onSuccessDeleteCallback) {
                      onSuccessDeleteCallback();
                    }
                  },
                );
              }}
            >
              {showArchived ? (
                <T k="students.unarchive" />
              ) : (
                <T k="students.archive" />
              )}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
