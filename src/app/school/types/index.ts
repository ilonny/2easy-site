export type SchoolRole =
  | "super_admin"
  | "teacher"
  | "head_teacher"
  | "methodist"
  | "academic_director"
  | "manager";

export type SchoolAccessFlags = {
  canSeeAllStudents: boolean;
  canSeeAllSchedule: boolean;
  canManageMembers: boolean;
  canManageSchool: boolean;
  canManageSchoolSettings?: boolean;
  canEditAnyTeacherHours?: boolean;
  canPay: boolean;
  canAccessMaterials: boolean;
  canManageSchoolLibrary?: boolean;
  canSeeTeachers: boolean;
  canViewStaffCabinets: boolean;
  canTeach: boolean;
  canViewStaffDirectory?: boolean;
  canViewAllStudents?: boolean;
  canManageOwnStudents?: boolean;
  canManageStudentsBelow?: boolean;
  canViewAllSchedules?: boolean;
  canManageOwnSchedule?: boolean;
  canManageSchedulesBelow?: boolean;
  canViewSharedMaterials?: boolean;
  canManageSharedMaterials?: boolean;
  canViewStudentMaterials?: boolean;
  canViewStaffMaterialsBelow?: boolean;
  canManageStaffMaterialsBelow?: boolean;
  canViewSchoolStats?: boolean;
};

export type SchoolWorkingDay = {
  dow: number;
  start: string;
  end: string;
};

export type SchoolSettings = {
  timezone: string;
  workingHours: {
    enabled: boolean;
    days: SchoolWorkingDay[];
  };
  defaultLessonMinutes: number;
  languages: string[];
  directions: string[];
  contacts: {
    phone?: string;
    email?: string;
    socials?: Array<{ kind: string; url: string }>;
  };
};

export type AvailableTeacher = {
  user_id: number;
  login: string;
  name?: string | null;
  surname?: string | null;
  roles: SchoolRole[];
  free_minutes_day: number;
};

export const COMMON_TIMEZONES = [
  "Europe/Moscow",
  "Europe/Kaliningrad",
  "Europe/Samara",
  "Asia/Yekaterinburg",
  "Asia/Omsk",
  "Asia/Krasnoyarsk",
  "Asia/Irkutsk",
  "Asia/Yakutsk",
  "Asia/Vladivostok",
  "Asia/Magadan",
  "Asia/Kamchatka",
  "Europe/Kyiv",
  "Europe/Minsk",
  "Asia/Almaty",
  "Asia/Tashkent",
  "Europe/Berlin",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "UTC",
];

export const LESSON_DURATIONS = [30, 45, 55, 60, 70, 90, 120];

/** 0=Sun … 6=Sat — labels via i18n school.dow.* */
export const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];

export type SchoolSubscription = {
  id: number;
  tier: string;
  max_students: number;
  amount: number;
  dateStart?: string;
  dateEnd?: string;
} | null;

export type SchoolInfo = {
  id: number;
  name: string;
  avatar?: string | null;
  memberId?: number;
  roles?: SchoolRole[];
  access?: Partial<SchoolAccessFlags>;
  subscription?: SchoolSubscription;
  settings?: {
    timezone?: string;
    defaultLessonMinutes?: number;
    workingHoursEnabled?: boolean;
  };
};

export type SchoolMember = {
  id: number;
  user_id: number;
  status: string;
  roles: SchoolRole[];
  can_open_cabinet?: boolean;
  user: {
    id: number;
    login: string;
    name?: string;
    surname?: string;
    phone?: string;
    avatar?: string | null;
  } | null;
};

export type SchoolStats = {
  level: number;
  rank: number;
  scope: "self" | "school";
  students_active: number;
  students_archived: number;
  members_active: number;
  members_archived: number;
  events_this_week: number;
  events_this_month: number;
  payments_this_month: number;
  payments_amount_this_month: number;
  students_by_teacher: Array<{
    user_id: number;
    name: string;
    students_count: number;
  }>;
  lessons_by_day: Array<{ date: string; label: string; count: number }>;
  lessons_by_week: Array<{ week: string; label: string; count: number }>;
  lessons_by_weekday: Array<{
    weekday: number;
    label: string;
    count: number;
  }>;
  members_by_month?: Array<{
    month: string;
    label: string;
    added: number;
    total: number;
  }>;
  students_by_month?: Array<{
    month: string;
    label: string;
    added: number;
    total: number;
  }>;
  teachers_load: Array<{
    user_id: number;
    name: string;
    students_count: number;
    lessons_8w: number;
  }>;
  payments_by_month: Array<{
    month: string;
    label: string;
    count: number;
    amount: number;
  }>;
  payments_by_teacher: Array<{
    user_id: number;
    name: string;
    count: number;
    amount: number;
  }>;
  subscription: {
    tier: string;
    max_students: number | null;
    student_count: number;
    fill_percent: number | null;
    days_left: number | null;
  } | null;
};

export type SchoolTier = {
  tier: string;
  maxStudents: number;
  amount: number;
};

export const SCHOOL_ROLE_OPTIONS: SchoolRole[] = [
  "teacher",
  "head_teacher",
  "methodist",
  "academic_director",
  "manager",
];
