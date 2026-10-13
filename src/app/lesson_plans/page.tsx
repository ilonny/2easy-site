"use client";

import { CatalogPageShell } from "@/components";
import { Image } from "@nextui-org/react";
import { useContext } from "react";
import { ProfileLessons } from "../lessons/components/ProfileLessons";
import { T } from "@/i18n/T";
import { AuthContext } from "@/auth";
import Dino from "@/assets/images/dino.gif";

export default function LessonPlansPage() {
  const { authIsLoading } = useContext(AuthContext);

  return (
    <CatalogPageShell title={<T k="header.lessonPlans" />}>
      {authIsLoading ? (
        <div className="flex h-[500px] w-full items-center justify-center">
          <Image src={Dino.src} alt="dino animated" width={150} height={150} />
        </div>
      ) : (
        <ProfileLessons />
      )}
    </CatalogPageShell>
  );
}
