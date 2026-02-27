"use client";

import { useState } from "react";
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
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const active = hovered || pressed;
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
    transition: "background 0.25s, box-shadow 0.25s, border-color 0.25s, color 0.25s, transform 0.15s",
    whiteSpace: "nowrap" as const,
    cursor: "pointer",
    overflow: "hidden",
    ...style,
  };

  const pointerProps = {
    onPointerDown: () => setPressed(true),
    onPointerUp: () => setPressed(false),
    onPointerLeave: () => setPressed(false),
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  if (variant === "gold") {
    return (
      <Link
        href={href}
        className={className}
        style={{
          ...baseStyle,
          background: active ? "#C9A227" : "#D4AF37",
          color: "#000",
          boxShadow: active ? "0 0 52px rgba(212,175,55,0.62)" : "0 0 28px rgba(212,175,55,0.32)",
          transform: pressed ? "scale(0.98)" : undefined,
        }}
        {...pointerProps}
      >
        <span style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.28) 50%, transparent 60%)",
          transform: hovered ? "translateX(100%)" : "translateX(-100%)",
          transition: "transform 0.65s ease",
          pointerEvents: "none",
        }}
        />
        {children}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={className}
      style={{
        ...baseStyle,
        background: active ? "rgba(212,175,55,0.12)" : "transparent",
        color: "#D4AF37",
        border: "1.5px solid",
        borderColor: active ? "#E8C97A" : "#D4AF37",
        boxShadow: active ? "0 0 24px rgba(212,175,55,0.22)" : "none",
        transform: pressed ? "scale(0.98)" : undefined,
      }}
      {...pointerProps}
    >
      {children}
    </Link>
  );
}
