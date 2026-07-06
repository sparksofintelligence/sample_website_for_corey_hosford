type BrushSlashProps = {
  className?: string;
  color?: string;
};

export function BrushSlash({ className = "", color = "#E8331C" }: BrushSlashProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 420 46"
      fill="none"
      preserveAspectRatio="none"
    >
      <path
        d="M9 26 C55 18 94 17 132 19 C184 22 226 31 279 25 C325 20 361 11 411 15"
        stroke={color}
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.95"
      />
      <path
        d="M18 31 C76 22 139 26 196 29 C262 33 329 23 399 19"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      <path
        d="M42 18 C83 17 120 18 162 21"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.22"
      />
    </svg>
  );
}
