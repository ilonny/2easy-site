export const getTokenFromLocalStorage = () => localStorage.getItem("token");
export const setTokenToLocalStorage = (token: string) =>
  localStorage.setItem("token", token);
