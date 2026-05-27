"use client";
import { useState, useEffect } from "react";

export function useFeatureFlag(key: string): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    fetch(`/api/feature-flags/${key}`)
      .then((r) => r.json())
      .then((d) => setEnabled(d.enabled === true))
      .catch(() => setEnabled(false));
  }, [key]);
  return enabled;
}
