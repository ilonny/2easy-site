/* eslint-disable @next/next/no-img-element */
import { FC } from "react";
import { TTextDefaultData } from "../../editor/TextDefault/types";
import { Card } from "@nextui-org/react";

type TProps = {
  data: TTextDefaultData;
  isPreview?: boolean;
};

export const TextDefaultExView: FC<TProps> = ({ data, isPreview = false }) => {
  const image = data?.images?.[0];
  const editorImage = data?.editorImages?.[0];
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
      <div
        className={`py-8 w-[886px] m-auto`}
        style={
          image && {
            backgroundImage: `url(${image.dataURL})`,
            backgroundSize: "cover",
          }
        }
      >
        <Card
          className={`p-10 editor-view`}
          style={{
            margin: "0 auto",
            backgroundColor: "#fff",
            borderRadius: 14,
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {!!editorImage && (
            <img src={editorImage.dataURL} style={{ marginBottom: 25 }} />
          )}
          <div
            dangerouslySetInnerHTML={{ __html: data?.content }}
            className="editorClassName"
          />
          {/* {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )} */}
        </Card>
      </div>
    </>
  );
};
