import { ImageResponse } from "next/og";

export const alt = "Kozioł Luxury Gates | Logo";
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
          alignItems: "center",
          justifyContent: "center",
          background: "#000000",
        }}
      >
        {/* Używamy tego samego logo co na stronie głównej */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="Kozioł Luxury Gates logo"
          width={600}
          height={600}
          style={{
            objectFit: "contain",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
