type BrandMarkProps = {
  className?: string;
  compact?: boolean;
};

export function BrandMark({ className = "", compact = false }: BrandMarkProps) {
  const height = compact ? 52 : 72;

  return (
    <svg
      role="img"
      aria-label="Freedom Performance"
      className={className}
      viewBox="0 0 300 116"
      height={height}
      fill="none"
    >
      <path
        d="M42 11 H258 L289 39 V77 L258 105 H42 L11 77 V39 Z"
        stroke="#E8331C"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M54 24 H246 L271 46 V70 L246 92 H54 L29 70 V46 Z"
        stroke="#ffffff"
        strokeWidth="1.6"
        strokeLinejoin="round"
        opacity="0.72"
      />
      <text
        x="150"
        y="51"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-display), Arial Narrow, Arial, sans-serif"
        fontSize="38"
        fontStyle="italic"
        fontWeight="800"
        letterSpacing="0"
        transform="skewX(-7 150 51)"
      >
        FREEDOM
      </text>
      <text
        x="150"
        y="78"
        textAnchor="middle"
        fill="#ffffff"
        fontFamily="var(--font-display), Arial Narrow, Arial, sans-serif"
        fontSize="25"
        fontStyle="italic"
        fontWeight="800"
        letterSpacing="0"
        transform="skewX(-7 150 78)"
      >
        PERFORMANCE
      </text>
      <path d="M92 85 H208" stroke="#E8331C" strokeWidth="4" strokeLinecap="round" />
      <text
        x="150"
        y="99"
        textAnchor="middle"
        fill="#B5B5B5"
        fontFamily="var(--font-body), Arial, sans-serif"
        fontSize="10"
        fontWeight="800"
        letterSpacing="0"
      >
        MESA, AZ
      </text>
    </svg>
  );
}
