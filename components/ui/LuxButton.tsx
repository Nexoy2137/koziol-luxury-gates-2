import Link from "next/link";
import type { ReactNode } from "react";

interface LuxButtonProps {
  href: string;
  children: ReactNode;
  variant?: "gold" | "outline";
  className?: string;
  size?: "md" | "lg";
}

export function LuxButton({
  href,
  children,
  variant = "gold",
  className = "",
  size = "md",
}: LuxButtonProps) {
  const padding = size === "lg" ? "px-10 py-4 text-[12px]" : "px-7 py-3.5 text-[11px]";

  if (variant === "gold") {
    return (
      <Link
        href={href}
        className={`group relative inline-flex overflow-hidden items-center gap-2.5 rounded-full bg-[#D4AF37] font-semibold uppercase tracking-[0.32em] text-black transition-all duration-300 hover:bg-[#C9A227] shadow-[0_0_30px_rgba(212,175,55,0.28)] hover:shadow-[0_0_55px_rgba(212,175,55,0.55)] ${padding} ${className}`}
      >
        {/* Shimmer sweep on hover */}
        <span
          className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-15deg] bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-[600ms] ease-in-out group-hover:translate-x-full"
          aria-hidden="true"
        />
        <span className="relative flex items-center gap-2.5">{children}</span>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`group relative inline-flex items-center gap-2.5 rounded-full border border-[#D4AF37]/55 font-semibold uppercase tracking-[0.32em] text-[#D4AF37] transition-all duration-300 hover:border-[#D4AF37] hover:bg-[#D4AF37]/10 hover:shadow-[0_0_32px_rgba(212,175,55,0.22)] ${padding} ${className}`}
    >
      <span className="relative flex items-center gap-2.5">{children}</span>
    </Link>
  );
}
