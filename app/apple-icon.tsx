import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          borderRadius: 36,
          color: "white",
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        Λ
      </div>
    ),
    { ...size }
  );
}
