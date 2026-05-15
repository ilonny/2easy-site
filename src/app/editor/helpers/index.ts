import { BASE_URL } from "@/api";

export const uuidv4 = () => {
  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) =>
    (
      +c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))
    ).toString(16),
  );
};

export const getImageUrl = (path?: string) => {
  if (!path) {
    return "";
  }

  // Already absolute (API sometimes stores full URLs; avoid "BASE_URL/https://...")
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  if (path.includes("608dfa18-3eae-4574-a997-0a7441c16d33.selstorage.ru")) {
    return path;
  }
  return BASE_URL + "/" + path;
};

export const filterExBgAttachments = (i) => {
  // Legacy helper: already persisted attachment (local uploads or S3).
  return !filterImagesToUpload(i) && (!!i?.id || !!i?.path);
};

export const filterImagesToUpload = (i) => {
  // Upload only "new" images:
  // - local files picked from computer (have `file`)
  // - remote http(s) images that are not yet saved (no `id`/`path`)
  // Already saved attachments (have `id` or `path`) must NOT be re-uploaded.
  if (!!i?.file) {
    return true;
  }

  if (!!i?.id || !!i?.path) {
    return false;
  }

  const url = i?.dataURL;
  return typeof url === "string" && /^https?:\/\//i.test(url);
};

/** Build attachments array: keep saved images, upload and append new ones. */
export const persistExerciseAttachments = (
  images: any[] | undefined,
  savedUploadResponse?: { attachments?: Array<any | null> },
) => {
  const list = images || [];
  const result: any[] = [];
  let newUploadIndex = 0;

  list.forEach((img) => {
    if (!filterImagesToUpload(img)) {
      const path = img?.path || img?.dataURL;
      if (path || img?.id) {
        result.push({
          id: img?.id,
          path,
          text: img?.text || "",
        });
      }
      return;
    }

    const saved = savedUploadResponse?.attachments?.[newUploadIndex];
    newUploadIndex++;
    if (saved?.path) {
      result.push({
        id: saved?.id,
        path: saved?.path,
        text: img?.text || "",
      });
    }
  });

  return result;
};
