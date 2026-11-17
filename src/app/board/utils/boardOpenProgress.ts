export const publishBoardProgress = (
  progress: number | null,
  stage: "download" | "ready" | "error",
) => {
  if (typeof window === "undefined") return;
  const bridge = (
    window as Window & { ReactNativeWebView?: { postMessage: (data: string) => void } }
  ).ReactNativeWebView;
  if (!bridge?.postMessage) return;
  bridge.postMessage(
    JSON.stringify({
      type: "board-progress",
      progress: progress == null ? 0 : Math.max(0, Math.min(100, Math.round(progress))),
      stage,
    }),
  );
};
