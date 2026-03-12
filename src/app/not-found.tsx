"use client";

import { useTranslation } from "react-i18next";

export default function Custom404() {
  const { t } = useTranslation();
  return (
    <div
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        height: "70vh",
        flexDirection: "column",
        display: "flex",
      }}
    >
      <h1
        className=""
        style={{
          textAlign: "center",
          fontSize: "12rem",
          fontWeight: 600,
          color: "#3f28c6",
        }}
      >
        404
      </h1>
      <h2 className="text-center">
        {t("404.title")}
        <br />
        {t("404.returnTo")}{" "}
        <a style={{ color: "#3f28c6", textDecoration: "underline" }} href="/">
          {t("404.goHome")}
        </a>{" "}
        {t("404.moreInteresting")}
      </h2>
    </div>
  );
}
