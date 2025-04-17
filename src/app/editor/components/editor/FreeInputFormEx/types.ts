import { ImageListType } from "react-images-uploading";

export type TFreeInputFormData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  questions: Record<string, string>[];
};
