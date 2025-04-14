/* eslint-disable @next/next/no-img-element */
import { FC, useMemo } from "react";
import Image from "next/image";
import { TMatchWordImageData } from "../../editor/MatchWordImage/types";

type TProps = {
  data: TMatchWordImageData;
  isPreview?: boolean;
};

export const MatchWordImageExView: FC<TProps> = ({
  data,
  isPreview = false,
}) => {
  console.log('data', data)

  const sortedChips = useMemo(() => {
    
  }, [data.images])

  return (
    <div className="p-16 px-24">
      <p
        style={{
          color: data.titleColor,
          fontSize: 38,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.title}
      </p>
      <p
        style={{
          fontSize: 24,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.subtitle}
      </p>
      {!!data.description && (
        <p
          style={{
            fontSize: 20,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {data.description}
        </p>
      )}
      <div className="h-10" />
      <div
        className={isPreview ? "w-[633px]" : ""}
        style={{ margin: "0 auto" }}
      >
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {!!data?.images?.length && (
          <div className="flex flex-wrap justify-center">
            {data?.images?.map((image) => {
              return (
                <div key={image.dataURL} className="w-[33.3333333%] p-4">
                  <img src={image.dataURL} alt="image" />
                  {image?.text && (
                    <p
                      className="mt-2 text-center font-bold"
                      style={{ fontSize: 18 }}
                    >
                      {image.text}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
