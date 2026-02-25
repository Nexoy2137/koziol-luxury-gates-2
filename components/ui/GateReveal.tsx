"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";

const EASE_GATE = [0.76, 0, 0.24, 1] as const;

export function GateReveal() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Show only once per browser session
    if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem("kzl-gate-shown")) {
      setVisible(true);
      sessionStorage.setItem("kzl-gate-shown", "1");
    }
  }, []);

  if (done || !visible) return null;

  return (
    <AnimatePresence onExitComplete={() => setDone(true)}>
      {visible && (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[9999] flex pointer-events-none select-none"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 2.8 }}
          onAnimationComplete={() => setVisible(false)}
        >
          {/* Left gate leaf */}
          <motion.div
            className="relative flex flex-1 items-center justify-end overflow-hidden bg-black"
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ duration: 1.3, delay: 1.4, ease: EASE_GATE }}
          >
            {/* Vertical golden edge on the opening seam */}
            <div className="absolute right-0 top-0 h-full w-[1.5px] gate-glow-line bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-70" />
          </motion.div>

          {/* Right gate leaf */}
          <motion.div
            className="relative flex flex-1 items-center justify-start overflow-hidden bg-black"
            initial={{ x: 0 }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.3, delay: 1.4, ease: EASE_GATE }}
          >
            {/* Vertical golden edge on the opening seam */}
            <div className="absolute left-0 top-0 h-full w-[1.5px] gate-glow-line bg-gradient-to-b from-transparent via-[#D4AF37] to-transparent opacity-70" />
          </motion.div>

          {/* Centred logo — fades out just before gates open */}
          <motion.div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-6 z-10"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 0.6 }, scale: { duration: 0.6 } }}
          >
            {/* Top golden line */}
            <motion.div
              className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5 }}
              className="flex flex-col items-center gap-3"
            >
              <Image
                src="/logo.svg"
                alt="Koziol Luxury Gates"
                width={260}
                height={80}
                className="w-48 md:w-64 object-contain"
                priority
              />
              <p className="text-[9px] font-semibold uppercase tracking-[0.55em] text-[#D4AF37] opacity-80">
                Luxury Gates &amp; Fences
              </p>
            </motion.div>

            {/* Bottom golden line */}
            <motion.div
              className="h-[1px] w-24 bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
