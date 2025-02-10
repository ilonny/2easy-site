import { fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadImageEx = () => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveImageEx = useCallback(async (data: any) => {
    setIsLoading(true);
    const exAttachments: any[] = [];
    if (!!data?.images?.length) {
    }
    const savedAttachments = await uploadImages(
      data?.images?.map((i) => {
        return {
          ...i,
        };
      })
    );
    if (savedAttachments?.attachments?.length) {
      savedAttachments?.attachments?.forEach((att, attIndex) => {
        console.log("att?", att, attIndex, data?.images?.[attIndex]);
        exAttachments.push({
          id: att?.id,
          path: att?.path,
          text: data?.images?.[attIndex]?.text || "",
        });
      });
    }
    const exData = {
      ...data,
      attachments: exAttachments,
    };
    console.log("exAttachments", exAttachments);
    try {
      delete exData.images;
      const createdExRes = await fetchPostJson({
        path: "/ex/create",
        isSecure: true,
        data: {
          lesson_id: params.id,
          type: "image",
          data: JSON.stringify(exData),
        },
      });
      const createdEx = await createdExRes.json();
      if (createdEx?.success) {
        setSuccess(true);
      }
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoading, saveImageEx, success };
};
