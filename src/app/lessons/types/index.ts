export type TLesson = {
  id: number;
  title: string;
  description: string;
  student_id?: string;
  group_id?: string;
  tags?: string;
  image_id?: string;
  image_path?: string;
  user_id: number;
};
