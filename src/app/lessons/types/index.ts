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
  ["lesson_relations.status"]?: "open" | "close" | "complete";
  ["lesson_relations.id"]?: number;
  canEdit?: boolean;
  created_from_id?: number;
  created_from_2easy?: number;
  is_free?: string;
};
