"use client";

import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

const TALK_ME_DOM_SELECTORS = [
  'iframe[src*="site-chat.me"]',
  'iframe[src*="me-talk.ru"]',
  'iframe[src*="talk-me.ru"]',
  'iframe[src*="widget.me-talk.ru"]',
  '[id*="talkme"]',
  '[id*="me-talk"]',
  '[class*="me-talk"]',
  '[class*="talkme"]',
];

type TalkMeApi = ((command: string, ...args: unknown[]) => void) & {
  q?: unknown[][];
};

type TalkMeWindow = Window & {
  TalkMe?: TalkMeApi;
};

function shouldHideSiteChat(pathname: string | null) {
  return (
    !!pathname?.includes("/lessons/") || !!pathname?.includes("/grammar/")
  );
}

function ensureTalkMeQueue() {
  const w = window as TalkMeWindow;
  if (typeof w.TalkMe === "function") {
    return;
  }

  const talkMe = ((command: string, ...args: unknown[]) => {
    (talkMe.q = talkMe.q || []).push([command, ...args]);
  }) as TalkMeApi;

  w.TalkMe = talkMe;
}

function callTalkMe(command: string, ...args: unknown[]) {
  ensureTalkMeQueue();

  try {
    (window as TalkMeWindow).TalkMe!(command, ...args);
  } catch {
    // ignore Talk-Me API errors
  }
}

function forEachTalkMeElement(callback: (el: HTMLElement) => void) {
  TALK_ME_DOM_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => {
      callback(node as HTMLElement);
    });
  });
}

function hideTalkMeElements() {
  forEachTalkMeElement((el) => {
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
    el.style.setProperty("opacity", "0", "important");
  });
}

function showTalkMeElements() {
  forEachTalkMeElement((el) => {
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("opacity");
  });
}

export const TalkMeSite = () => {
  const path = usePathname();
  const hideChat = useMemo(() => shouldHideSiteChat(path), [path]);

  const applyVisibility = useCallback(() => {
    if (hideChat) {
      hideTalkMeElements();
      callTalkMe("closeSupport");
      callTalkMe("hideTrigger");
      return;
    }

    showTalkMeElements();
    callTalkMe("showTrigger");
  }, [hideChat]);

  useEffect(() => {
    document.body.classList.toggle("site-chat-hidden", hideChat);
    return () => {
      document.body.classList.remove("site-chat-hidden");
    };
  }, [hideChat]);

  useEffect(() => {
    applyVisibility();

    const observer = new MutationObserver(() => {
      if (hideChat) {
        hideTalkMeElements();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [applyVisibility, hideChat]);

  return null;
};
