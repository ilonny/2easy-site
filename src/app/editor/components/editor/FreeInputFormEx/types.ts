export type TFreeInputQuestion = {
  id: string;
  value?: string;
  images?: unknown[];
  options?: Array<{ id: string; value?: string }>;
};

export type TFreeInputFormData = {
  id?: number;
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  questions: TFreeInputQuestion[];
};
