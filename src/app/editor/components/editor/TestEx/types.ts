import { ImageListType } from "react-images-uploading";

export type TOption = {
  id: string;
  value: string;
  isCorrect: boolean;
};

export type TQuestion = {
  images: ImageListType;
  value: string;
  id: string;
  options: TOption[];
};

export type TTestData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  questions: TQuestion[];
};
