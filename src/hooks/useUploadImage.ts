import { checkResponse, fetchPostJson, fetchPostMultipart } from "@/api";
import { useCallback, useState } from "react";
import { ImageListType } from "react-images-uploading";

export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadImages = useCallback(async (images: ImageListType) => {
    if (images.some((i) => i.dataURL?.includes('https://'))) {
      const res = await fetchPostJson({
        path: "/upload-photos-by-url",
        data: images,
        isSecure: true,
      });
      const json = await res.json();
      checkResponse(json);
      return json;
    }

    const fd = new FormData();
    images.forEach((image) => {
      fd.append("image", image.file);
    });

    const res = await fetchPostMultipart({
      path: "/upload-photos",
      data: fd,
      isSecure: true,
    });
    const json = await res.json();
    checkResponse(json);
    return json;
  }, []);

  return { isLoading, uploadImages };
};
