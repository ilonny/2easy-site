"use client";
import { AuthContext } from "@/auth";
import { useRouter } from "next/navigation";
import { FC, useContext, useEffect } from "react";
import { useCheckSubscription } from "./subscription/helpers";

export const BodyContainer: FC<any> = ({ children }) => {
  const { profile } = useContext(AuthContext);
  const router = useRouter();
  const { checkSubscription, subscription } = useCheckSubscription();

  useEffect(() => {
    // Логика перенаправления для студентов
    if (
      profile?.isStudent &&
      !window?.location?.pathname?.includes("/lessons/") &&
      !window?.location?.pathname?.includes("/login") &&
      !window?.location?.pathname?.includes("/taboo") &&
      !window?.location?.pathname?.includes("course") &&
      !window?.location?.pathname?.includes("student-account")
    ) {
      router.push(`/student-account/${profile.studentId}`);
    }

    // Вставка скрипта WebAsk при условии subscription?.subscribe_type_id !== 1
    if (subscription?.subscribe_type_id !== 1) {
      // Проверяем, не загружен ли скрипт уже
      if (!window.WebAsk) {
        (function (s, u, r, v, e, y) {
          s[u] = s[u] || r;
          s[u].b.push({
            id: ["a46253", "8j5h7hbg4"],
            type: "widget",
            mode: "side",
            position: "right",
            preventReopenOnClose: true,
            closeOnSubmit: true,
            panelWidth: 400,
            panelHeight: 580,
            buttonText: "Поделись своим мнением",
            buttonColor: "rgba(39, 116, 248, 1)",
            buttonTextColor: "rgba(255, 255, 255, 1)",
            flags: ["stopLead", "stopMobile"],
          });
          v.async = true;
          v.src = e + y;
          document.querySelector("head").appendChild(v);
        })(
          window,
          "WebAsk",
          { b: [] },
          document.createElement("script"),
          "https:",
          "//app.webask.io/static/api-v2.js",
        );
      }
    }
  }, [
    profile?.isStudent,
    profile.studentId,
    router,
    subscription?.subscribe_type_id, // Добавляем в зависимости для отслеживания изменений
  ]);

  return <>{children}</>;
};
