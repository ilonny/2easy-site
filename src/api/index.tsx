"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { toast } from "react-toastify";

export const ApiProvider = ({ children }) => {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            throwOnError: false,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
            throwOnError: false,
          },
        },
      })
  );

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};
// console.log("process.env?", process.env);
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(
  "/undefined",
  ""
);
// console.log("BASE_URL", BASE_URL);
// export const BASE_URL = "http://localhost:8888";
// export const BASE_URL = "https://beta-api.2easyeng.com";

export const API_URL = BASE_URL + "/api";

export const getFormData = (object) =>
  Object.keys(object).reduce((formData, key) => {
    formData.append(key, object[key]);
    return formData;
  }, new FormData());

type TParams = {
  path: string;
  data?: any;
  isSecure?: boolean;
  signal?: AbortSignal;
};

const SERVER_UNAVAILABLE_MESSAGE =
  "Сервер временно недоступен. Попробуйте позже";
const INVALID_RESPONSE_MESSAGE = "Некорректный ответ сервера";

const mapHeaders = (params: TParams) => {
  const headers: Headers = new Headers();
  const { isSecure } = params;
  headers.append("Content-Type", "application/json");
  if (isSecure) {
    const token = getTokenFromLocalStorage();
    headers.append("Authorization", `Bearer ${token || ""}`);
  }
  return headers;
};

const defaultMessageForStatus = (status: number) => {
  if (status >= 500) return SERVER_UNAVAILABLE_MESSAGE;
  if (status === 401) return "Ошибка авторизации, пожалуйста, авторизуйтесь заново";
  return "Что-то пошло не так";
};

/**
 * Wraps a fetch Response so `.json()` never throws on HTML/empty 500 bodies
 * and always returns a `{ success, status, message, ... }` shaped object on errors.
 */
const withSafeJson = async (res: Response): Promise<Response> => {
  const text = await res.text();
  let parsed: any = null;
  let parseFailed = false;

  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parseFailed = true;
      parsed = null;
    }
  } else {
    parsed = {};
  }

  let data: any;
  if (parseFailed) {
    data = {
      success: false,
      status: res.status,
      message:
        res.status >= 500 ? SERVER_UNAVAILABLE_MESSAGE : INVALID_RESPONSE_MESSAGE,
    };
  } else if (!res.ok) {
    const base =
      parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    data = {
      ...base,
      success: false,
      status: base.status ?? res.status,
      message: base.message || defaultMessageForStatus(res.status),
    };
  } else {
    data = parsed;
  }

  const safeResponse = {
    ok: res.ok,
    status: res.status,
    statusText: res.statusText,
    headers: res.headers,
    url: res.url,
    redirected: res.redirected,
    type: res.type,
    bodyUsed: true,
    json: async () => data,
    text: async () => text,
    clone: () => safeResponse as unknown as Response,
  };

  return safeResponse as unknown as Response;
};

const safeFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> => {
  try {
    const res = await fetch(input, init);
    return withSafeJson(res);
  } catch (error) {
    if ((error as DOMException)?.name === "AbortError") {
      throw error;
    }
    return {
      ok: false,
      status: 0,
      statusText: "Network Error",
      headers: new Headers(),
      url: String(input),
      redirected: false,
      type: "error",
      bodyUsed: true,
      json: async () => ({
        success: false,
        status: 0,
        message: SERVER_UNAVAILABLE_MESSAGE,
      }),
      text: async () => "",
      clone() {
        return this as unknown as Response;
      },
    } as unknown as Response;
  }
};

export const checkResponse = (
  res: {
    success: boolean;
    message?: string;
    successMessage?: string;
    warning?: boolean;
    status?: number;
    needRedirect?: boolean | string;
    needSubscription?: boolean;
  },
  skipToast?: boolean
) => {
  if (res?.status === 401 && window.location.pathname !== "/login") {
    window.location.pathname = "/login";
    return;
  }
  if (skipToast) {
    return;
  }
  if (res?.success && res?.warning) {
    toast(res?.message ? res?.message : "Что-то пошло не так", {
      type: "error",
    });
    return;
  }
  if (!res?.success) {
    toast(res?.message ? res?.message : "Что-то пошло не так", {
      type: "error",
    });
    if (res?.needSubscription) {
      window.location.pathname = "/subscription";
      return;
    }
    if (res?.needRedirect) {
      window.location.pathname =
        typeof res.needRedirect === "string" ? res.needRedirect : "/";
    }
    return;
  }
  if (res?.success && res?.successMessage) {
    toast(res?.successMessage, {
      type: "success",
    });
  }
};

export const fetchPostJson = (params: TParams) => {
  const { path, data, signal } = params;
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return safeFetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
    signal,
  });
};

export const fetchPostBlob = (params: TParams) => fetchPostJson(params);

export const fetchPostMultipart = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  headers.set("Content-Type", "multipart/form-data");
  headers.delete("Content-Type");
  const url = (API_URL + path).replace("/undefined", "");
  return safeFetch(url, {
    method: "POST",
    body: data,
    headers,
  });
};

export type TUploadProgress = {
  loaded: number;
  total: number;
};

/** Multipart upload with byte progress (XHR). Resolves with parsed JSON body. */
export const fetchPostMultipartWithProgress = (params: {
  path: string;
  data: FormData;
  isSecure?: boolean;
  onProgress?: (progress: TUploadProgress) => void;
  signal?: AbortSignal;
}): Promise<any> => {
  const { path, data, isSecure, onProgress, signal } = params;
  const url = (API_URL + path).replace("/undefined", "");

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    if (isSecure) {
      const token = getTokenFromLocalStorage();
      xhr.setRequestHeader("Authorization", `Bearer ${token || ""}`);
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return;
      onProgress?.({ loaded: event.loaded, total: event.total });
    };

    xhr.onload = () => {
      let json: any = null;
      try {
        json = JSON.parse(xhr.responseText || "{}");
      } catch {
        json = {
          success: false,
          message:
            xhr.status >= 500
              ? SERVER_UNAVAILABLE_MESSAGE
              : INVALID_RESPONSE_MESSAGE,
          status: xhr.status,
        };
      }
      if (!xhr.status || xhr.status >= 400) {
        json = {
          ...(json && typeof json === "object" ? json : {}),
          success: false,
          status: xhr.status,
          message:
            json?.message ||
            (xhr.status >= 500
              ? SERVER_UNAVAILABLE_MESSAGE
              : "Что-то пошло не так"),
        };
      }
      if (xhr.status === 401) {
        json = { ...json, status: 401, success: false };
      }
      resolve(json);
    };

    xhr.onerror = () => {
      resolve({
        success: false,
        status: 0,
        message: SERVER_UNAVAILABLE_MESSAGE,
      });
    };

    xhr.onabort = () => {
      reject(new DOMException("Aborted", "AbortError"));
    };

    if (signal) {
      if (signal.aborted) {
        xhr.abort();
        return;
      }
      signal.addEventListener("abort", () => xhr.abort(), { once: true });
    }

    xhr.send(data);
  });
};

export const fetchGet = (params: TParams) => {
  const { path } = params;
  // if (params.isSecure && !getTokenFromLocalStorage()) {
  //   return;
  // }
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return safeFetch(url, {
    method: "GET",
    headers,
  });
};

export const fetchPatch = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return safeFetch(url, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers,
  });
};

export const fetchDelete = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return safeFetch(url, {
    method: "DELETE",
    body: JSON.stringify(data),
    headers,
  });
};
