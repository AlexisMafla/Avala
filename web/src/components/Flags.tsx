import type { ReactNode } from "react";
import type { Country } from "../api";

const W = 28;
const H = 20;
const R = 4;

function Frame({ children }: { children: ReactNode }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden>
      <defs>
        <clipPath id="flag-clip">
          <rect x="0" y="0" width={W} height={H} rx={R} />
        </clipPath>
      </defs>
      <g clipPath="url(#flag-clip)">{children}</g>
      <rect
        x="0.5"
        y="0.5"
        width={W - 1}
        height={H - 1}
        rx={R}
        fill="none"
        stroke="rgba(255,255,255,0.12)"
      />
    </svg>
  );
}

function FlagES() {
  return (
    <Frame>
      <rect x="0" y="0" width={W} height={H} fill="#c60b1e" />
      <rect x="0" y={H * 0.25} width={W} height={H * 0.5} fill="#ffc400" />
    </Frame>
  );
}

function FlagCO() {
  return (
    <Frame>
      <rect x="0" y="0" width={W} height={H / 2} fill="#fcd116" />
      <rect x="0" y={H / 2} width={W} height={H / 4} fill="#003893" />
      <rect x="0" y={(H * 3) / 4} width={W} height={H / 4} fill="#ce1126" />
    </Frame>
  );
}

function FlagAR() {
  return (
    <Frame>
      <rect x="0" y="0" width={W} height={H} fill="#fff" />
      <rect x="0" y="0" width={W} height={H / 3} fill="#74acdf" />
      <rect x="0" y={(H * 2) / 3} width={W} height={H / 3} fill="#74acdf" />
      <circle cx={W / 2} cy={H / 2} r="2.4" fill="#f6b40e" />
    </Frame>
  );
}

export function Flag({ country }: { country: Country }) {
  if (country === "ES") return <FlagES />;
  if (country === "CO") return <FlagCO />;
  return <FlagAR />;
}
