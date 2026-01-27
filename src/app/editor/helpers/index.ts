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

  if (path.includes("608dfa18-3eae-4574-a997-0a7441c16d33.selstorage.ru")) {
    return path;
  }
  return BASE_URL + "/" + path;
};
