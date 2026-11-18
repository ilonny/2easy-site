/** Positive numeric id, or 0 if missing/invalid. */
const positiveId = (value: unknown) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

export type TExerciseAnswerAccessParams = {
  isPreview?: boolean;
  isViewMode?: boolean;
  isTeacher: boolean;
  isPresentationMode?: boolean;
  studentId?: number | string | null;
  activeStudentId?: number | string | null;
};

/** Teacher may enter/save answers for the selected student during a lesson. */
export const canTeacherActForStudent = (params: {
  isTeacher: boolean;
  isPresentationMode?: boolean;
  activeStudentId?: number | string | null;
}) =>
  !!params.isTeacher &&
  !params.isPresentationMode &&
  positiveId(params.activeStudentId) > 0;

/**
 * Who may interact with / persist exercise answers in lesson view.
 * Mirrors FreeInputFormExView: teacher with an active student acts as that student.
 */
export const getExerciseAnswerAccess = (
  params: TExerciseAnswerAccessParams,
) => {
  const teacherActsForStudent = canTeacherActForStudent(params);
  const isStudentActor = !!params.studentId && !params.isTeacher;

  const canInteract =
    !!params.isPreview ||
    !params.isViewMode ||
    isStudentActor ||
    (!!params.isTeacher && !!params.isPresentationMode) ||
    teacherActsForStudent;

  const shouldPersistAnswers =
    !params.isPreview &&
    !!params.isViewMode &&
    (isStudentActor || teacherActsForStudent);

  return { canInteract, shouldPersistAnswers, teacherActsForStudent };
};
