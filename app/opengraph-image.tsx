import { ImageResponse } from "next/og";

export const alt = "Kozioł Luxury Gates | Logo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Używamy pliku z katalogu `public`, dostępnego pod adresem `/logo_2.jpg`
// dzięki temu Next nie próbuje go ściągać z zewnętrznej domeny podczas builda.
const logoUrl = "/logo_2.jpg";

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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoUrl}
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
