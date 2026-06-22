import addWordsImage from "@/assets/images/dictionary-onboarding/add-words.svg";
import addWordModalImage from "@/assets/images/dictionary-onboarding/add-word-modal.svg";
import openDictionaryTeacherImage from "@/assets/images/dictionary-onboarding/open-dictionary-teacher.svg";
import openDictionaryStudentImage from "@/assets/images/dictionary-onboarding/open-dictionary-student.svg";
import markLearnedImage from "@/assets/images/dictionary-onboarding/mark-learned.svg";

export type TDictionaryOnboardingAudience = "all" | "teacher" | "student";

export type TDictionaryOnboardingSlide = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  imageSrc: string;
  imageFileName: string;
  audience: TDictionaryOnboardingAudience;
};

export const DICTIONARY_ONBOARDING_SLIDES: TDictionaryOnboardingSlide[] = [
  {
    id: "add-words",
    titleKey: "dictionary.onboarding.slides.addWords.title",
    descriptionKey: "dictionary.onboarding.slides.addWords.description",
    imageSrc: addWordsImage.src,
    imageFileName: "add-words",
    audience: "all",
  },
  {
    id: "add-word-modal",
    titleKey: "dictionary.onboarding.slides.addWordModal.title",
    descriptionKey: "dictionary.onboarding.slides.addWordModal.description",
    imageSrc: addWordModalImage.src,
    imageFileName: "add-word-modal",
    audience: "all",
  },
  {
    id: "open-dictionary-teacher",
    titleKey: "dictionary.onboarding.slides.openDictionaryTeacher.title",
    descriptionKey: "dictionary.onboarding.slides.openDictionaryTeacher.description",
    imageSrc: openDictionaryTeacherImage.src,
    imageFileName: "open-dictionary-teacher",
    audience: "teacher",
  },
  {
    id: "open-dictionary-student",
    titleKey: "dictionary.onboarding.slides.openDictionaryStudent.title",
    descriptionKey: "dictionary.onboarding.slides.openDictionaryStudent.description",
    imageSrc: openDictionaryStudentImage.src,
    imageFileName: "open-dictionary-student",
    audience: "student",
  },
  {
    id: "mark-learned",
    titleKey: "dictionary.onboarding.slides.markLearned.title",
    descriptionKey: "dictionary.onboarding.slides.markLearned.description",
    imageSrc: markLearnedImage.src,
    imageFileName: "mark-learned",
    audience: "all",
  },
];

export const getDictionaryOnboardingSlides = (isTeacher: boolean) =>
  DICTIONARY_ONBOARDING_SLIDES.filter(
    (slide) =>
      slide.audience === "all" ||
      (isTeacher ? slide.audience === "teacher" : slide.audience === "student")
  );
