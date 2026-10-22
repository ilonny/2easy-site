import { fetchGet } from "@/api";
import { useCallback, useState } from "react";

export const useGroupList = () => {
  const [groups, setGroups] = useState([]);

  const getGroups = useCallback(async () => {
    const res = await fetchGet({
      path: "/group",
      isSecure: true,
      workspaceScope: "personal",
    });
    const groups = await res?.json();
    setGroups(groups);
  }, []);

  return { groups, getGroups };
};
