import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 32,
          color: "white",
          fontSize: 120,
          fontWeight: 700,
        }}
      >
        Λ
      </div>
    ),
    { ...size }
  );
}
