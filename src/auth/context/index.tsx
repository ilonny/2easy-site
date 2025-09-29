"use client";
import { createContext, useEffect, useMemo, useState } from "react";
import { readFromLocalStorage } from "../utils";
import { TProfile } from "../types";

type TContextValue = {
  isAuthorized: boolean;
  profile?: TProfile;
  setProfile?: (p: TProfile) => void;
  authIsLoading: boolean;
  isStudent?: boolean;
  createLessonModalIsVisible: boolean;
  setCreateLessonModalIsVisible: (val) => void;
};

export const AuthContext = createContext<TContextValue>({
  isAuthorized: false,
  authIsLoading: true,
});

export const AuthContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profile, setProfile] = useState<TProfile>({});
  const [authIsLoading, setAuthIsLoading] = useState(true);

  const [createLessonModalIsVisible, setCreateLessonModalIsVisible] =
    useState(false);

  const isAuthorized = useMemo(() => {
    return !!profile?.login;
  }, [profile?.login]);

  useEffect(() => {
    const profile = readFromLocalStorage("profile");
    setAuthIsLoading(false);
    if (profile) {
      setProfile(JSON.parse(profile));
      return;
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{
        profile,
        setProfile,
        isAuthorized,
        authIsLoading,
        createLessonModalIsVisible,
        setCreateLessonModalIsVisible,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
