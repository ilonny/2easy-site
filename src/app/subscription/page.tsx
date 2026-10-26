"use client";

import { BrandPill, CatalogPageShell } from "@/components";
import { MainTariffs } from "@/components/MainTariffs";
import { AuthContext } from "@/auth";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { SibscribeContext } from "@/subscribe/context";
import { SubscribeCancel } from "@/subscribe/components/SubscribeCancel";
import { T } from "@/i18n/T";
import { checkResponse, fetchGet, fetchPostJson } from "@/api";
import { Select, SelectItem } from "@nextui-org/react";
import { TariffsPanel } from "@/app/school/components/TariffsPanel";
import type {
  SchoolInfo,
  SchoolSubscription,
  SchoolTier,
} from "@/app/school/types";

type SubscriptionTab = "personal" | "school";

type SchoolSubscriptionData = {
  subscription: SchoolSubscription;
  studentCount: number;
  tiers: SchoolTier[];
  canPay: boolean;
};

type PersonalSubscription = {
  subscribe_type_id?: number;
};

export default function SubscriptionPage() {
  const { isAuthorized, authIsLoading, profile } = useContext(AuthContext);
  const { subscription } = useContext(SibscribeContext) as {
    subscription?: PersonalSubscription;
  };
  const [tab, setTab] = useState<SubscriptionTab>("personal");
  const [schools, setSchools] = useState<SchoolInfo[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
  const [schoolSubscription, setSchoolSubscription] =
    useState<SchoolSubscriptionData | null>(null);
  const [schoolSubscriptionLoading, setSchoolSubscriptionLoading] =
    useState(false);

  const hasTariff =
    subscription?.subscribe_type_id && subscription?.subscribe_type_id !== 1;

  useEffect(() => {
    if (
      authIsLoading ||
      !isAuthorized ||
      profile?.isStudent ||
      profile?.studentId
    ) {
      if (!authIsLoading) setSchools([]);
      return;
    }

    let cancelled = false;
    const loadSchools = async () => {
      setSchoolsLoading(true);
      try {
        const res = await fetchGet({
          path: "/school/me",
          isSecure: true,
        });
        const data = await res.json();
        if (cancelled) return;
        if (data?.success) {
          setSchools(data.schools || []);
        } else {
          setSchools([]);
          // Already on /subscription — skip needSubscription redirect/toast
          // (expired personal sub + school/me is a normal case here).
          checkResponse(data, Boolean(data?.needSubscription), true);
        }
      } finally {
        if (!cancelled) setSchoolsLoading(false);
      }
    };
    void loadSchools();
    return () => {
      cancelled = true;
    };
  }, [
    authIsLoading,
    isAuthorized,
    profile?.isStudent,
    profile?.studentId,
  ]);

  const ownedSchools = useMemo(
    () => schools.filter((school) => school.roles?.includes("super_admin")),
    [schools],
  );

  useEffect(() => {
    if (!ownedSchools.length) {
      setSelectedSchoolId(null);
      setSchoolSubscription(null);
      if (tab === "school") setTab("personal");
      return;
    }
    setSelectedSchoolId((current) =>
      current && ownedSchools.some((school) => school.id === current)
        ? current
        : ownedSchools[0].id,
    );
  }, [ownedSchools, tab]);

  const loadSchoolSubscription = useCallback(async (schoolId: number) => {
    setSchoolSubscriptionLoading(true);
    setSchoolSubscription(null);
    try {
      const res = await fetchGet({
        path: `/school/${schoolId}/subscription`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
      });
      const data = await res.json();
      if (data?.success) {
        setSchoolSubscription({
          subscription: data.subscription || null,
          studentCount: Number(data.student_count) || 0,
          tiers: data.tiers || [],
          canPay: Boolean(data.canPay),
        });
      } else {
        checkResponse(data, Boolean(data?.needSubscription), true);
      }
    } finally {
      setSchoolSubscriptionLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tab === "school" && selectedSchoolId) {
      void loadSchoolSubscription(selectedSchoolId);
    }
  }, [loadSchoolSubscription, selectedSchoolId, tab]);

  const createSchoolPayment = useCallback(
    async (
      schoolId: number,
      tier: string,
      email?: string,
      phone?: string,
    ) => {
      const res = await fetchPostJson({
        path: `/school/${schoolId}/payment/create`,
        isSecure: true,
        workspaceScope: "school",
        schoolId,
        data: { tier, email, phone },
      });
      const data = await res.json();
      if (!data?.success) checkResponse(data, false, true);
      return data;
    },
    [],
  );

  const showSubscriptionTabs = schools.length > 0;
  const selectedSchool = ownedSchools.find(
    (school) => school.id === selectedSchoolId,
  );

  return (
    <CatalogPageShell
      title={<T k="subscription.title" />}
      subtitle={
        tab === "personal" ? (
          <>
            <T k="subscription.page.subtitle" />
            <br />
            <br />
            <span className="font-bold text-brand-grayFont">
              <T k="subscription.page.description1" />
              <br />
              <br />
              <T k="subscription.page.description2" />
            </span>
          </>
        ) : (
          <T
            k="subscription.schoolSubtitle"
            values={{ school: selectedSchool?.name || "" }}
          />
        )
      }
    >
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6">
        {showSubscriptionTabs ? (
          <div className="flex flex-wrap justify-center gap-2">
            <BrandPill
              active={tab === "personal"}
              onClick={() => setTab("personal")}
            >
              <T k="subscription.personalTab" />
            </BrandPill>
            {ownedSchools.length ? (
              <BrandPill
                active={tab === "school"}
                onClick={() => setTab("school")}
              >
                <T k="subscription.schoolTab" />
              </BrandPill>
            ) : null}
          </div>
        ) : null}

        {tab === "personal" ? (
          <>
            <MainTariffs embedded hideTitle />
            {isAuthorized && hasTariff ? (
              <div className="flex justify-center">
                <SubscribeCancel />
              </div>
            ) : null}
          </>
        ) : (
          <div className="flex flex-col gap-6">
            {ownedSchools.length > 1 ? (
              <Select
                label={<T k="subscription.selectSchool" />}
                selectedKeys={
                  selectedSchoolId ? [String(selectedSchoolId)] : []
                }
                onChange={(event) => {
                  const schoolId = Number(event.target.value);
                  if (schoolId) setSelectedSchoolId(schoolId);
                }}
                className="max-w-[420px]"
              >
                {ownedSchools.map((school) => (
                  <SelectItem
                    key={String(school.id)}
                    value={String(school.id)}
                  >
                    {school.name}
                  </SelectItem>
                ))}
              </Select>
            ) : null}

            {schoolSubscriptionLoading || schoolsLoading ? (
              <p className="text-center text-brand-grayFont">
                <T k="school.loading" />
              </p>
            ) : selectedSchoolId && schoolSubscription ? (
              <TariffsPanel
                canPay={schoolSubscription.canPay}
                schoolId={selectedSchoolId}
                tiers={schoolSubscription.tiers}
                subscription={schoolSubscription.subscription}
                studentCount={schoolSubscription.studentCount}
                createSchoolPayment={createSchoolPayment}
                onPaid={() => {
                  void loadSchoolSubscription(selectedSchoolId);
                }}
              />
            ) : null}
          </div>
        )}
      </div>
    </CatalogPageShell>
  );
}
