"use client";
import { useContext, useEffect, useId, useRef, useState } from "react";
import { AuthContext } from "@/auth";

import { fetchPostJson } from "@/api";
import { writeToLocalStorage } from "@/auth/utils";
import { usePathname, useRouter } from "next/navigation";
import ChevronDown from "@/assets/icons/chevron_down.svg";
import Image from "next/image";
import { T } from "@/i18n/T";
import i18n from "@/i18n/config";
import { UserAvatar } from "@/components/UserAvatar";

type TProps = {
  isStudent?: boolean;
};

type TMenuItem = {
  key: string;
  content: React.ReactNode;
  onSelect: () => void;
};

const menuItemClassName =
  "flex w-full touch-manipulation flex-col items-start rounded-[10px] px-3 py-2 text-left text-sm font-medium tracking-brand text-brand-black outline-none transition-colors hover:bg-brand-gray focus-visible:bg-brand-gray";

// Rendered in place (no portal): the landing page zooms <body>, which breaks
// coordinate-based popover positioning.
export const HeaderProfile = (props: TProps) => {
  const { isStudent } = props;
  const { profile, setProfile } = useContext(AuthContext);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  const logout = () => {
    fetchPostJson({
      path: "/logout",
      isSecure: true,
      data: {},
    });
    writeToLocalStorage("token", "");
    writeToLocalStorage("profile", "");
    setProfile?.({});
    router.replace("/");
  };

  const items: TMenuItem[] = isStudent
    ? [
        {
          key: "cabinet",
          content: (
            <>
              <span className="header-secondary-btn-text block">{profile?.name}</span>
              {!!(profile?.email || profile?.login) && (
                <span className="block text-sm text-default-500">
                  {profile.email || profile.login}
                </span>
              )}
            </>
          ),
          onSelect: () => {
            if (profile?.studentId != null) {
              router.push(`/student-account/${profile.studentId}`);
            }
          },
        },
        {
          key: "profile",
          content: <T k="profile.personalData" />,
          onSelect: () => router.push("/profile"),
        },
        { key: "logout", content: <T k="auth.logout" />, onSelect: logout },
      ]
    : [
        {
          key: "lessons",
          content: <T k="profile.lessonsAndCourses" />,
          onSelect: () => router.push("/lesson_plans"),
        },
        {
          key: "students",
          content: <T k="profile.myStudents" />,
          onSelect: () => router.push("/profile?students"),
        },
        {
          key: "profile",
          content: <T k="profile.personalData" />,
          onSelect: () => router.push("/profile?profile"),
        },
        { key: "logout", content: <T k="auth.logout" />, onSelect: logout },
      ];

  const displayName = profile?.name || i18n.t("profile.profileLabel");

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isOpen ? menuId : undefined}
        title={displayName}
        onClick={() => setIsOpen((open) => !open)}
        className="flex h-10 min-w-0 max-w-full touch-manipulation items-center gap-2 rounded-[14px] bg-brand-gray px-2.5 text-xs font-bold tracking-brand text-brand-black outline-none transition-colors hover:bg-[#e6e6ea] focus-visible:ring-2 focus-visible:ring-brand-violet/40 max-[374px]:gap-1.5 max-[374px]:px-2 sm:max-w-[200px] sm:px-3.5 md:h-[46px] md:max-w-[240px] lg:h-10 lg:max-w-none lg:text-sm min-[1200px]:h-12"
      >
        <UserAvatar
          name={profile?.name}
          avatar={profile?.avatar}
          size={28}
          className="shrink-0"
        />
        <p className="min-w-0 truncate">{displayName}</p>
        <Image
          src={ChevronDown}
          alt=""
          aria-hidden
          width={14}
          className={`shrink-0 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        id={menuId}
        role="menu"
        aria-label="Profile Actions"
        aria-hidden={!isOpen}
        className={`absolute right-0 top-full z-50 mt-2 flex min-w-[200px] origin-top-right flex-col gap-0.5 rounded-[14px] bg-white p-1 shadow-[0_8px_30px_rgba(0,0,0,0.12)] ring-1 ring-black/5 transition-[opacity,transform,visibility] duration-150 ease-out motion-reduce:transition-none ${
          isOpen
            ? "visible scale-100 opacity-100"
            : "pointer-events-none invisible scale-95 opacity-0"
        }`}
      >
        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            role="menuitem"
            tabIndex={isOpen ? 0 : -1}
            className={menuItemClassName}
            onClick={() => {
              setIsOpen(false);
              item.onSelect();
            }}
          >
            {item.content}
          </button>
        ))}
      </div>
    </div>
  );
};
