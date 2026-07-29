"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app/global-error]", error);

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          fontFamily:
            "Manrope, system-ui, -apple-system, Segoe UI, sans-serif",
          background: "#f7f7f8",
          color: "#1f2937",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h2 style={{ fontSize: 22, margin: 0 }}>Что-то пошло не так</h2>
          <p style={{ margin: 0, maxWidth: 420, color: "#6b7280" }}>
            Приложение столкнулось с ошибкой. Попробуйте обновить страницу.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              border: 0,
              borderRadius: 8,
              background: "#006FEE",
              color: "#fff",
              padding: "10px 16px",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Попробовать снова
          </button>
        </div>
      </body>
    </html>
  );
}
