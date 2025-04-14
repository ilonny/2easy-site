import { BASE_URL, fetchGet, fetchPostJson } from "@/api";
import { useCallback, useState } from "react";

const mapImageExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};
  if (parsedData?.attachments) {
    parsedData.images = parsedData.attachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  return parsedData;
};

const mapTextDefaultExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  if (parsedData?.bgAttachments) {
    parsedData.images = parsedData.bgAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  return parsedData;
};

const mapText2ColExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  if (parsedData?.bgAttachments) {
    parsedData.images = parsedData.bgAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }

  if (parsedData?.secondEditorAttachments) {
    parsedData.secondEditorImages = parsedData.secondEditorAttachments?.map(
      (a) => {
        return {
          ...a,
          dataURL: BASE_URL + "/" + a?.path,
        };
      }
    );
  }
  return parsedData;
};

const mapTextStickerExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  if (parsedData?.bgAttachments) {
    parsedData.images = parsedData.bgAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }

  return parsedData;
};

const mapAudioExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  if (parsedData?.bgAttachments) {
    parsedData.images = parsedData.bgAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }
  return parsedData;
};

const mapNoteExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  return parsedData;
};

const mapFillGapsSelectEx = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};

  if (parsedData?.bgAttachments) {
    parsedData.images = parsedData.bgAttachments?.map((a) => {
      return {
        ...a,
        dataURL: BASE_URL + "/" + a?.path,
      };
    });
  }

  return parsedData;
};

const getDataMapper = (type: string) => {
  switch (type) {
    case "image":
      return mapImageExData;
    case "text-default":
      return mapTextDefaultExData;
    case "text-2-col":
      return mapText2ColExData;
    case "text-sticker":
      return mapTextStickerExData;
    case "text-checklist":
      return mapTextDefaultExData;
    case "video":
      return mapTextDefaultExData;
    case "audio":
      return mapAudioExData;
    case "note":
      return mapNoteExData;
    case "fill-gaps-select":
      return mapFillGapsSelectEx;
    case "match-word-image":
      return mapImageExData;
    default:
      return (_data?: string) => (_data ? JSON.parse(_data) : {});
  }
};

export const useExList = (lesson_id: number) => {
  const [exListIsLoading, setExListIsLoading] = useState(false);
  const [exList, setExList] = useState([]);

  const getExList = useCallback(async () => {
    setExListIsLoading(true);
    const listRes = await fetchGet({
      path: `/ex/list?lesson_id=${lesson_id}`,
      isSecure: true,
    });
    const list = await listRes?.json();
    const mappedList = list
      ?.map((l, index) => {
        const dataMapper = getDataMapper(l.type);
        return {
          ...l,
          data: dataMapper(l.data),
          sortIndex: l.sortIndex,
        };
      })
      ?.sort((a, b) => {
        if (a.sortIndex < b.sortIndex) return -1;
        if (a.sortIndex > b.sortIndex) return 1;
        return 0;
      });

    setExList(mappedList || []);
    setExListIsLoading(false);
  }, []);

  const changeSortIndex = useCallback(
    async (exId: number, newSortIndex: number) => {
      await fetchPostJson({
        path: "/ex/change-sort-index",
        isSecure: true,
        data: {
          id: exId,
          sortIndex: newSortIndex,
        },
      });
    },
    []
  );

  const deleteEx = useCallback(async (exId: number) => {
    await fetchPostJson({
      path: "/ex/delete",
      isSecure: true,
      data: {
        id: exId,
      },
    });
  }, []);

  return { exListIsLoading, exList, getExList, changeSortIndex, deleteEx };
};
