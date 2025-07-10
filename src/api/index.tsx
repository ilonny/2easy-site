"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getTokenFromLocalStorage } from "@/auth/utils";
import { toast } from "react-toastify";
import Router from "next/router";

export const ApiProvider = ({ children }) => {
  const [client] = useState(new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(
  "/undefined",
  ""
);
// export const BASE_URL = "https://d2b9lzt8-8888.euw.devtunnels.ms";

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
};

const mapHeaders = (params: TParams) => {
  const headers: Headers = new Headers();
  const { isSecure } = params;
  headers.append("Content-Type", "application/json");
  if (isSecure) {
    const token = getTokenFromLocalStorage();
    headers.append("Authorization", `Bearer ${token}`);
  }
  return headers;
};

export const checkResponse = (res: {
  success: boolean;
  message?: string;
  successMessage?: string;
}) => {
  if (res?.status === 401 && window.location.pathname !== "/login") {
    window.location.pathname = "/login";
  }
  if (!res?.success) {
    toast(res?.message ? res?.message : "Что-то пошло не так", {
      type: "error",
    });
    return;
  }
  if (res?.success && res?.successMessage) {
    toast(res?.successMessage, {
      type: "success",
    });
  }
};

export const fetchPostJson = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });
};

export const fetchPostMultipart = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  headers.set("Content-Type", "multipart/form-data");
  headers.delete("Content-Type");
  const url = (API_URL + path).replace("/undefined", "");
  return fetch(url, {
    method: "POST",
    body: data,
    headers,
  });
};

export const fetchGet = (params: TParams) => {
  const { path } = params;
  if (params.isSecure && !getTokenFromLocalStorage()) {
    return;
  }
  const headers = mapHeaders(params);
  const url = (API_URL + path).replace("/undefined", "");
  return fetch(url, {
    method: "GET",
    headers,
  });
};
