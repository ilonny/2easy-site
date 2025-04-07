export type TField = {
  startPosition: number;
  id: string;
  value: string;
};

export type TFillGapsDragData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  dataText: string;
  fields: Array<TField>;
};
