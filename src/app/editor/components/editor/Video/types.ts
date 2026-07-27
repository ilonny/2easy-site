export type TVideoSource = "link" | "file";

export type TVideoAttachment = {
  id?: number | string;
  path?: string;
  name?: string;
  dataURL?: string;
  file?: File;
};

export type TVideoItem = {
  content: string;
  title?: string;
  /** "link" = iframe/URL embed; "file" = uploaded video from device */
  source?: TVideoSource;
  attachment?: TVideoAttachment;
};

export type TVideoData = {
  title: string;
  titleColor: "#3F28C6";
  subtitle: string;
  description: string;
  images: Array<Record<string, string>>;
  videos: Array<TVideoItem>;
  sortIndex?: number;
  id?: number;
};
