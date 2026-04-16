"use client";

import { T } from "@/i18n/T";

export default function Custom404() {
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
        <T k="404.title" />
        <br />
        <T k="404.returnTo" />{" "}
        <a style={{ color: "#3f28c6", textDecoration: "underline" }} href="/">
          <T k="404.goHome" />
        </a>{" "}
        <T k="404.moreInteresting" />
      </h2>
    </div>
  );
}
