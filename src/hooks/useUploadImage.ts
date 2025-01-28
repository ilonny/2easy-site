import { fetchPostMultipart } from "@/api";
import { useCallback, useState } from "react";
import { ImageListType } from "react-images-uploading";

export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadImages = useCallback(async (images: ImageListType) => {
    const fd = new FormData();
    images.forEach((image) => {
      fd.append("image", image.file);
    });

    const res = await fetchPostMultipart({
      path: "/upload-photos",
      data: fd,
      isSecure: true,
    });
    return await res.json()
  }, []);

  return { isLoading, uploadImages };
};
