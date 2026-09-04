import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const shared = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
  "aria-hidden": true,
};

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </svg>
  );
}

export function MapPinIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M4 7.5h3l1.5-2h7l1.5 2h3v11H4Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

export function CrosshairIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </svg>
  );
}

export function BuildingsIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M3 21V8l7-3v16M10 21V3l11 4v14M6 11h1M6 15h1M14 8h2M14 12h2M14 16h2M3 21h18" />
    </svg>
  );
}

export function RotateCcwIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg {...shared} {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
