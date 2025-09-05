"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const JivoSite = () => {
  const path = usePathname();

  useEffect(() => {
    const jdiv = document?.getElementsByTagName("jdiv")?.[0] || { style: {} };

    if (path?.includes("/lessons/")) {
      jdiv.style.display = "none";
    } else {
      jdiv.style.display = "block";
    }
  }, [path]);

  if (window?.location?.pathname?.includes("lessons/")) {
    return <></>;
  }
  return (
    <>
      <Script src="https://code.jivo.ru/widget/6qGntLRCf8" async />
    </>
  );
};
