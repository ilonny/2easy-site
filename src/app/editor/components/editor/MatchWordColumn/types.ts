export type TColumn = {
  id: number;
  title: string;
  words: string[];
};

export type TMatchWordColumnData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  columns: TColumn[];
};
