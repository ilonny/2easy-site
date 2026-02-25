export const getTokenFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

export const setTokenToLocalStorage = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", token);
  }
};

export const readFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return localStorage.getItem(key);
  }
  return null;
};

export const writeToLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, value);
  }
};
