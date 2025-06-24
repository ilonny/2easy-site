import LinkArrow from "@/assets/icons/link_arrow.svg";
import Image from "next/image";

export type TSquare = {
  title?: string;
  bgImage?: any;
  bgColor?: string;
  link?: string;
};

type TProps = {
  data: TSquare[];
};

export const SquareList = (props: TProps) => {
  const { data } = props;
  return (
    <div className="flex flex-wrap wrap">
      {data.map((s) => {
        return (
          <div className="w-[25%] p-2 min-h-[320px] mb-4" key={s.title}>
            <a href={s.link ? s.link : "#"}>
              <div
                className="square items-center justify-center h-full flex"
                style={{
                  background: s.bgImage
                    ? `url(${s["bgImage"].src}) center center no-repeat`
                    : s.bgColor
                    ? s.bgColor
                    : "",
                  backgroundSize: "contain",
                  borderRadius: 10,
                }}
              >
                {s.title}
              </div>
              {!!s.link && (
                <div
                  className="flex gap-2 justify-end"
                  style={{ color: "#3f28c6" }}
                >
                  <p>Открыть</p>
                  <Image
                    src={LinkArrow}
                    alt="arrow"
                    style={{ transform: "rotate(315deg)", width: 16 }}
                  />
                </div>
              )}
            </a>
          </div>
        );
      })}
    </div>
  );
};
