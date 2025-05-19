export type TMatch = {
  id: string;
  value: string;
  correctValue: string;
};

export type TMatchWordWordData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  sortIndex?: number;
  matches: TMatch[];
};
