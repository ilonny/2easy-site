"use client";
import { createContext, useEffect, useState } from "react";
import { getTokenFromLocalStorage } from "../utils";

export const AuthContext = createContext({});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const localToken = getTokenFromLocalStorage();
    if (!localToken) {
      setProfile({});
    }
  }, []);
  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
