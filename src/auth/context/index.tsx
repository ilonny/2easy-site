"use client";
import { createContext, useEffect, useState } from "react";
import { readFromLocalStorage } from "../utils";

export const AuthContext = createContext({});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState({});
  useEffect(() => {
    const profile = readFromLocalStorage("profile");
    if (profile) {
      setProfile(JSON.parse(profile));
    }
  }, []);
  return (
    <AuthContext.Provider value={{ profile, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
