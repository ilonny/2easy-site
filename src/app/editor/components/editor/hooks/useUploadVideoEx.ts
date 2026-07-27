import { checkResponse, fetchPostJson, fetchPostMultipartWithProgress } from "@/api";
import {
  filterImagesToUpload,
  persistExerciseAttachments,
} from "@/app/editor/helpers";
import { useEditorLessonId } from "@/app/editor/hooks/useEditorLessonId";
import { useUploadImage } from "@/hooks/useUploadImage";
import { useCallback, useState } from "react";
import { TVideoData, TVideoItem } from "./../Video/types";

export type TVideoUploadProgress = {
  /** 0-based index among videos being uploaded, or -1 for images */
  videoIndex: number;
  fileName: string;
  loaded: number;
  total: number;
};

const uploadVideoFile = async (
  file: File,
  onProgress?: (loaded: number, total: number) => void,
) => {
  const fd = new FormData();
  fd.append("image", file);
  const json = await fetchPostMultipartWithProgress({
    path: "/upload-photos",
    data: fd,
    isSecure: true,
    onProgress: (p) => onProgress?.(p.loaded, p.total),
  });
  checkResponse(json);
  return json;
};

const persistVideoItems = async (
  videos: TVideoItem[] | undefined,
  onFileProgress?: (
    videoIndex: number,
    fileName: string,
    loaded: number,
    total: number,
  ) => void,
): Promise<TVideoItem[]> => {
  const list = videos || [];
  const result: TVideoItem[] = [];

  for (let i = 0; i < list.length; i++) {
    const video = list[i];
    const attachment = video.attachment;
    const needsUpload = !!attachment?.file;

    if (video.source === "file" || needsUpload || attachment?.path) {
      let savedAttachment = attachment
        ? {
            id: attachment.id,
            path: attachment.path,
            name:
              attachment.name ||
              (attachment.file instanceof File
                ? attachment.file.name
                : undefined),
          }
        : undefined;

      if (needsUpload && attachment?.file) {
        const file = attachment.file;
        const fileName =
          attachment.name ||
          (file instanceof File ? file.name : "video");
        const totalHint = file instanceof File ? file.size : 0;
        onFileProgress?.(i, fileName, 0, totalHint);

        const uploadRes = await uploadVideoFile(file, (loaded, total) => {
          onFileProgress?.(i, fileName, loaded, total || totalHint);
        });
        const saved = uploadRes?.attachments?.[0];
        if (saved?.path) {
          savedAttachment = {
            id: saved.id,
            path: saved.path,
            name: fileName,
          };
        }
      }

      result.push({
        title: video.title || "",
        content: "",
        source: "file",
        attachment: savedAttachment?.path
          ? {
              id: savedAttachment.id,
              path: savedAttachment.path,
              name: savedAttachment.name,
            }
          : undefined,
      });
      continue;
    }

    result.push({
      title: video.title || "",
      content: video.content || "",
      source: "link",
    });
  }

  return result;
};

export const useUploadVideoEx = (
  lastSortIndex: number,
  currentSortIndexToShift?: number,
) => {
  const lessonId = useEditorLessonId();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [uploadProgress, setUploadProgress] =
    useState<TVideoUploadProgress | null>(null);
  const { uploadImages } = useUploadImage();

  const saveVideoEx = useCallback(
    async (data: TVideoData) => {
      setIsLoading(true);
      setSuccess(false);
      setUploadProgress(null);

      try {
        const bgImagesToUpload =
          (data?.images || []).filter(filterImagesToUpload) || [];
        const savedBgAttachments = bgImagesToUpload.length
          ? await uploadImages(bgImagesToUpload.map((i) => ({ ...i })))
          : undefined;
        const exBgAttachments = persistExerciseAttachments(
          data?.images,
          savedBgAttachments,
        );

        const videos = await persistVideoItems(
          data.videos,
          (videoIndex, fileName, loaded, total) => {
            setUploadProgress({ videoIndex, fileName, loaded, total });
          },
        );

        setUploadProgress(null);

        const exData: Record<string, unknown> = {
          ...data,
          videos,
          bgAttachments: exBgAttachments,
        };
        delete exData.images;

        const createdExRes = await fetchPostJson({
          path: "/ex/create",
          isSecure: true,
          data: {
            lesson_id: lessonId,
            id: data.id,
            type: "video",
            data: JSON.stringify(exData),
            sortIndex:
              data.sortIndex === 0 ? 0 : data.sortIndex || lastSortIndex || 0,
            currentSortIndexToShift,
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
        setUploadProgress(null);
      }
    },
    [lastSortIndex, lessonId, uploadImages, currentSortIndexToShift],
  );

  return { isLoading, saveVideoEx, success, uploadProgress };
};
