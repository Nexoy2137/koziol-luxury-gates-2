"use client";

import type { ReactElement } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Przy każdej zmianie trasy przewija okno na górę (m.in. galeria → szczegóły na mobile). */
export function ScrollToTop(): ReactElement | null {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const scroll = () => window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    scroll();
    const raf = requestAnimationFrame(() => {
      scroll();
      requestAnimationFrame(scroll);
    });
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}

