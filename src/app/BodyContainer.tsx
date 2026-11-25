"use client";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { readFromLocalStorage, writeToLocalStorage } from "@/auth/utils";
import Close from "@/assets/icons/close.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import { OVERLAY_ABOVE_HEADER_Z_CLASS } from "@/constants/uiLayers";
import { fetchPostJson } from "@/api";

/** Dismissed ProgressMe/Edvibe transfer hint. Separate from the old survey key. */
const PM_TRANSFER_HINT_KEY = "pmTransferHintDismissed";

const isLoggedInTeacher = (profile: {
  role_id?: number | string;
  isStudent?: boolean;
  studentId?: number;
  login?: string;
  email?: string;
} | null | undefined) => {
  if (!profile || profile.isStudent || profile.studentId) return false;
  if (!profile.login && !profile.email) return false;
  const roleId = Number(profile.role_id);
  return roleId === 1 || roleId === 2;
};

export const BodyContainer: FC<any> = ({ children }) => {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const [hintDismissed, setHintDismissed] = useState(true);
  const [transferModal, setTransferModal] = useState(false);

  useEffect(() => {
    setHintDismissed(readFromLocalStorage(PM_TRANSFER_HINT_KEY) === "1");
  }, []);

  const trackHintEvent = useCallback((event: "open" | "dismiss") => {
    void fetchPostJson({
      path: "/pm-transfer-hint",
      isSecure: true,
      data: { event },
    }).catch(() => {});
  }, []);

  const dismissHint = useCallback(() => {
    writeToLocalStorage(PM_TRANSFER_HINT_KEY, "1");
    setHintDismissed(true);
    trackHintEvent("dismiss");
  }, [trackHintEvent]);

  const openTransferHint = useCallback(() => {
    writeToLocalStorage(PM_TRANSFER_HINT_KEY, "1");
    setHintDismissed(true);
    setTransferModal(true);
    trackHintEvent("open");
  }, [trackHintEvent]);

  const showTransferHint = isLoggedInTeacher(profile) && !hintDismissed;

  useEffect(() => {
    // Логика перенаправления для студентов
    if (
      profile?.isStudent &&
      !window?.location?.pathname?.includes("/lessons/") &&
      !window?.location?.pathname?.includes("/login") &&
      !window?.location?.pathname?.includes("/taboo") &&
      !window?.location?.pathname?.includes("course") &&
      !window?.location?.pathname?.includes("student-account") &&
      !window?.location?.pathname?.includes("/schedule") &&
      !window?.location?.pathname?.includes("/board")
    ) {
      router.push(`/student-account/${profile.studentId}`);
    }
  }, [profile?.isStudent, profile.studentId, router]);

  return (
    <>
      {children}
      {showTransferHint && (
        <div className="fixed bottom-4 left-4 right-auto z-[4] max-w-[min(320px,calc(100vw-2rem))] sm:bottom-6 sm:left-6 lg:bottom-[30px] lg:left-[30px]">
          <Button
            onPress={openTransferHint}
            color="primary"
            className="h-auto min-h-10 whitespace-normal px-4 py-3 text-left text-sm font-semibold leading-snug"
          >
            <T
              k="body.pmTransferHint"
              defaultText="Псс... перенесём ваши материалы с ProgressMe/Edvibe к нам"
            />
          </Button>
          <Image
            onClick={(e) => {
              e.stopPropagation();
              dismissHint();
            }}
            priority={false}
            src={Close}
            alt="close"
            style={{
              flexShrink: 0,
              position: "absolute",
              right: -10,
              top: -10,
              cursor: "pointer",
            }}
          />
        </div>
      )}
      <Modal
        size="lg"
        isOpen={transferModal}
        onClose={() => setTransferModal(false)}
        scrollBehavior="inside"
        classNames={{ wrapper: OVERLAY_ABOVE_HEADER_Z_CLASS }}
      >
        <ModalContent>
          <ModalHeader>
            <p>
              <T
                k="body.pmTransferTitle"
                defaultText="Перенесём материалы из ProgressMe и Edvibe"
              />
            </p>
          </ModalHeader>
          <ModalBody className="gap-4 pb-6 text-sm">
            <p>
              <T
                k="body.pmTransferLead"
                defaultText="Это можно сделать в разделе Lesson plans. Нажмите «Действия»."
              />
            </p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <T
                  k="body.pmTransferLesson"
                  defaultText="Отдельные уроки — «Создать урок», затем «Импортировать архив»."
                />
              </li>
              <li>
                <T
                  k="body.pmTransferCourse"
                  defaultText="Целый учебник — «Создать курс», затем «Импортировать архив»."
                />
              </li>
            </ul>
            <p>
              <T
                k="body.pmTransferHelp"
                defaultText="Подробная инструкция доступна по кнопке «?» на странице создания."
              />
            </p>
            <Button
              color="primary"
              className="w-full"
              onPress={() => {
                setTransferModal(false);
                router.push("/lesson_plans");
              }}
            >
              <T
                k="body.pmTransferOpen"
                defaultText="Открыть Lesson plans"
              />
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
