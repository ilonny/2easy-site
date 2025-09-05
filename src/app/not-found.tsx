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
        Этой страницы не существует.
        <br />
        Вернитесь{" "}
        <a style={{ color: "#3f28c6", textDecoration: "underline" }} href="/">
          на главную
        </a>{" "}
        – там много интересного
      </h2>
    </div>
  );
}
