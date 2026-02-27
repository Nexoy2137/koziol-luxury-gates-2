"use client";

import { motion } from "framer-motion";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: boolean;
  className?: string;
  style?: CSSProperties;
  /** Opcjonalnie: nadpisuje domyślny próg viewportu (0–1). */
  viewportAmount?: number;
}

export function ScrollReveal({
  children,
  delay = 0.2,
  duration = 2,
  y = 32,
  scale = false,
  className,
  style,
  viewportAmount,
}: ScrollRevealProps) {
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const id = setTimeout(
      () => setReduceMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches),
      0
    );
    return () => clearTimeout(id);
  }, []);

  const effectiveDuration = reduceMotion ? 0 : duration;
  const effectiveDelay = reduceMotion ? 0 : delay;

  return (
    <motion.div
      initial={{ opacity: 0, y, scale: scale ? 0.97 : 1 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: effectiveDuration,
        delay: effectiveDelay,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      viewport={{ once: true, amount: viewportAmount ?? 0.1 }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

interface StaggerContainerProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  staggerDelay?: number;
}

export function StaggerContainer({
  children,
  className,
  style,
  staggerDelay = 0.4,
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: staggerDelay },
        },
      }}
      viewport={{ once: true, amount: 0.1 }}
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 28 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
