import {TField} from "@/app/editor/components/editor/FillGapsInput/types";

export const findFieldById = (fields: TField[], fieldId: string) =>
    fields.find((f) => f.id === fieldId);
