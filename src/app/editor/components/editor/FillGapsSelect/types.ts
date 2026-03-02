export type TFieldOption = {
  value: string;
  isCorrect: boolean;
};

export type TField = {
  startPosition?: number;
  id: string;
  options: TFieldOption[];
  originalWord: string;
};

export type TFillGapsSelectData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: Array<TField>;
};
