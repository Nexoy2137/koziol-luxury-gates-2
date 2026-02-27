"use client";

/** Błąd w root layout – wymaga własnego html/body (Next nie renderuje layoutu). */
export default function GlobalError({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Next.js wymaga error w sygnaturze
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pl">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#050505", color: "#fff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: 12 }}>Błąd aplikacji</h1>
          <p style={{ color: "#a1a1aa", fontSize: 14, marginBottom: 24 }}>
            Wystąpił poważny błąd. Odśwież stronę lub wróć później.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "12px 24px",
              borderRadius: 999,
              background: "#D4AF37",
              color: "#000",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Spróbuj ponownie
          </button>
        </div>
      </body>
    </html>
  );
}
