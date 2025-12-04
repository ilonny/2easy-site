/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC, memo } from "react";
import { Card } from "@nextui-org/react";
import { TIntData } from "../../editor/Int/types";
import styles from "./styles.module.css";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TIntData;
  isPreview?: boolean;
};

const IntExViewComp: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  return (
    <>
      <div className={`pt-8 w-[100%] max-w-[766px] m-auto`}>
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
        {!!data.subtitle && (
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
        )}
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
      </div>
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[100%] max-w-[886px] m-auto`}>
        <div style={{ margin: "0 auto" }} className="flex flex-col gap-10">
          <div
            className="flex justify-center"
            style={{ minHeight: 500, width: "100%" }}
            dangerouslySetInnerHTML={{ __html: data?.iframe }}
          />
        </div>
      </div>
    </>
  );
};

export const IntExView = memo(IntExViewComp);
