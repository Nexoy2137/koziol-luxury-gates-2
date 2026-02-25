"use client";

import Link from "next/link";
import type { ReactNode, CSSProperties } from "react";

interface LuxButtonProps {
  href: string;
  children: ReactNode;
  variant?: "gold" | "outline";
  className?: string;
  size?: "md" | "lg";
  style?: CSSProperties;
}

export function LuxButton({
  href,
  children,
  variant = "gold",
  className = "",
  size = "md",
  style,
}: LuxButtonProps) {
  const fontSize = size === "lg" ? 12 : 11;
  const padding  = size === "lg" ? "13px 28px" : "10px 22px";

  const baseStyle: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    borderRadius: 999,
    fontSize,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    textDecoration: "none",
    padding,
    transition: "background 0.25s, box-shadow 0.25s, border-color 0.25s, color 0.25s",
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    overflow: "hidden",
    ...style,
  };

  if (variant === "gold") {
    return (
      <Link
        href={href}
        className={className}
        style={{ ...baseStyle, background: "#D4AF37", color: "#000", boxShadow: "0 0 28px rgba(212,175,55,0.32)" }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = "#C9A227";
          el.style.boxShadow = "0 0 52px rgba(212,175,55,0.62)";
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLAnchorElement;
          el.style.background = "#D4AF37";
          el.style.boxShadow = "0 0 28px rgba(212,175,55,0.32)";
        }}
      >
        {/* Shimmer */}
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%)",
          transform: "translateX(-100%)",
          transition: "transform 0.65s ease",
          pointerEvents: "none",
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "translateX(100%)"; }}
        />
        {children}
      </Link>
    );
  }

  // Outline variant
  return (
    <Link
      href={href}
      className={className}
      style={{
        ...baseStyle,
        background: "transparent",
        color: "#D4AF37",
        border: "1.5px solid #D4AF37",
        boxShadow: "none",
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = "rgba(212,175,55,0.12)";
        el.style.borderColor = "#E8C97A";
        el.style.boxShadow = "0 0 24px rgba(212,175,55,0.22)";
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLAnchorElement;
        el.style.background = "transparent";
        el.style.borderColor = "#D4AF37";
        el.style.boxShadow = "none";
      }}
    >
      {children}
    </Link>
  );
}
