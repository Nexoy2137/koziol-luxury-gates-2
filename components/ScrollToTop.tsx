"use client";

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

/** Scroll na górę tylko przy pierwszym załadowaniu; przy nawigacji Next sam przewija. */
export function ScrollToTop(): ReactElement | null {
  const scrolledRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (scrolledRef.current) return;
    scrolledRef.current = true;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  return null;
}

