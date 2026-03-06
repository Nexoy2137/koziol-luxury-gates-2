import { ImageResponse } from "next/og";

export const alt = "Kozioł Luxury Gates | Producent ekskluzywnych bram i ogrodzeń";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0a0a0a 0%, #171717 50%, #0a0a0a 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 4,
            height: 80,
            background: "linear-gradient(180deg, #D4AF37, #85662f)",
            marginBottom: 24,
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontSize: 56,
            fontWeight: 400,
            fontStyle: "italic",
            color: "white",
            textAlign: "center",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          Twoja brama to pierwsze wrażenie.
        </div>
        <div
          style={{
            fontSize: 22,
            color: "#a1a1aa",
            marginTop: 20,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
          }}
        >
          Kozioł Luxury Gates
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 16,
            color: "#71717a",
          }}
        >
          Producent ekskluzywnych bram · Polska · Est. 2009
        </div>
      </div>
    ),
    { ...size }
  );
}
