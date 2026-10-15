"use client";

import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { AuthContext } from "@/auth";
import { TProfile } from "@/auth/types";
import i18n from "@/i18n/config";
import { hangupJitsiSession } from "./jitsiSession";
import {
  getVideoCallOpen,
  getVideoCallServerSnapshot,
  hydrateVideoCallStore,
  setVideoCallOpen,
  subscribeVideoCall,
} from "./videoCallStore";

export function resolveTeacherUserId(profile?: TProfile): string | null {
  if (!profile) return null;
  if (profile.isStudent) {
    const teacherId = profile.user_id;
    if (teacherId == null || teacherId === "") return null;
    return String(teacherId);
  }
  if (profile.id == null) return null;
  return String(profile.id);
}

/** Stable per-teacher room so navigation stays on the same call. */
export function buildTeacherRoomName(teacherUserId: string) {
  return `2easy-t-${teacherUserId}`;
}

type VideoCallContextValue = {
  isOpen: boolean;
  canOpen: boolean;
  roomName: string;
  displayName: string;
  open: () => void;
  close: () => void;
};

const VideoCallContext = createContext<VideoCallContextValue>({
  isOpen: false,
  canOpen: false,
  roomName: "",
  displayName: "",
  open: () => undefined,
  close: () => undefined,
});

export const useVideoCall = () => useContext(VideoCallContext);

export const VideoCallProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { profile, isAuthorized, authIsLoading } = useContext(AuthContext);

  useEffect(() => {
    hydrateVideoCallStore();
  }, []);

  const isOpen = useSyncExternalStore(
    subscribeVideoCall,
    getVideoCallOpen,
    getVideoCallServerSnapshot
  );

  const teacherUserId = resolveTeacherUserId(profile);
  const roomName = useMemo(() => {
    if (!teacherUserId) return "";
    return buildTeacherRoomName(teacherUserId);
  }, [teacherUserId]);
  const displayName =
    [profile?.name, profile?.surname].filter(Boolean).join(" ") ||
    profile?.login ||
    i18n.t("profile.participant");

  const canOpen = Boolean(teacherUserId);

  const open = useCallback(() => {
    if (!teacherUserId) return;
    setVideoCallOpen(true);
  }, [teacherUserId]);

  const close = useCallback(() => {
    hangupJitsiSession();
    setVideoCallOpen(false);
  }, []);

  // Close only after auth has resolved — avoid wiping sessionStorage-open
  // while profile is still the initial `{}` during localStorage hydrate.
  useEffect(() => {
    if (authIsLoading) return;
    if (!isAuthorized) {
      hangupJitsiSession();
      setVideoCallOpen(false);
    }
  }, [authIsLoading, isAuthorized]);

  useEffect(() => {
    if (authIsLoading) return;
    if (isOpen && !teacherUserId) {
      hangupJitsiSession();
      setVideoCallOpen(false);
    }
  }, [authIsLoading, isOpen, teacherUserId]);

  const value = useMemo(
    () => ({
      isOpen,
      canOpen,
      roomName,
      displayName,
      open,
      close,
    }),
    [isOpen, canOpen, roomName, displayName, open, close]
  );

  return (
    <VideoCallContext.Provider value={value}>
      {children}
    </VideoCallContext.Provider>
  );
};
