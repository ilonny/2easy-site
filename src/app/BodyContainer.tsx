"use client";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import { FC, useCallback, useContext, useEffect, useState } from "react";
import { useCheckSubscription } from "./subscription/helpers";
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

export const BodyContainer: FC<any> = ({ children }) => {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const { checkSubscription, subscription } = useCheckSubscription();
  const [isShowSurvey, setSurvey] = useState(
    !readFromLocalStorage("isSurveyShowed"),
  );

  const closeSurvey = useCallback(() => {
    writeToLocalStorage("isSurveyShowed", "1");
    setSurvey(false);
  }, []);

  const [surveyModal, setSurveyModal] = useState(false);

  useEffect(() => {
    // Логика перенаправления для студентов
    if (
      profile?.isStudent &&
      !window?.location?.pathname?.includes("/lessons/") &&
      !window?.location?.pathname?.includes("/login") &&
      !window?.location?.pathname?.includes("/taboo") &&
      !window?.location?.pathname?.includes("course") &&
      !window?.location?.pathname?.includes("student-account")
    ) {
      router.push(`/student-account/${profile.studentId}`);
    }
  }, [profile?.isStudent, profile.studentId, router]);

  return (
    <>
      {children}
      {subscription && subscription?.subscribe_type_id && isShowSurvey && (
        <div
          style={{
            position: "fixed",
            bottom: 30,
            left: 30,
          }}
        >
          <Button onClick={() => setSurveyModal(true)} color="primary">
            Открыть опрос
          </Button>
          <Image
            onClick={(e) => {
              e.stopPropagation();
              closeSurvey();
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
        size="4xl"
        isOpen={surveyModal}
        onClose={() => {
          setSurveyModal(false);
          closeSurvey();
        }}
        scrollBehavior="outside"
      >
        <ModalContent>
          <ModalHeader className="justify-center">
            <p className="text-center">Поделитесь вашим мнением</p>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-wrap justify-start">
              <iframe
                width="100%"
                height="600px"
                src="https://a46253.webask.io/8j5h7hbg4"
              ></iframe>
            </div>
            <div className="h-4" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
