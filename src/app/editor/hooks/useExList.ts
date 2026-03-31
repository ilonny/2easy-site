import { fetchGet, fetchPostJson } from "@/api";
import { useCallback, useRef, useState } from "react";
import { getImageUrl } from "../helpers";

const mapImageExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};
  if (parsedData?.attachments) {
    parsedData.images = parsedData.attachments?.map((a) => {
      return {
        ...a,
        dataURL: getImageUrl(a.path),
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
        dataURL: getImageUrl(a.path),
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: getImageUrl(a.path),
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
        dataURL: getImageUrl(a.path),
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: getImageUrl(a.path),
      };
    });
  }

  if (parsedData?.secondEditorAttachments) {
    parsedData.secondEditorImages = parsedData.secondEditorAttachments?.map(
      (a) => {
        return {
          ...a,
          dataURL: getImageUrl(a.path),
        };
      },
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
        dataURL: getImageUrl(a.path),
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
        dataURL: getImageUrl(a.path),
      };
    });
  }
  if (parsedData?.editorAttachments) {
    parsedData.editorImages = parsedData.editorAttachments?.map((a) => {
      return {
        ...a,
        dataURL: getImageUrl(a.path),
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
        dataURL: getImageUrl(a.path),
      };
    });
  }

  return parsedData;
};

const mapFillGapsNewExData = (data: string) => {
  const parsedData = data ? JSON.parse(data) : {};
  if (typeof parsedData?.title !== "string") {
    parsedData.title = "Let's practice!";
  }
  if (typeof parsedData?.titleColor !== "string") {
    parsedData.titleColor = "#3F28C6";
  }
  if (typeof parsedData?.subtitle !== "string") {
    parsedData.subtitle = "Fill in the gaps with the correct words";
  }
  if (typeof parsedData?.description !== "string") {
    parsedData.description = "";
  }
  if (!Array.isArray(parsedData?.images)) {
    // keep backward compat with other tasks that store attachments under bgAttachments
    if (Array.isArray(parsedData?.bgAttachments)) {
      parsedData.images = parsedData.bgAttachments?.map((a) => {
        return {
          ...a,
          dataURL: getImageUrl(a.path),
        };
      });
    } else {
      parsedData.images = [];
    }
  }
  // Ensure image objects have dataURL for rendering (viewer uses it)
  if (Array.isArray(parsedData?.images)) {
    parsedData.images = parsedData.images.map((img) => {
      if (img?.dataURL) return img;
      if (img?.path) {
        return { ...img, dataURL: getImageUrl(img.path) };
      }
      return img;
    });
  }
  if (typeof parsedData?.mode !== "string") {
    parsedData.mode = "input";
  }
  if (!Array.isArray(parsedData?.content)) {
    parsedData.content = [];
  }
  if (!Array.isArray(parsedData?.gaps)) {
    parsedData.gaps = [];
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
    case "fill-gaps-input":
      return mapFillGapsSelectEx;
    case "fill-gaps-drag":
      return mapFillGapsSelectEx;
    case "FILL_GAPS_NEW":
      return mapFillGapsNewExData;
    case "match-word-word":
      return mapFillGapsSelectEx;
    case "match-word-column":
      return mapFillGapsSelectEx;
    case "match-word-image":
      return mapImageExData;
    case "int":
      return mapTextDefaultExData;
    default:
      return mapImageExData;
  }
};

export const useExList = (lesson_id?: number, isPresentationMode?: boolean) => {
  const [exListIsLoading, setExListIsLoading] = useState(false);
  const [exList, setExList] = useState([]);
  const inFlightRef = useRef<Promise<any> | null>(null);
  const inFlightKeyRef = useRef<string>("");

  const getExList = useCallback(
    async (_lesson_id?: number, hash?: string) => {
      const key = `${_lesson_id || lesson_id || ""}|${hash || ""}|${
        isPresentationMode ? "1" : "0"
      }`;

      // If the exact same request is already running, reuse it.
      if (inFlightRef.current && inFlightKeyRef.current === key) {
        return await inFlightRef.current;
      }

      setExListIsLoading(true);
      inFlightKeyRef.current = key;
      const p = (async () => {
        try {
          const listRes = await fetchGet({
            path: `/ex/list?lesson_id=${
              _lesson_id || lesson_id
            }&hash=${hash || ""}`,
            isSecure: true,
          });
          const list = await listRes?.json();
          if (!list?.map) {
            setExList([]);
            return list;
          }
          let mappedList = list
            ?.map((l) => {
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
          if (isPresentationMode) {
            mappedList = mappedList.filter(
              (l) =>
                l.is_visible === null ||
                l.is_visible === "1" ||
                l.is_visible === 1,
            );
          }
          setExList(mappedList || []);
          return list;
        } finally {
          // Only clear if this is still the latest request key
          if (inFlightKeyRef.current === key) {
            inFlightRef.current = null;
          }
          setExListIsLoading(false);
        }
      })();

      inFlightRef.current = p;
      return await p;
    },
    [isPresentationMode, lesson_id],
  );

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
    [],
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

  return {
    exListIsLoading,
    exList,
    getExList,
    changeSortIndex,
    deleteEx,
    setExList,
  };
};
