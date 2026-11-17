"use client";

import { fetchGet, fetchPostJson } from "@/api";
import { useCallback, useEffect, useState } from "react";
import type { RouletteSector, RouletteSpin, RouletteStatusResponse } from "../types";

export const useRoulette = (authorized: boolean, authReady = true) => {
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [applying, setApplying] = useState(false);
  const [canSpin, setCanSpin] = useState(false);
  const [segment, setSegment] = useState("A");
  const [sectors, setSectors] = useState<RouletteSector[]>([]);
  const [spin, setSpin] = useState<RouletteSpin | null>(null);
  const [sectorIndex, setSectorIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unusedDays, setUnusedDays] = useState(0);

  const loadPreview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGet({ path: "/roulette/preview" });
      const data = await res.json();
      if (data?.success && Array.isArray(data.sectors)) {
        setSectors(data.sectors);
        setSegment(data.segment || "A");
        setCanSpin(false);
        setSpin(null);
      }
    } catch {
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchGet({ path: "/roulette/status", isSecure: true });
      const data = (await res.json()) as RouletteStatusResponse;
      if (!data?.success) {
        setError("load_failed");
        return;
      }
      setCanSpin(Boolean(data.canSpin));
      setSegment(data.segment);
      setSectors(data.sectors || []);
      setSpin(data.spin);
      setUnusedDays(data.subscription?.unusedDays ?? 0);
      if (data.spin?.meta?.sectorIndex != null) {
        setSectorIndex(Number(data.spin.meta.sectorIndex));
      }
    } catch {
      setError("load_failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (authorized) {
      void loadStatus();
    } else {
      void loadPreview();
    }
  }, [authorized, authReady, loadStatus, loadPreview]);

  const spinWheel = useCallback(async () => {
    setSpinning(true);
    setError(null);
    try {
      const res = await fetchPostJson({
        path: "/roulette/spin",
        isSecure: true,
        data: {},
      });
      const data = await res.json();
      if (data?.reason === "already_spun") {
        setCanSpin(false);
        if (data.spin) setSpin(data.spin);
        setError("already_spun");
        return null;
      }
      if (!data?.success) {
        setError("spin_failed");
        return null;
      }
      setCanSpin(false);
      setSegment(data.segment);
      setSectors(data.sectors || []);
      setSpin(data.spin);
      setSectorIndex(
        typeof data.sectorIndex === "number" ? data.sectorIndex : 0,
      );
      return data as {
        sectorIndex: number;
        spin: RouletteSpin;
        sectors: RouletteSector[];
      };
    } catch {
      setError("spin_failed");
      return null;
    } finally {
      setSpinning(false);
    }
  }, []);

  const applyPrize = useCallback(async () => {
    setApplying(true);
    setError(null);
    try {
      const res = await fetchPostJson({
        path: "/roulette/apply",
        isSecure: true,
        data: {},
      });
      const data = await res.json();
      if (!data?.success) {
        setError(data?.reason || "apply_failed");
        return null;
      }
      if (data.spin) {
        setSpin(data.spin);
      }
      if (typeof data.unusedDays === "number") {
        setUnusedDays(data.unusedDays);
      }
      return data as {
        kind: string;
        plan?: string;
        promocode?: string;
        dateEnd?: string;
        unusedDays?: number;
        spin: RouletteSpin;
      };
    } catch {
      setError("apply_failed");
      return null;
    } finally {
      setApplying(false);
    }
  }, []);

  return {
    loading,
    spinning,
    applying,
    canSpin,
    segment,
    sectors,
    spin,
    sectorIndex,
    setSectorIndex,
    unusedDays,
    error,
    spinWheel,
    applyPrize,
    reload: authorized ? loadStatus : loadPreview,
  };
};
