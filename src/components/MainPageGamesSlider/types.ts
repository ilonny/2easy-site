
export type TCard = {
  title: string;
  subTitle: string;
  description: string;
  videoSrc: string;
  link: string;
  imageSrc?: object;
};

export type TProps = {
  data: TCard[];
};