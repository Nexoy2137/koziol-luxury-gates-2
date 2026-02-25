"use client";

import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

type Props = {
  onClose: () => void;
};

export function ConfigSuccessOverlay({ onClose }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px)",
      }}
    >
      {/* Ambient gold glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(212,175,55,0.25) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Rotating ring */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 320,
          height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(212,175,55,0.2)",
          pointerEvents: "none",
        }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{
          position: "absolute",
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: "1px dashed rgba(212,175,55,0.12)",
          pointerEvents: "none",
        }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", damping: 20, stiffness: 200, delay: 0.15 }}
        style={{
          position: "relative",
          maxWidth: 520,
          width: "100%",
          padding: "48px 40px",
          borderRadius: 24,
          border: "1px solid rgba(212,175,55,0.3)",
          background: "rgba(9,9,11,0.95)",
          boxShadow: "0 0 100px rgba(0,0,0,0.9), 0 0 60px rgba(212,175,55,0.15)",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
          style={{ marginBottom: 24 }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 88,
              height: 88,
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(212,175,55,0.3) 0%, rgba(212,175,55,0.1) 100%)",
              border: "2px solid rgba(212,175,55,0.5)",
              boxShadow: "0 0 40px rgba(212,175,55,0.3)",
            }}
          >
            <CheckCircle size={48} style={{ color: "#D4AF37" }} />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <p
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.5em",
              textTransform: "uppercase",
              color: "#D4AF37",
              marginBottom: 12,
            }}
          >
            Wycena zapisana
          </p>
          <h2
            className="font-display"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              fontWeight: 400,
              fontStyle: "italic",
              color: "#fff",
              marginBottom: 16,
              lineHeight: 1.2,
            }}
          >
            Dziękujemy!
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.7,
              color: "#a1a1aa",
              marginBottom: 32,
            }}
          >
            Twoja wycena została zapisana. Nasz doradca oddzwoni w ciągu 24 godzin
            z propozycją terminu i finalnym projektem.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.3 }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "16px 40px",
              borderRadius: 999,
              background: "#D4AF37",
              color: "#000",
              border: "none",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              boxShadow: "0 0 32px rgba(212,175,55,0.4)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#C9A227";
              e.currentTarget.style.boxShadow = "0 0 48px rgba(212,175,55,0.55)";
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#D4AF37";
              e.currentTarget.style.boxShadow = "0 0 32px rgba(212,175,55,0.4)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            Zamknij
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
