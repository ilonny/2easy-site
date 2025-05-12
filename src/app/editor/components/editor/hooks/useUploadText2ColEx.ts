import { TText2ColData } from "./../Text2Col/types";
import { checkResponse, fetchPostJson } from "@/api";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export const useUploadText2ColEx = (lastSortIndex: number) => {
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { uploadImages } = useUploadImage();
  const saveText2ColEx = useCallback(
    async (data: TText2ColData) => {
      setIsLoading(true);

      const exBgAttachments: any[] =
        (!!data?.images?.length && data?.images?.filter((i) => !i.file)) || [];
      const bgImagesToUpload =
        (!!data?.images?.length && data?.images?.filter((i) => !!i.file)) || [];

      const exEditorAttachments: any[] =
        (!!data?.editorImages?.length &&
          data?.editorImages?.filter((i) => !i.file)) ||
        [];
      const editorImagesToUpload =
        (!!data?.editorImages?.length &&
          data?.editorImages?.filter((i) => !!i.file)) ||
        [];

      const exSecondEditorAttachments: any[] =
        (!!data?.secondEditorImages?.length &&
          data?.secondEditorImages?.filter((i) => !i.file)) ||
        [];
      const secondEditorImagesToUpload =
        (!!data?.secondEditorImages?.length &&
          data?.secondEditorImages?.filter((i) => !!i.file)) ||
        [];

      const savedBgAttachments = bgImagesToUpload?.length
        ? await uploadImages(
            bgImagesToUpload?.map((i) => {
              return {
                ...i,
              };
            })
          )
        : [];

      if (savedBgAttachments?.attachments?.length) {
        savedBgAttachments?.attachments?.forEach((att, attIndex) => {
          exBgAttachments.push({
            id: att?.id,
            path: att?.path,
            text: data?.images?.[attIndex]?.text || "",
          });
        });
      }
      const savedEditorAttachments = editorImagesToUpload?.length
        ? await uploadImages(
            editorImagesToUpload?.map((i) => {
              return {
                ...i,
              };
            })
          )
        : [];

      const savedSecondEditorAttachments = secondEditorImagesToUpload?.length
        ? await uploadImages(
            secondEditorImagesToUpload?.map((i) => {
              return {
                ...i,
              };
            })
          )
        : [];

      if (savedEditorAttachments?.attachments?.length) {
        savedEditorAttachments?.attachments?.forEach((att, attIndex) => {
          exEditorAttachments.push({
            id: att?.id,
            path: att?.path,
            text: data?.editorImages?.[attIndex]?.text || "",
          });
        });
      }

      if (savedSecondEditorAttachments?.attachments?.length) {
        savedSecondEditorAttachments?.attachments?.forEach((att, attIndex) => {
          exSecondEditorAttachments.push({
            id: att?.id,
            path: att?.path,
            text: data?.secondEditorImages?.[attIndex]?.text || "",
          });
        });
      }

      const exData = {
        ...data,
        bgAttachments: exBgAttachments,
        editorAttachments: exEditorAttachments,
        secondEditorAttachments: exSecondEditorAttachments,
      };

      try {
        delete exData.images;
        delete exData.editorImages;
        delete exData.secondEditorImages;

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: params.id,
            id: data.id,
            type: "text-2-col",
            data: JSON.stringify(exData),
            sortIndex:
              data.sortIndex === 0 ? 0 : data.sortIndex || lastSortIndex || 0,
          },
        });
        const createdEx = await createdExRes.json();
        if (createdEx?.success) {
          setSuccess(true);
        }
        checkResponse(createdEx);
      } catch (err) {
      } finally {
        setIsLoading(false);
      }
    },
    [lastSortIndex, params.id, uploadImages]
  );

  return { isLoading, saveText2ColEx, success };
};
