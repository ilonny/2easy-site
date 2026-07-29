"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[app/error]", error);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <h2 className="text-xl font-semibold text-default-800">
        Что-то пошло не так
      </h2>
      <p className="text-sm text-default-500">
        Не удалось загрузить эту страницу. Попробуйте ещё раз — данные на
        сервере могли временно быть недоступны.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
      >
        Попробовать снова
      </button>
    </div>
  );
}
