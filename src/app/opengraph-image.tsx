import { ImageResponse } from "next/og";

import { loadPortfolio } from "@/server/portfolio/load-portfolio";

export const revalidate = 86400;
export const alt = "foreverlcd.dev";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#F2F2EE";
const ASH = "#8A8A93";
const SIGNAL = "#D4FF3A";

export default async function OpengraphImage() {
  const { profile } = await loadPortfolio();
  const name = profile?.fullName.trim() || "foreverlcd.dev";
  const headline = profile?.headline?.trim() || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#050507",
          padding: 72,
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 22, color: SIGNAL, letterSpacing: 4 }}>
          <div style={{ width: 14, height: 14, background: SIGNAL }} />
          <div>SIGNAL / STRUCTURE</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: name.length > 22 ? 80 : 104, fontWeight: 700, lineHeight: 1, letterSpacing: -3 }}>
            {name}
          </div>
          {headline ? (
            <div style={{ fontSize: 36, color: ASH, maxWidth: 960, lineHeight: 1.25 }}>{headline}</div>
          ) : null}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ height: 2, flex: 1, background: SIGNAL }} />
          <div style={{ fontSize: 20, color: ASH, letterSpacing: 3 }}>PORTFOLIO</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
