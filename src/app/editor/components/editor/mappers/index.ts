import { TTemplate } from "../../create/ChooseTemplateModal/templates";

export const mapTypeToTitle = (type?: TTemplate["type"]) => {
  if (!type) {
    return "";
  }
  switch (type) {
    case "image":
      return "Изображение";
    default:
      return type;
  }
};
