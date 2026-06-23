"use client";

import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { getDictionaryOnboardingSlides } from "../../dictionaryOnboardingData";
import {
  DICTIONARY_MODAL_SECTION_PADDING_CLASS,
  DICTIONARY_ONBOARDING_ACTIONS_CLASS,
  DICTIONARY_ONBOARDING_DESCRIPTION_CLASS,
  DICTIONARY_ONBOARDING_IMAGE_CLASS,
  DICTIONARY_ONBOARDING_IMAGE_SLOT_CLASS,
  DICTIONARY_ONBOARDING_MODAL_CLASS_NAMES,
  DICTIONARY_ONBOARDING_STEP_COUNTER_CLASS,
  DICTIONARY_ONBOARDING_TITLE_CLASS,
  DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS,
  DICTIONARY_TOUCH_BUTTON_CLASS,
} from "../../constants";

type TProps = {
  isOpen: boolean;
  isTeacher: boolean;
  onComplete: () => void;
};

export const DictionaryOnboardingModal: FC<TProps> = ({
  isOpen,
  isTeacher,
  onComplete,
}) => {
  const { i18n: i18nInstance } = useTranslation();
  const language = i18nInstance.resolvedLanguage || i18nInstance.language;

  const slides = useMemo(
    () => getDictionaryOnboardingSlides(isTeacher, language),
    [isTeacher, language]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  const activeSlide = slides[activeIndex];
  const isFirstSlide = activeIndex === 0;
  const isLastSlide = activeIndex >= slides.length - 1;

  const handleClose = () => {
    setActiveIndex(0);
    onComplete();
  };

  const handlePrimaryAction = () => {
    if (isLastSlide) {
      handleClose();
      return;
    }

    setActiveIndex((index) => Math.min(index + 1, slides.length - 1));
  };

  const handleBack = () => {
    setActiveIndex((index) => Math.max(index - 1, 0));
  };

  if (!activeSlide) {
    return null;
  }

  return (
    <Modal
      size="2xl"
      isOpen={isOpen}
      onClose={handleClose}
      scrollBehavior="inside"
      placement="center"
      isDismissable={false}
      hideCloseButton
      classNames={DICTIONARY_ONBOARDING_MODAL_CLASS_NAMES}
    >
      <ModalContent className={DICTIONARY_SECONDARY_MODAL_MAX_HEIGHT_CLASS}>
        <ModalHeader
          className={`flex flex-col gap-2 shrink-0 ${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-2`}
        >
          <p className={DICTIONARY_ONBOARDING_TITLE_CLASS}>
            <T
              k="dictionary.onboarding.title"
              defaultText='Добавили новую функцию — «Словарь». Посмотрите краткое обучение, как им пользоваться'
            />
          </p>
        </ModalHeader>
        <ModalBody
          className={`${DICTIONARY_MODAL_SECTION_PADDING_CLASS} pb-6 flex flex-col gap-4`}
        >
          <div className="flex flex-col gap-2">
            <p className={DICTIONARY_ONBOARDING_TITLE_CLASS}>
              <T k={activeSlide.titleKey} />
            </p>
            <p className={DICTIONARY_ONBOARDING_DESCRIPTION_CLASS}>
              <T k={activeSlide.descriptionKey} />
            </p>
          </div>

          <div
            className={DICTIONARY_ONBOARDING_IMAGE_SLOT_CLASS}
            aria-label={i18n.t("dictionary.onboarding.imageSlot", {
              fileName: activeSlide.imageFileName,
            })}
          >
            <Image
              removeWrapper
              alt=""
              aria-hidden
              src={activeSlide.imageSrc}
              classNames={{
                img: DICTIONARY_ONBOARDING_IMAGE_CLASS,
              }}
              className="h-full w-full"
            />
          </div>

          <p className={DICTIONARY_ONBOARDING_STEP_COUNTER_CLASS}>
            {activeIndex + 1} / {slides.length}
          </p>

          <div className={DICTIONARY_ONBOARDING_ACTIONS_CLASS}>
            <Button
              color="primary"
              size="lg"
              className={`flex-1 ${DICTIONARY_TOUCH_BUTTON_CLASS}`}
              onPress={handleBack}
              isDisabled={isFirstSlide}
            >
              <T k="common.back" />
            </Button>
            <Button
              color="primary"
              size="lg"
              className={`flex-1 ${DICTIONARY_TOUCH_BUTTON_CLASS}`}
              onPress={handlePrimaryAction}
            >
              {isLastSlide ? (
                <T k="dictionary.onboarding.done" defaultText="Понятно" />
              ) : (
                <T k="dictionary.onboarding.next" defaultText="Далее" />
              )}
            </Button>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
