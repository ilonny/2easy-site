import {
  DICTIONARY_ONBOARDING_IMAGE_BASE_PATH,
  DICTIONARY_ONBOARDING_IMAGE_EXTENSION,
} from "./constants";

type TDictionaryOnboardingLocale = "ru" | "en";
type TDictionaryOnboardingRole = "teacher" | "student";

export type TDictionaryOnboardingImageFileName =
  | "add-words"
  | "add-word-modal"
  | "open-dictionary"
  | "mark-learned";

type TDictionaryOnboardingAudience = "all" | TDictionaryOnboardingRole;

type TDictionaryOnboardingSlideDefinition = {
  id: string;
  titleKey: string;
  descriptionKey: string;
  imageFileName: TDictionaryOnboardingImageFileName;
  audience: TDictionaryOnboardingAudience;
};

export type TDictionaryOnboardingSlide = Omit<
  TDictionaryOnboardingSlideDefinition,
  "imageFileName" | "audience"
> & {
  imageSrc: string;
};

const SLIDE_I18N_PREFIX = "dictionary.onboarding.slides";

const resolveLocale = (language: string): TDictionaryOnboardingLocale =>
  language.toLowerCase().startsWith("en") ? "en" : "ru";

const resolveRole = (isTeacher: boolean): TDictionaryOnboardingRole =>
  isTeacher ? "teacher" : "student";

const getDictionaryOnboardingImageSrc = (
  locale: TDictionaryOnboardingLocale,
  role: TDictionaryOnboardingRole,
  fileName: TDictionaryOnboardingImageFileName
) =>
  `${DICTIONARY_ONBOARDING_IMAGE_BASE_PATH}/${locale}/${role}/${fileName}.${DICTIONARY_ONBOARDING_IMAGE_EXTENSION}`;

const buildRoleSlide = (
  id: string,
  imageFileName: TDictionaryOnboardingImageFileName,
  i18nKey: string,
  role: TDictionaryOnboardingRole,
  options?: { sharedTitleKey?: string }
): TDictionaryOnboardingSlideDefinition => ({
  id: `${id}-${role}`,
  titleKey: options?.sharedTitleKey ?? `${SLIDE_I18N_PREFIX}.${i18nKey}${capitalizeRole(role)}.title`,
  descriptionKey: `${SLIDE_I18N_PREFIX}.${i18nKey}${capitalizeRole(role)}.description`,
  imageFileName,
  audience: role,
});

const capitalizeRole = (role: TDictionaryOnboardingRole) =>
  role === "teacher" ? "Teacher" : "Student";

const DICTIONARY_ONBOARDING_SLIDE_DEFINITIONS: TDictionaryOnboardingSlideDefinition[] =
  [
    buildRoleSlide("add-words", "add-words", "addWords", "teacher", {
      sharedTitleKey: `${SLIDE_I18N_PREFIX}.addWords.title`,
    }),
    buildRoleSlide("add-words", "add-words", "addWords", "student", {
      sharedTitleKey: `${SLIDE_I18N_PREFIX}.addWords.title`,
    }),
    {
      id: "add-word-modal",
      titleKey: `${SLIDE_I18N_PREFIX}.addWordModal.title`,
      descriptionKey: `${SLIDE_I18N_PREFIX}.addWordModal.description`,
      imageFileName: "add-word-modal",
      audience: "all",
    },
    buildRoleSlide("open-dictionary", "open-dictionary", "openDictionary", "teacher"),
    buildRoleSlide("open-dictionary", "open-dictionary", "openDictionary", "student"),
    {
      id: "mark-learned",
      titleKey: `${SLIDE_I18N_PREFIX}.markLearned.title`,
      descriptionKey: `${SLIDE_I18N_PREFIX}.markLearned.description`,
      imageFileName: "mark-learned",
      audience: "all",
    },
  ];

const matchesAudience = (
  audience: TDictionaryOnboardingAudience,
  role: TDictionaryOnboardingRole
) => audience === "all" || audience === role;

export const getDictionaryOnboardingSlides = (
  isTeacher: boolean,
  language: string
): TDictionaryOnboardingSlide[] => {
  const locale = resolveLocale(language);
  const role = resolveRole(isTeacher);

  return DICTIONARY_ONBOARDING_SLIDE_DEFINITIONS.filter((slide) =>
    matchesAudience(slide.audience, role)
  ).map(({ imageFileName, audience: _audience, ...slide }) => ({
    ...slide,
    imageSrc: getDictionaryOnboardingImageSrc(locale, role, imageFileName),
  }));
};
