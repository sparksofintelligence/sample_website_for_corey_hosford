import type { IllustrationKind } from "@/types/store";

type IllustrationProps = {
  accentColor?: string;
  className?: string;
};

export function CatalogIllustration({
  kind,
  accentColor = "#E8331C",
  className = "",
}: IllustrationProps & { kind: IllustrationKind }) {
  if (kind === "brake") {
    return <BrakeIllustration accentColor={accentColor} className={className} />;
  }

  return <CoiloverIllustration accentColor={accentColor} className={className} />;
}

export function CoiloverIllustration({ accentColor = "#E8331C", className = "" }: IllustrationProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 280 420"
      fill="none"
      vectorEffect="non-scaling-stroke"
    >
      <g stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M140 28 V392" opacity="0.42" />
        <path d="M110 33 H170" />
        <path d="M118 50 H162" />
        <path d="M116 369 H164" />
        <path d="M104 389 H176" />
        <path d="M132 57 H148 V118 H132 Z" opacity="0.95" />
        <path d="M128 285 H152 V368 H128 Z" opacity="0.95" />
        <path d="M116 116 H164 V288 H116 Z" opacity="0.82" />
        <path d="M108 128 H172" />
        <path d="M106 274 H174" />
        <path d="M120 143 C160 130 160 160 120 151 C80 142 80 172 120 164 C160 156 160 186 120 178 C80 170 80 200 120 192 C160 184 160 214 120 206 C80 198 80 228 120 220 C160 212 160 242 120 234 C80 226 83 254 122 248 C158 242 160 260 127 268" />
        <path d="M160 143 C120 130 120 160 160 151 C200 142 200 172 160 164 C120 156 120 186 160 178 C200 170 200 200 160 192 C120 184 120 214 160 206 C200 198 200 228 160 220 C120 212 120 242 160 234 C200 226 197 254 158 248 C122 242 120 260 153 268" />
        <path d="M88 118 H192" opacity="0.5" />
        <path d="M92 288 H188" opacity="0.5" />
        <path d="M96 118 L184 288" opacity="0.25" />
        <path d="M184 118 L96 288" opacity="0.25" />
      </g>
      <g stroke={accentColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M111 263 H169" />
        <path d="M112 275 H168" />
      </g>
      <g stroke="#ffffff" strokeWidth="1" opacity="0.24">
        <path d="M52 75 H93" />
        <path d="M187 75 H228" />
        <path d="M52 336 H93" />
        <path d="M187 336 H228" />
        <path d="M58 75 V336" />
        <path d="M222 75 V336" />
      </g>
    </svg>
  );
}

export function BrakeIllustration({ accentColor = "#E8331C", className = "" }: IllustrationProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 360 360"
      fill="none"
      vectorEffect="non-scaling-stroke"
    >
      <g stroke="#ffffff" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="172" cy="182" r="116" strokeWidth="1.5" opacity="0.92" />
        <circle cx="172" cy="182" r="78" strokeWidth="1.5" opacity="0.55" />
        <circle cx="172" cy="182" r="18" strokeWidth="1.5" />
        <path d="M172 63 V92" strokeWidth="1" opacity="0.42" />
        <path d="M172 272 V301" strokeWidth="1" opacity="0.42" />
        <path d="M53 182 H82" strokeWidth="1" opacity="0.42" />
        <path d="M262 182 H291" strokeWidth="1" opacity="0.42" />
        <path d="M101 111 L123 133" strokeWidth="1" opacity="0.34" />
        <path d="M244 254 L223 233" strokeWidth="1" opacity="0.34" />
        <path d="M243 110 L222 132" strokeWidth="1" opacity="0.34" />
        <path d="M101 254 L123 232" strokeWidth="1" opacity="0.34" />
        <path d="M169 107 C210 111 240 143 247 182" strokeWidth="1.5" opacity="0.75" />
        <path d="M175 257 C134 253 105 221 97 182" strokeWidth="1.5" opacity="0.75" />
        <path d="M264 114 C299 124 323 153 326 187 C329 221 311 253 281 268 L252 217 C263 208 269 196 268 182 C267 167 258 154 245 147 Z" strokeWidth="1.5" />
      </g>
      <path
        d="M270 132 C294 142 309 162 310 186 C312 210 300 231 280 244 L263 214 C273 205 278 195 277 183 C276 170 269 160 257 154 Z"
        stroke={accentColor}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <g stroke="#ffffff" strokeWidth="1" opacity="0.28">
        <path d="M73 62 H287" />
        <path d="M73 298 H287" />
        <path d="M62 73 V287" />
        <path d="M298 73 V287" />
      </g>
    </svg>
  );
}

type TrustIconProps = {
  icon: "fitment" | "wrench" | "shipping" | "driver" | "cart" | "menu" | "close" | "plus" | "minus";
  className?: string;
  accentColor?: string;
};

export function LineIcon({ icon, className = "", accentColor = "#E8331C" }: TrustIconProps) {
  const base = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 28 28">
      {icon === "fitment" && (
        <g {...base}>
          <path d="M5 9 H23" />
          <path d="M7 9 L10 5 H18 L21 9" />
          <path d="M8 9 L6 18 H22 L20 9" />
          <path d="M9 18 L8 22" />
          <path d="M19 18 L20 22" />
          <circle cx="10" cy="15" r="1.6" fill={accentColor} stroke="none" />
          <circle cx="18" cy="15" r="1.6" fill={accentColor} stroke="none" />
        </g>
      )}
      {icon === "wrench" && (
        <g {...base}>
          <path d="M18.5 5.5 A5 5 0 0 0 12.6 12 L5 19.6 L8.4 23 L16 15.4 A5 5 0 0 0 22.5 9.5 L19 13 L15 9 Z" />
          <path d="M6.5 21.5 L8.8 19.2" stroke={accentColor} />
        </g>
      )}
      {icon === "shipping" && (
        <g {...base}>
          <path d="M4 9 H17 V19 H4 Z" />
          <path d="M17 12 H22 L25 16 V19 H17 Z" />
          <path d="M7 21 A2 2 0 1 0 7 17 A2 2 0 0 0 7 21" />
          <path d="M21 21 A2 2 0 1 0 21 17 A2 2 0 0 0 21 21" />
          <path d="M7 6 H15" stroke={accentColor} />
        </g>
      )}
      {icon === "driver" && (
        <g {...base}>
          <circle cx="14" cy="14" r="9" />
          <path d="M7 14 H21" />
          <path d="M14 14 L20 10" stroke={accentColor} />
          <path d="M10 21 L12 16 H16 L18 21" />
        </g>
      )}
      {icon === "cart" && (
        <g {...base}>
          <path d="M5 6 H8 L10 18 H22 L24 10 H10" />
          <circle cx="12" cy="22" r="1.7" />
          <circle cx="21" cy="22" r="1.7" />
        </g>
      )}
      {icon === "menu" && (
        <g {...base}>
          <path d="M5 8 H23" />
          <path d="M5 14 H23" />
          <path d="M5 20 H23" />
        </g>
      )}
      {icon === "close" && (
        <g {...base}>
          <path d="M7 7 L21 21" />
          <path d="M21 7 L7 21" />
        </g>
      )}
      {icon === "plus" && (
        <g {...base}>
          <path d="M14 7 V21" stroke={accentColor} />
          <path d="M7 14 H21" stroke={accentColor} />
        </g>
      )}
      {icon === "minus" && (
        <g {...base}>
          <path d="M7 14 H21" stroke={accentColor} />
        </g>
      )}
    </svg>
  );
}
