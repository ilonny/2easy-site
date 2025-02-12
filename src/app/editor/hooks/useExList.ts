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

const getDataMapper = (type: string) => {
  switch (type) {
    case "image":
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
