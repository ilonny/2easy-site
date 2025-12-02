import { TField } from "../types";

export const findFieldById = (fields: TField[], fieldId: string) =>
  fields.find((f) => f.id === fieldId);
