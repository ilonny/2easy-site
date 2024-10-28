export const getTokenFromLocalStorage = () => localStorage.getItem("token");
export const setTokenToLocalStorage = (token: string) =>
  localStorage.setItem("token", token);

export const readFromLocalStorage = (key: string) => localStorage.getItem(key);
export const writeToLocalStorage = (key: string, value: string) =>
  localStorage.setItem(key, value);
