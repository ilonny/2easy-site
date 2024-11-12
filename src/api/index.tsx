"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getTokenFromLocalStorage } from "@/auth/utils";

export const ApiProvider = ({ children }) => {
  const [client] = useState(new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
};

export const API_URL = "http://localhost:8888/api";

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

export const fetchPostJson = (params: TParams) => {
  const { path, data } = params;
  const headers = mapHeaders(params);
  return fetch(API_URL + path, {
    method: "POST",
    body: JSON.stringify(data),
    headers,
  });
};

export const fetchGet = (params: TParams) => {
  const { path } = params;
  if (params.isSecure && !getTokenFromLocalStorage()) {
    return;
  }
  const headers = mapHeaders(params);
  return fetch(API_URL + path, {
    method: "GET",
    headers,
  });
};
