"use client";

import { useEffect, useRef } from "react";

export function CursorGlow() {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start the glow at the centre of the screen so it's visible immediately
    if (divRef.current) {
      divRef.current.style.background = `radial-gradient(800px circle at 50% 40%, rgba(212,175,55,0.10) 0%, rgba(133,102,47,0.05) 40%, transparent 65%)`;
    }

    const handler = (e: MouseEvent) => {
      if (!divRef.current) return;
      divRef.current.style.background = `radial-gradient(800px circle at ${e.clientX}px ${e.clientY}px, rgba(212,175,55,0.13) 0%, rgba(133,102,47,0.06) 40%, transparent 65%)`;
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <div
      ref={divRef}
      className="pointer-events-none fixed inset-0 z-[50] hidden md:block"
      aria-hidden="true"
    />
  );
}
