"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import styles from "./styles.module.css";

const CONSENT_STORAGE_KEY = "2easy-cookie-consent";

export const CookieConsent = () => {
  const { t, i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const isEn = (i18n.resolvedLanguage || i18n.language || "ru")
    .toLowerCase()
    .startsWith("en");
  const policyHref = isEn ? "/cookie_policy" : "/privacy_policy";

  useEffect(() => {
    try {
      const accepted = localStorage.getItem(CONSENT_STORAGE_KEY);
      if (!accepted) {
        setIsVisible(true);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, "1");
    } catch {
      // ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <section className={styles.banner} aria-live="polite">
      <div className={styles.container}>
        <div
          className={styles.panel}
          role="dialog"
          aria-label={t("cookieConsent.ariaLabel", {
            defaultValue: "Согласие на cookie",
          })}
        >
          <div className={styles.textWrap}>
            <p className={styles.text}>
              <Trans
                i18nKey="cookieConsent.message"
                defaults='Нажимая «Окей», вы даёте согласие на обработку файлов cookie в соответствии с <1>Политикой конфиденциальности</1>.'
                components={{
                  1: (
                    <Link
                      href={policyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.link}
                    />
                  ),
                }}
              />
            </p>
          </div>
          <button className={styles.okButton} type="button" onClick={accept}>
            {t("cookieConsent.accept", { defaultValue: "Окей" })}
          </button>
        </div>
      </div>
    </section>
  );
};
