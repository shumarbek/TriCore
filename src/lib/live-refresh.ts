"use client";

import { useEffect } from "react";

export const TRICORE_DATA_CHANGED = "tricore:data-changed";

export function notifyDataChanged() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(TRICORE_DATA_CHANGED));
}

export function useLiveRefresh(onRefresh: () => void) {
  useEffect(() => {
    const handleRefresh = () => onRefresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") onRefresh();
    };

    window.addEventListener(TRICORE_DATA_CHANGED, handleRefresh);
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("pageshow", handleRefresh);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener(TRICORE_DATA_CHANGED, handleRefresh);
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("pageshow", handleRefresh);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [onRefresh]);
}
