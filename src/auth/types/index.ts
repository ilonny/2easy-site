export type TProfile = {
  name?: string;
  login?: string;
  email?: string;
  phone?: string;
  surname?: string;
  role_id?: number;
  isStudent?: boolean;
  studentId?: number;
  id?: number;
  user_id?: string | number;
  avatar?: string | null;
  schoolId?: number | null;
  schoolRoles?: string[];
  schools?: Array<{ id: number; name: string; roles?: string[] }>;
};
