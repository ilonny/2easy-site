import { FC } from "react";
import { TImageExData } from "../../editor/ImageEx/types";

type TProps = {
  data: TImageExData;
  isPreview?: boolean;
};

export const ImageExView: FC<TProps> = ({ data, isPreview = false }) => {
  console.log("Preview data", data);
  return (
    <div
      style={{ border: "1px solid #3F28C6", borderRadius: 4 }}
      className="p-8"
    >
      <p
        style={{
          color: data.titleColor,
          fontSize: 22,
          textAlign: "center",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        {data.title}
      </p>
      <p
        style={{
          fontSize: 14,
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
            fontSize: 14,
            textAlign: "center",
            whiteSpace: "pre-line",
          }}
        >
          {data.description}
        </p>
      )}
      <div className="h-10" />
      <div
        className={isPreview ? "w-[430px]" : ""}
        style={{ margin: "0 auto" }}
      >
        {!Boolean(data?.images?.length) && (
          <div
            className="w-full h-[250px]"
            style={{ backgroundColor: "#D9D9D9" }}
          />
        )}
        {data?.images?.length && data?.viewType === "carousel" && <></>}
      </div>
    </div>
  );
};
