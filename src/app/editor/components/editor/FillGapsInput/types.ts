export type TOption = {
  value: string;
  isCorrect: boolean;
};

export type TField = {
  startPosition?: number;
  id: string;
  options: TOption[];
};

export type TFillGapsInputData = {
  id?: string;
  title: string;
  titleColor: string;
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: Array<TField>;
};
