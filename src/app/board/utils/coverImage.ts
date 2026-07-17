import { filterImagesToUpload } from "@/app/editor/helpers";
import { ImageListType } from "react-images-uploading";

type TUploadImagesResult = {
  attachments?: Array<{ id?: number | string } | null>;
};

export const resolveBoardCoverImageId = async (
  images: ImageListType,
  currentImageId: string | undefined,
  uploadImages: (images: ImageListType) => Promise<TUploadImagesResult | undefined>,
): Promise<string | undefined> => {
  if (!images.length) {
    return undefined;
  }

  const imagesToUpload = images.filter(filterImagesToUpload);
  if (!imagesToUpload.length) {
    return currentImageId;
  }

  const uploadResult = await uploadImages(imagesToUpload);
  const uploadedId = (uploadResult?.attachments || []).find(
    (item) => item?.id != null,
  )?.id;

  if (uploadedId == null) {
    return currentImageId;
  }

  return String(uploadedId);
};
