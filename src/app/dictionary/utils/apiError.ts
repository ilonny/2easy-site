import i18n from "@/i18n/config";

export const parseApiErrorMessage = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || i18n.t("commonErrors.somethingWentWrong");
  } catch {
    return i18n.t("commonErrors.somethingWentWrong");
  }
};
