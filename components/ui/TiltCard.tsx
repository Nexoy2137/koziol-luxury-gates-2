"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className = "", intensity = 10 }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [hasHover, setHasHover] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none)");
    setHasHover(!mq.matches);
    const listener = () => setHasHover(!mq.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hasHover) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(900px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg) translateZ(6px)`;
    el.style.transition = "transform 0.08s ease";
  };

  const handleMouseLeave = () => {
    if (!hasHover) return;
    const el = ref.current;
    if (!el) return;
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
    el.style.transition = "transform 0.55s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={hasHover ? { transformStyle: "preserve-3d", willChange: "transform" } : undefined}
    >
      {children}
    </div>
  );
}
