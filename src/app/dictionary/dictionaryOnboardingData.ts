import addWordsRuTeacherImage from "@/assets/images/dictionary-onboarding/ru/teacher/add-words.png";
import addWordModalRuTeacherImage from "@/assets/images/dictionary-onboarding/ru/teacher/add-word-modal.png";
import openDictionaryRuTeacherImage from "@/assets/images/dictionary-onboarding/ru/teacher/open-dictionary.png";
import markLearnedRuTeacherImage from "@/assets/images/dictionary-onboarding/ru/teacher/mark-learned.png";
import addWordsRuStudentImage from "@/assets/images/dictionary-onboarding/ru/student/add-words.png";
import addWordModalRuStudentImage from "@/assets/images/dictionary-onboarding/ru/student/add-word-modal.png";
import openDictionaryRuStudentImage from "@/assets/images/dictionary-onboarding/ru/student/open-dictionary.png";
import markLearnedRuStudentImage from "@/assets/images/dictionary-onboarding/ru/student/mark-learned.png";
import addWordsEnTeacherImage from "@/assets/images/dictionary-onboarding/en/teacher/add-words.png";
import addWordModalEnTeacherImage from "@/assets/images/dictionary-onboarding/en/teacher/add-word-modal.png";
import openDictionaryEnTeacherImage from "@/assets/images/dictionary-onboarding/en/teacher/open-dictionary.png";
import markLearnedEnTeacherImage from "@/assets/images/dictionary-onboarding/en/teacher/mark-learned.png";
import addWordsEnStudentImage from "@/assets/images/dictionary-onboarding/en/student/add-words.png";
import addWordModalEnStudentImage from "@/assets/images/dictionary-onboarding/en/student/add-word-modal.png";
import openDictionaryEnStudentImage from "@/assets/images/dictionary-onboarding/en/student/open-dictionary.png";
import markLearnedEnStudentImage from "@/assets/images/dictionary-onboarding/en/student/mark-learned.png";

export type TDictionaryOnboardingAudience = "all" | "teacher" | "student";
export type TDictionaryOnboardingLocale = "ru" | "en";
export type TDictionaryOnboardingRole = "teacher" | "student";

export type TDictionaryOnboardingImageFileName =
  | "add-words"
  | "add-word-modal"
  | "open-dictionary"
  | "mark-learned";

type TDictionaryOnboardingSlideDefinition = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  imageFileName: TDictionaryOnboardingImageFileName;
  audience: TDictionaryOnboardingAudience;
};

export type TDictionaryOnboardingSlide = TDictionaryOnboardingSlideDefinition & {
  imageSrc: string;
};

const DICTIONARY_ONBOARDING_IMAGES: Record<
  TDictionaryOnboardingLocale,
  Record<
    TDictionaryOnboardingRole,
    Record<TDictionaryOnboardingImageFileName, string>
  >
> = {
  ru: {
    teacher: {
      "add-words": addWordsRuTeacherImage.src,
      "add-word-modal": addWordModalRuTeacherImage.src,
      "open-dictionary": openDictionaryRuTeacherImage.src,
      "mark-learned": markLearnedRuTeacherImage.src,
    },
    student: {
      "add-words": addWordsRuStudentImage.src,
      "add-word-modal": addWordModalRuStudentImage.src,
      "open-dictionary": openDictionaryRuStudentImage.src,
      "mark-learned": markLearnedRuStudentImage.src,
    },
  },
  en: {
    teacher: {
      "add-words": addWordsEnTeacherImage.src,
      "add-word-modal": addWordModalEnTeacherImage.src,
      "open-dictionary": openDictionaryEnTeacherImage.src,
      "mark-learned": markLearnedEnTeacherImage.src,
    },
    student: {
      "add-words": addWordsEnStudentImage.src,
      "add-word-modal": addWordModalEnStudentImage.src,
      "open-dictionary": openDictionaryEnStudentImage.src,
      "mark-learned": markLearnedEnStudentImage.src,
    },
  },
};

export const resolveDictionaryOnboardingLocale = (
  language: string
): TDictionaryOnboardingLocale =>
  language.toLowerCase().startsWith("en") ? "en" : "ru";

export const resolveDictionaryOnboardingRole = (
  isTeacher: boolean
): TDictionaryOnboardingRole => (isTeacher ? "teacher" : "student");

const DICTIONARY_ONBOARDING_SLIDE_DEFINITIONS: TDictionaryOnboardingSlideDefinition[] =
  [
    {
      id: "add-words-teacher",
      titleKey: "dictionary.onboarding.slides.addWordsTeacher.title",
      descriptionKey: "dictionary.onboarding.slides.addWordsTeacher.description",
      imageFileName: "add-words",
      audience: "teacher",
    },
    {
      id: "add-words-student",
      titleKey: "dictionary.onboarding.slides.addWordsStudent.title",
      descriptionKey: "dictionary.onboarding.slides.addWordsStudent.description",
      imageFileName: "add-words",
      audience: "student",
    },
    {
      id: "add-word-modal",
      titleKey: "dictionary.onboarding.slides.addWordModal.title",
      descriptionKey: "dictionary.onboarding.slides.addWordModal.description",
      imageFileName: "add-word-modal",
      audience: "all",
    },
    {
      id: "open-dictionary-teacher",
      titleKey: "dictionary.onboarding.slides.openDictionaryTeacher.title",
      descriptionKey:
        "dictionary.onboarding.slides.openDictionaryTeacher.description",
      imageFileName: "open-dictionary",
      audience: "teacher",
    },
    {
      id: "open-dictionary-student",
      titleKey: "dictionary.onboarding.slides.openDictionaryStudent.title",
      descriptionKey:
        "dictionary.onboarding.slides.openDictionaryStudent.description",
      imageFileName: "open-dictionary",
      audience: "student",
    },
    {
      id: "mark-learned",
      titleKey: "dictionary.onboarding.slides.markLearned.title",
      descriptionKey: "dictionary.onboarding.slides.markLearned.description",
      imageFileName: "mark-learned",
      audience: "all",
    },
  ];

export const getDictionaryOnboardingSlides = (
  isTeacher: boolean,
  language: string
): TDictionaryOnboardingSlide[] => {
  const locale = resolveDictionaryOnboardingLocale(language);
  const role = resolveDictionaryOnboardingRole(isTeacher);
  const images = DICTIONARY_ONBOARDING_IMAGES[locale][role];

  return DICTIONARY_ONBOARDING_SLIDE_DEFINITIONS.filter(
    (slide) =>
      slide.audience === "all" ||
      (isTeacher ? slide.audience === "teacher" : slide.audience === "student")
  ).map((slide) => ({
    ...slide,
    imageSrc: images[slide.imageFileName],
  }));
};
