export type TAudioData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  editorImages: Array<Record<string, string>>;
  videos: Array<{
    content: string;
    title?: string;
  }>;
  sortIndex?: number;
};
