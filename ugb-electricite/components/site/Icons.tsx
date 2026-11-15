import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 22, ...p }: P) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...p,
  };
}

export const IconBolt = (p: P) => (
  <svg {...base(p)}>
    <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H12L13 2Z" />
  </svg>
);
export const IconArrow = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconCube = (p: P) => (
  <svg {...base(p)}>
    <path d="m12 2 9 5v10l-9 5-9-5V7l9-5Z" />
    <path d="m3 7 9 5 9-5M12 12v10" />
  </svg>
);
export const IconOpen = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 10 12 4l8 6" />
    <path d="M6 13v7h12v-7" />
    <path d="M12 1v2M3 7 1.5 6M21 7l1.5-1" />
  </svg>
);
export const IconClose = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 11 12 4l9 7" />
    <path d="M5 10v10h14V10" />
    <path d="M10 20v-5h4v5" />
  </svg>
);
export const IconCircuit = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h6v6h10M10 12v6h6" />
    <circle cx="4" cy="6" r="1.6" />
    <circle cx="20" cy="12" r="1.6" />
    <circle cx="16" cy="18" r="1.6" />
  </svg>
);
export const IconReplay = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);
export const IconTarget = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v3M12 20v3M1 12h3M20 12h3" />
  </svg>
);
export const IconX = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconSkip = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 5 9 7-9 7V5ZM18 5v14" />
  </svg>
);
export const IconPlug = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 2v5M15 2v5M6 7h12v4a6 6 0 0 1-12 0V7ZM12 17v5" />
  </svg>
);
export const IconShield = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 2 4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3Z" />
    <path d="m8.5 12 2.5 2.5 4.5-5" />
  </svg>
);
export const IconBulb = (p: P) => (
  <svg {...base(p)}>
    <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
  </svg>
);
export const IconWrench = (p: P) => (
  <svg {...base(p)}>
    <path d="M14.7 6.3a4 4 0 0 0 5 5l-9.4 9.4a2.1 2.1 0 0 1-3-3l9.4-9.4a4 4 0 0 1-2-2Z" />
    <path d="M14.7 6.3 17 4l3 3-2.3 2.3" />
  </svg>
);
export const IconCompass = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 21h18M5 21V8l7-5 7 5v13" />
    <path d="M9 21v-6h6v6M9 11h6" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconDoc = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 2H6v20h12V6l-4-4Z" />
    <path d="M14 2v4h4M9 13h6M9 17h6M9 9h2" />
  </svg>
);
export const IconLeaf = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 21c0-9 5-15 15-16-1 10-7 15-15 16ZM5 21l7-7" />
  </svg>
);
export const IconPhone = (p: P) => (
  <svg {...base(p)}>
    <path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" />
  </svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const IconPin = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 22s7-6.3 7-12a7 7 0 0 0-14 0c0 5.7 7 12 7 12Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
export const IconMenu = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 7h16M4 12h16M4 17h10" />
  </svg>
);
export const IconCheck = (p: P) => (
  <svg {...base(p)}>
    <path d="m5 12 4.5 4.5L19 7" />
  </svg>
);
export const IconHand = (p: P) => (
  <svg {...base(p)}>
    <path d="M8 13V5.5a1.5 1.5 0 0 1 3 0V11M11 10V4.5a1.5 1.5 0 0 1 3 0V11M14 10.5V6a1.5 1.5 0 0 1 3 0v7a8 8 0 0 1-8 8h-.4a6 6 0 0 1-4.6-2.2L2.5 16a1.6 1.6 0 0 1 2.4-2l2.1 1.8" />
  </svg>
);
