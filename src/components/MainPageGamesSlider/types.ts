
export type TCard = {
  title: string;
  subTitle: string;
  description: string;
  videoSrc: string;
  link: string;
};

export type TProps = {
  data: TCard[];
};