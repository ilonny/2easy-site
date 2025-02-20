export type TTextDefaultData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  editorImages: Array<Record<string, string>>;
  viewType: "carousel" | "2-col" | "3-col";
  content: string;
  sortIndex: number;
};
