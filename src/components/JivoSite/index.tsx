"use client";

import Script from "next/script";
import { useCallback, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";

const JIVO_SCRIPT_SRC = "https://code.jivo.ru/widget/6qGntLRCf8";

function shouldHideJivoChat(pathname: string | null) {
  return (
    !!pathname?.includes("/lessons/") || !!pathname?.includes("/grammar/")
  );
}

function hideJivoElements() {
  document.querySelectorAll("jdiv").forEach((node) => {
    const el = node as HTMLElement;
    el.style.setProperty("display", "none", "important");
    el.style.setProperty("visibility", "hidden", "important");
    el.style.setProperty("pointer-events", "none", "important");
    el.style.setProperty("opacity", "0", "important");
  });
}

function showJivoElements() {
  document.querySelectorAll("jdiv").forEach((node) => {
    const el = node as HTMLElement;
    el.style.removeProperty("display");
    el.style.removeProperty("visibility");
    el.style.removeProperty("pointer-events");
    el.style.removeProperty("opacity");
  });
}

export const JivoSite = () => {
  const path = usePathname();
  const hideChat = useMemo(() => shouldHideJivoChat(path), [path]);

  const applyVisibility = useCallback(() => {
    const w = window as Window & {
      jivo_destroy?: () => void;
      jivo_init?: () => void;
      jivo_onLoadCallback?: () => void;
      __jivoHideChat?: boolean;
    };

    w.__jivoHideChat = hideChat;

    if (hideChat) {
      hideJivoElements();
      if (typeof w.jivo_destroy === "function") {
        try {
          w.jivo_destroy();
        } catch {
          // ignore jivo API errors
        }
      }
      return;
    }

    showJivoElements();
    if (typeof w.jivo_init === "function") {
      try {
        w.jivo_init();
      } catch {
        // ignore jivo API errors
      }
    }
  }, [hideChat]);

  useEffect(() => {
    document.body.classList.toggle("jivo-chat-hidden", hideChat);
    return () => {
      document.body.classList.remove("jivo-chat-hidden");
    };
  }, [hideChat]);

  useEffect(() => {
    const w = window as Window & {
      jivo_onLoadCallback?: () => void;
      __jivoHideChat?: boolean;
    };

    const previousCallback = w.jivo_onLoadCallback;
    w.jivo_onLoadCallback = function jivoOnLoadCallback() {
      if (w.__jivoHideChat) {
        hideJivoElements();
        const api = window as Window & { jivo_destroy?: () => void };
        if (typeof api.jivo_destroy === "function") {
          try {
            api.jivo_destroy();
          } catch {
            // ignore jivo API errors
          }
        }
      }
      previousCallback?.();
    };

    return () => {
      w.jivo_onLoadCallback = previousCallback;
    };
  }, []);

  useEffect(() => {
    applyVisibility();

    const observer = new MutationObserver(() => {
      if (hideChat) {
        hideJivoElements();
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, [applyVisibility, hideChat]);

  return <Script src={JIVO_SCRIPT_SRC} strategy="afterInteractive" />;
};
