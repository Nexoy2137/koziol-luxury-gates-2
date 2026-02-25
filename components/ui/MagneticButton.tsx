"use client";

import { useRef, useState } from "react";
import Link from "next/link";

interface MagneticButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  strength?: number;
  variant?: "gold" | "outline" | "ghost";
}

export function MagneticButton({
  href,
  children,
  className = "",
  strength = 0.32,
  variant = "gold",
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [releasing, setReleasing] = useState(false);
  const [transform, setTransform] = useState("translate(0px, 0px)");

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    setReleasing(false);
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setTransform(`translate(${x}px, ${y}px)`);
  };

  const handleMouseLeave = () => {
    setReleasing(true);
    setTransform("translate(0px, 0px)");
  };

  const baseClass =
    "inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-[11px] font-semibold uppercase tracking-[0.28em] transition-colors duration-200";

  const variants = {
    gold: "bg-[#D4AF37] text-black hover:bg-[#E8C97A] shadow-gold-button",
    outline:
      "border border-zinc-700 bg-transparent text-zinc-300 hover:border-[#D4AF37]/70 hover:text-[#D4AF37]",
    ghost: "text-[#D4AF37] hover:text-white",
  };

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`magnetic ${releasing ? "magnetic-releasing" : ""} ${baseClass} ${variants[variant]} ${className}`}
      style={{ transform }}
    >
      {children}
    </Link>
  );
}
