"use client";

import type { ReactElement } from "react";
import { useEffect, useRef } from "react";

/**
 * Ustawia scroll na górę tylko przy pierwszym załadowaniu aplikacji (odświeżenie / wejście z paska adresu).
 * Przy nawigacji między podstronami Next sam przewija na górę, więc nie robimy dodatkowego „podskoku”.
 */
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

