export type TOption = {
  value: string;
  isCorrect: boolean;
};

export type TField = {
  startPosition?: number;
  id: number;
  options: TOption[];
  originalWord: string;
};

export type TFillGapsSelectData = {
  id?: number;
  title: string;
  titleColor: string;
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: TField[];
};
