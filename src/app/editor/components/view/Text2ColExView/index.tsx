/* eslint-disable @next/next/no-img-element */
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FC } from "react";

import { Card } from "@nextui-org/react";
import { TText2ColData } from "../../editor/Text2Col/types";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TProps = {
  data: TText2ColData;
  isPreview?: boolean;
};

export const Text2ColExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];
  const secondEditorImage = data?.secondEditorImages?.[0];
  return (
    <>
      <div className={`py-8 w-[886px] m-auto`}>
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
      </div>
      {!!image && (
        <Zoom>
          <img src={image.dataURL} style={{ maxHeight: 400, margin: "auto" }} />
        </Zoom>
      )}
      <div className={`py-8 w-[886px] m-auto`}>
        <div className="flex items-start justify-between gap-4">
          <Card
            className={`w-[50%] p-5 editor-view`}
            style={{
              margin: "0 auto",
              backgroundColor: "#fff",
              borderRadius: 14,
              minWidth: "50%",
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {!!editorImage && (
              <img src={editorImage.dataURL} className="mb-4" />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: data?.content }}
              className="editorClassName"
            />
          </Card>
          <Card
            className={`w-[50%] p-5 editor-view`}
            style={{
              margin: "0 auto",
              backgroundColor: "#fff",
              borderRadius: 14,
              minWidth: "50%",
            }}
          >
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {!!secondEditorImage && (
              <img src={secondEditorImage.dataURL} className="mb-4" />
            )}
            <div
              dangerouslySetInnerHTML={{ __html: data?.secondContent }}
              className="editorClassName"
            />
          </Card>
        </div>
      </div>
    </>
  );
};
