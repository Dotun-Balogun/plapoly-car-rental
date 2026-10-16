import type { VehicleType } from "@/lib/types";

const colors: Record<string, string> = {
  black: "#1f2733",
  white: "#eef1f5",
  silver: "#b7c0cc",
  grey: "#7b8594",
  gray: "#7b8594",
  red: "#c8372d",
  blue: "#2f5fc4",
  green: "#2f7a55",
  gold: "#c9a24b",
  champagne: "#cdb88b",
  brown: "#7a5236",
  maroon: "#7d2a35",
  orange: "#e0792a",
  yellow: "#e8b923",
};

export function carColor(name?: string | null) {
  if (!name) return "#7b8594";
  return colors[name.trim().toLowerCase()] ?? "#7b8594";
}

function Wheel({ cx, cy, r = 25 }: { cx: number; cy: number; r?: number }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r + 6} fill="#0f1720" opacity={0.88} />
      <circle cx={cx} cy={cy} r={r} fill="#111827" />
      <circle cx={cx} cy={cy} r={r * 0.55} fill="#cbd5e1" />
      <circle cx={cx} cy={cy} r={r * 0.2} fill="#64748b" />
    </g>
  );
}

const glass = "#cfe3f1";

/** Flat side-profile illustration of the vehicle, tinted with its colour. */
export function CarArt({
  type,
  color,
  className,
}: {
  type: VehicleType;
  color?: string | null;
  className?: string;
}) {
  const body = carColor(color);

  return (
    <svg viewBox="0 0 400 160" className={className} role="img" aria-label={`${type} illustration`}>
      <ellipse cx="200" cy="148" rx="176" ry="8" fill="#0f1720" opacity="0.14" />

      {(type === "sedan" || type === "luxury") && (
        <>
          <path
            d="M18 118 C18 104 26 98 44 94 L108 84 C124 62 150 46 186 46 L238 46 C272 46 298 62 318 84 L356 92 C376 96 384 104 384 118 L384 126 C384 130 380 132 376 132 L24 132 C20 132 18 130 18 126 Z"
            fill={body}
          />
          <path d="M122 82 C136 64 156 56 184 56 L196 56 L196 82 Z" fill={glass} />
          <path d="M206 56 L238 56 C260 56 278 66 296 82 L206 82 Z" fill={glass} />
          <path d="M18 112 L384 112 L384 126 C384 130 380 132 376 132 L24 132 C20 132 18 130 18 126 Z" fill="#000" opacity="0.14" />
          {type === "luxury" && <rect x="40" y="104" width="326" height="2.5" rx="1" fill="#f5a524" opacity="0.9" />}
          <Wheel cx={92} cy={132} />
          <Wheel cx={310} cy={132} />
        </>
      )}

      {type === "hatchback" && (
        <>
          <path
            d="M20 118 C20 104 26 98 40 94 L64 90 C76 66 100 50 134 48 L236 48 C270 48 296 62 316 84 L356 92 C376 96 384 104 384 118 L384 126 C384 130 380 132 376 132 L26 132 C22 132 20 130 20 126 Z"
            fill={body}
          />
          <path d="M80 86 C90 68 108 58 132 58 L194 58 L194 86 Z" fill={glass} />
          <path d="M204 58 L236 58 C258 58 276 68 294 86 L204 86 Z" fill={glass} />
          <path d="M20 112 L384 112 L384 126 C384 130 380 132 376 132 L26 132 C22 132 20 130 20 126 Z" fill="#000" opacity="0.14" />
          <Wheel cx={92} cy={132} />
          <Wheel cx={310} cy={132} />
        </>
      )}

      {type === "suv" && (
        <>
          <path
            d="M16 120 C16 106 22 98 36 94 L58 90 L74 52 C76 46 82 42 90 42 L282 42 C292 42 298 46 304 52 L330 86 L360 92 C378 96 386 104 386 120 L386 128 C386 131 383 133 380 133 L22 133 C19 133 16 131 16 128 Z"
            fill={body}
          />
          <rect x="96" y="36" width="178" height="4" rx="2" fill="#0f1720" opacity="0.55" />
          <path d="M90 52 L186 52 L186 82 L78 82 Z" fill={glass} />
          <path d="M196 52 L280 52 C285 52 288 54 291 57 L316 82 L196 82 Z" fill={glass} />
          <path d="M16 114 L386 114 L386 128 C386 131 383 133 380 133 L22 133 C19 133 16 131 16 128 Z" fill="#000" opacity="0.14" />
          <Wheel cx={96} cy={133} r={27} />
          <Wheel cx={308} cy={133} r={27} />
        </>
      )}

      {type === "pickup" && (
        <>
          <path d="M16 96 L150 96 L150 133 L22 133 C19 133 16 131 16 128 Z" fill={body} />
          <path
            d="M150 90 L200 90 C206 62 224 48 252 48 L290 48 C306 48 320 60 332 84 L362 92 C380 96 388 104 388 118 L388 128 C388 131 385 133 382 133 L150 133 Z"
            fill={body}
          />
          <path d="M24 100 L146 100 L146 107 L24 107 Z" fill="#000" opacity="0.2" />
          <path d="M214 88 C220 66 232 58 252 58 L288 58 C298 58 308 66 318 86 Z" fill={glass} />
          <path d="M16 118 L388 118 L388 128 C388 131 385 133 382 133 L22 133 C19 133 16 131 16 128 Z" fill="#000" opacity="0.14" />
          <Wheel cx={92} cy={133} r={26} />
          <Wheel cx={312} cy={133} r={26} />
        </>
      )}

      {type === "bus" && (
        <>
          <path
            d="M14 120 C14 100 16 60 24 48 C28 40 34 38 42 38 L300 38 C316 38 328 44 338 62 L364 92 C380 98 388 106 388 120 L388 128 C388 131 385 133 382 133 L20 133 C17 133 14 131 14 128 Z"
            fill={body}
          />
          {[34, 92, 150, 208].map((x) => (
            <rect key={x} x={x} y="48" width="50" height="32" rx="4" fill={glass} />
          ))}
          <path d="M268 48 L300 48 C310 48 316 53 322 63 L340 84 L268 84 Z" fill={glass} />
          <rect x="14" y="98" width="374" height="5" fill="#f5a524" opacity="0.95" />
          <path d="M14 114 L388 114 L388 128 C388 131 385 133 382 133 L20 133 C17 133 14 131 14 128 Z" fill="#000" opacity="0.14" />
          <Wheel cx={92} cy={133} r={26} />
          <Wheel cx={312} cy={133} r={26} />
        </>
      )}

      {/* lights (front is on the right) */}
      <rect x="370" y="100" width="12" height="6" rx="3" fill="#fde68a" />
      <rect x="18" y="100" width="10" height="6" rx="3" fill="#ef4444" />
    </svg>
  );
}
