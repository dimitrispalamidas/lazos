import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#2563eb",
          color: "white",
          fontSize: 96,
          fontWeight: 700,
        }}
      >
        Λάζος
      </div>
    ),
    { ...size }
  );
}
