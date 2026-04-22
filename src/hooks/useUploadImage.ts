import { checkResponse, fetchPostJson, fetchPostMultipart } from "@/api";
import { useCallback, useState } from "react";
import { ImageListType } from "react-images-uploading";

export const useUploadImage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const uploadImages = useCallback(async (images: ImageListType) => {
    const isRemoteUrl = (value?: string) => !!value && /^https?:\/\//i.test(value);

    const indexed = (images || []).map((img, index) => ({ img, index }));
    const local = indexed.filter(({ img }) => !!img?.file);
    const remote = indexed.filter(
      ({ img }) => !img?.file && isRemoteUrl(img?.dataURL as any),
    );

    // Только файлы с компьютера (FormData)
    if (local.length > 0 && remote.length === 0) {
      const fd = new FormData();
      local.forEach(({ img }) => {
        fd.append("image", img.file as any);
      });

      const res = await fetchPostMultipart({
        path: "/upload-photos",
        data: fd,
        isSecure: true,
      });
      const json = await res.json();
      checkResponse(json);
      return json;
    }

    // Только интернет-картинки по URL
    if (remote.length > 0 && local.length === 0) {
      const res = await fetchPostJson({
        path: "/upload-photos-by-url",
        data: remote.map(({ img }) => img),
        isSecure: true,
      });
      const json = await res.json();
      checkResponse(json);
      return json;
    }

    // Смешанный случай: часть файлов локально, часть по URL.
    // Загружаем отдельно и собираем результат в исходном порядке.
    const attachmentsByIndex: Array<any | null> = new Array(images.length).fill(
      null,
    );

    let warning = false;
    let message: string | undefined;
    const failed: any[] = [];

    if (local.length > 0) {
      const fd = new FormData();
      local.forEach(({ img }) => {
        fd.append("image", img.file as any);
      });
      const resLocal = await fetchPostMultipart({
        path: "/upload-photos",
        data: fd,
        isSecure: true,
      });
      const jsonLocal = await resLocal.json();
      checkResponse(jsonLocal);
      (jsonLocal?.attachments || []).forEach((att: any, i: number) => {
        const originalIndex = local[i]?.index;
        if (typeof originalIndex === "number") {
          attachmentsByIndex[originalIndex] = att;
        }
      });
    }

    if (remote.length > 0) {
      const resRemote = await fetchPostJson({
        path: "/upload-photos-by-url",
        data: remote.map(({ img }) => img),
        isSecure: true,
      });
      const jsonRemote = await resRemote.json();
      checkResponse(jsonRemote);
      warning = warning || !!jsonRemote?.warning;
      message = message || jsonRemote?.message;
      if (Array.isArray(jsonRemote?.failed)) {
        failed.push(...jsonRemote.failed);
      }
      (jsonRemote?.attachments || []).forEach((att: any, i: number) => {
        const originalIndex = remote[i]?.index;
        if (typeof originalIndex === "number") {
          attachmentsByIndex[originalIndex] = att;
        }
      });
    }

    const mixedResult = {
      success: true,
      attachments: attachmentsByIndex,
      warning,
      message,
      failed,
    };
    checkResponse(mixedResult);
    return mixedResult;
  }, []);

  return { isLoading, uploadImages };
};
