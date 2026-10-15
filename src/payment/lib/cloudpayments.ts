"use client";

const CLOUDPAYMENTS_SRC =
  "https://widget.cloudpayments.ru/bundles/cloudpayments.js";
const CLOUDPAYMENTS_LOAD_TIMEOUT_MS = 20000;

type CloudPaymentsWindow = Window & {
  cp?: { CloudPayments: new () => any };
};

let loadingPromise: Promise<void> | null = null;

function isLoaded() {
  return typeof (window as CloudPaymentsWindow).cp?.CloudPayments === "function";
}

export function loadCloudPayments(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("CloudPayments is browser-only"));
  }
  if (isLoaded()) return Promise.resolve();
  if (loadingPromise) return loadingPromise;

  loadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = CLOUDPAYMENTS_SRC;
    script.async = true;

    const fail = (error: Error) => {
      clearTimeout(timer);
      script.remove();
      loadingPromise = null;
      reject(error);
    };
    const timer = setTimeout(
      () => fail(new Error("CloudPayments load timeout")),
      CLOUDPAYMENTS_LOAD_TIMEOUT_MS,
    );

    script.onload = () => {
      if (!isLoaded()) {
        fail(new Error("CloudPayments widget is unavailable"));
        return;
      }
      clearTimeout(timer);
      resolve();
    };
    script.onerror = () => fail(new Error("CloudPayments load failed"));

    document.head.appendChild(script);
  });

  return loadingPromise;
}

export async function createCloudPaymentsWidget() {
  await loadCloudPayments();
  const Ctor = (window as CloudPaymentsWindow).cp!.CloudPayments;
  return new Ctor();
}
