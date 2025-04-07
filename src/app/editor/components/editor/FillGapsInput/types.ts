export type TField = {
  startPosition: number;
  id: string;
  options: [
    {
      value: string;
      isCorrect: boolean;
    }
  ];
};

export type TFillGapsInputData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: Array<TField>;
};
