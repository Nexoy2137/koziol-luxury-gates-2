"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

type ToastState =
  | { type: "idle" }
  | { type: "alert"; message: string; resolve: () => void }
  | { type: "confirm"; message: string; resolve: (ok: boolean) => void };

const ToastContext = createContext<{
  showAlert: (message: string) => Promise<void>;
  showConfirm: (message: string) => Promise<boolean>;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ToastState>({ type: "idle" });

  const showAlert = useCallback((message: string) => {
    return new Promise<void>((resolve) => {
      setState({ type: "alert", message, resolve });
    });
  }, []);

  const showConfirm = useCallback((message: string) => {
    return new Promise<boolean>((resolve) => {
      setState({ type: "confirm", message, resolve });
    });
  }, []);

  const handleAlertClose = useCallback(() => {
    if (state.type === "alert") {
      state.resolve();
      setState({ type: "idle" });
    }
  }, [state]);

  const handleConfirm = useCallback(
    (ok: boolean) => {
      if (state.type === "confirm") {
        state.resolve(ok);
        setState({ type: "idle" });
      }
    },
    [state]
  );

  return (
    <ToastContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {state.type === "alert" && (
        <ToastModal
          message={state.message}
          variant="alert"
          onClose={handleAlertClose}
          onConfirm={handleConfirm}
        />
      )}
      {state.type === "confirm" && (
        <ToastModal
          message={state.message}
          variant="confirm"
          onClose={() => handleConfirm(false)}
          onConfirm={handleConfirm}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      showAlert: (m: string) => {
        console.warn("ToastProvider missing, falling back to native alert");
        alert(m);
        return Promise.resolve();
      },
      showConfirm: (m: string) => {
        console.warn("ToastProvider missing, falling back to native confirm");
        return Promise.resolve(confirm(m));
      },
    };
  }
  return ctx;
}

function ToastModal({
  message,
  variant,
  onClose,
  onConfirm,
}: {
  message: string;
  variant: "alert" | "confirm";
  onClose: () => void;
  onConfirm: (ok: boolean) => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="toast-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(8px)",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          padding: 32,
          borderRadius: 20,
          border: "1px solid rgba(212,175,55,0.25)",
          background: "rgba(9,9,11,0.98)",
          boxShadow: "0 0 80px rgba(0,0,0,0.8), 0 0 40px rgba(212,175,55,0.1)",
          textAlign: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <p
          id="toast-title"
          style={{
            fontSize: 15,
            lineHeight: 1.6,
            color: "#e4e4e7",
            margin: "0 0 24px",
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: 12,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {variant === "alert" ? (
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "14px 32px",
                borderRadius: 999,
                background: "#D4AF37",
                color: "#000",
                border: "none",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 24px rgba(212,175,55,0.35)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#C9A227";
                e.currentTarget.style.boxShadow = "0 0 40px rgba(212,175,55,0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#D4AF37";
                e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)";
              }}
            >
              OK
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => onConfirm(false)}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "transparent",
                  color: "#a1a1aa",
                  border: "1.5px solid rgba(63,63,70,0.9)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(212,175,55,0.5)";
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(63,63,70,0.9)";
                  e.currentTarget.style.color = "#a1a1aa";
                }}
              >
                Nie
              </button>
              <button
                type="button"
                onClick={() => onConfirm(true)}
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  background: "#D4AF37",
                  color: "#000",
                  border: "none",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow: "0 0 24px rgba(212,175,55,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#C9A227";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(212,175,55,0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#D4AF37";
                  e.currentTarget.style.boxShadow = "0 0 24px rgba(212,175,55,0.35)";
                }}
              >
                Tak
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
