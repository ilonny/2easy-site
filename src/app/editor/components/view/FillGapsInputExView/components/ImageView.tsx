import React, { FC } from "react";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";

type TImage = {
  dataURL?: string;
};

const ImageView: FC<{ image?: TImage }> = ({ image }) => {
  if (!image) return null;
  return (
    <Zoom>
      <img src={image.dataURL} className="max-h-[400px] mx-auto" alt="" />
    </Zoom>
  );
};

export default ImageView;
