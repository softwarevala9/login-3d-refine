import { useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";

/* =====================================================================
   Shared 3D + neon-outline primitives used across the login experience.
   Every interactive surface gets: extruded body, small blue neon rim,
   cursor-tracking spotlight, and a physical press response.
   ===================================================================== */

function useSpot() {
  const ref = useRef<HTMLElement | null>(null);
  const [s, setS] = useState({ x: 50, y: 50, on: false, px: 0, py: 0 });

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    setS({ x, y, on: true, px: (x - 50) / 50, py: (y - 50) / 50 });
  };
  const onLeave = () => setS({ x: 50, y: 50, on: false, px: 0, py: 0 });

  return { ref, s, onMove, onLeave };
}

/* --------------------------- 3D neon button --------------------------- */

type Tone = "primary" | "ghost" | "accent";

const TONES: Record<Tone, { body: string; rim: string; glow: string }> = {
  primary: {
    body: "linear-gradient(180deg, oklch(0.62 0.19 262), oklch(0.44 0.17 265) 55%, oklch(0.33 0.13 268))",
    rim: "oklch(0.80 0.17 245)",
    glow: "oklch(0.72 0.20 250)",
  },
  accent: {
    body: "linear-gradient(180deg, oklch(0.60 0.20 330), oklch(0.44 0.17 300) 55%, oklch(0.32 0.12 285))",
    rim: "oklch(0.82 0.15 300)",
    glow: "oklch(0.74 0.19 315)",
  },
  ghost: {
    body: "linear-gradient(180deg, oklch(0.34 0.03 265 / 0.85), oklch(0.20 0.02 265 / 0.9) 55%, oklch(0.14 0.02 265 / 0.95))",
    rim: "oklch(0.75 0.14 245)",
    glow: "oklch(0.68 0.16 248)",
  },
};

export function Button3D({
  tone = "ghost",
  className = "",
  children,
  radius = 14,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; radius?: number }) {
  const { ref, s, onMove, onLeave } = useSpot();
  const [down, setDown] = useState(false);
  const t = TONES[tone];

  return (
    <button
      {...rest}
      ref={ref as React.Ref<HTMLButtonElement>}
      onPointerMove={onMove}
      onPointerLeave={(e) => {
        onLeave();
        setDown(false);
        rest.onPointerLeave?.(e);
      }}
      onPointerDown={(e) => {
        setDown(true);
        rest.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setDown(false);
        rest.onPointerUp?.(e);
      }}
      className={[
        "group relative isolate inline-flex select-none items-center justify-center overflow-hidden",
        "font-medium text-white/90 outline-none transition-[transform,box-shadow] duration-200",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      ].join(" ")}
      style={{
        borderRadius: radius,
        background: t.body,
        transform: down
          ? "translateY(1px) scale(0.985)"
          : s.on
            ? `perspective(700px) rotateX(${-s.py * 5}deg) rotateY(${s.px * 6}deg) translateY(-1.5px)`
            : "none",
        boxShadow: down
          ? `inset 0 2px 6px oklch(0 0 0 / 0.55), inset 0 -1px 0 oklch(1 0 0 / 0.06), 0 0 0 1px ${t.rim.replace(")", " / 0.5)")}, 0 0 10px ${t.glow.replace(")", " / 0.35)")}`
          : `inset 0 1px 0 oklch(1 0 0 / 0.28), inset 0 -3px 8px oklch(0 0 0 / 0.45),
             0 0 0 1px ${t.rim.replace(")", s.on ? " / 0.85)" : " / 0.45)")},
             0 0 ${s.on ? "16px" : "8px"} ${t.glow.replace(")", s.on ? " / 0.55)" : " / 0.28)")},
             0 12px 26px -14px oklch(0 0 0 / 0.95)`,
        ...rest.style,
      }}
    >
      {/* spotlight follows the cursor across the face */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: s.on ? 1 : 0,
          background: `radial-gradient(120px 90px at ${s.x}% ${s.y}%, oklch(1 0 0 / 0.30), transparent 70%)`,
          mixBlendMode: "screen",
        }}
      />
      {/* top glass sheen */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[6%] top-0 h-1/2"
        style={{
          borderRadius: radius,
          background: "linear-gradient(180deg, oklch(1 0 0 / 0.20), transparent)",
        }}
      />
      <span className="relative z-10 inline-flex items-center justify-center gap-2">{children}</span>
    </button>
  );
}

/* ------------------------ 3D colourful icon orb ----------------------- */

const ORB_HUES: Record<string, [string, string]> = {
  blue: ["oklch(0.78 0.17 250)", "oklch(0.42 0.16 262)"],
  cyan: ["oklch(0.85 0.14 195)", "oklch(0.45 0.13 205)"],
  violet: ["oklch(0.78 0.17 300)", "oklch(0.40 0.16 300)"],
  pink: ["oklch(0.80 0.18 340)", "oklch(0.45 0.17 340)"],
  amber: ["oklch(0.86 0.16 80)", "oklch(0.55 0.16 55)"],
  green: ["oklch(0.83 0.16 155)", "oklch(0.45 0.14 160)"],
  red: ["oklch(0.75 0.20 25)", "oklch(0.42 0.17 25)"],
};

export type OrbHue = keyof typeof ORB_HUES;

export function IconOrb3D({
  icon: Icon,
  hue = "blue",
  size = 26,
  className = "",
}: {
  icon: LucideIcon;
  hue?: OrbHue;
  size?: number;
  className?: string;
}) {
  const [a, b] = ORB_HUES[hue] ?? ORB_HUES["blue"]!;
  return (
    <span
      className={`relative inline-grid shrink-0 place-items-center ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.34,
        background: `linear-gradient(160deg, ${a}, ${b})`,
        boxShadow: `inset 0 1px 0 oklch(1 0 0 / 0.55), inset 0 -2px 5px oklch(0 0 0 / 0.45),
          0 0 0 1px ${a.replace(")", " / 0.5)")}, 0 0 12px ${a.replace(")", " / 0.35)")},
          0 6px 12px -6px oklch(0 0 0 / 0.9)`,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-[15%] top-[6%] h-[38%] rounded-full"
        style={{ background: "linear-gradient(180deg, oklch(1 0 0 / 0.55), transparent)", filter: "blur(1px)" }}
      />
      <Icon
        className="relative z-10 text-white"
        style={{ width: size * 0.54, height: size * 0.54, filter: "drop-shadow(0 1px 2px oklch(0 0 0 / 0.6))" }}
      />
    </span>
  );
}

/* --------------------- 3D illustration for the slider ------------------ */

/**
 * Lightweight animated 3D-looking illustrations that fill the empty area of
 * each showcase slide. Pure CSS/SVG so the hero panel stays fast.
 */
export function SlideArt3D({ kind }: { kind: "os" | "shield" | "globe" }) {
  if (kind === "shield") {
    return (
      <div className="pointer-events-none relative size-full [perspective:900px]">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [animation:art-float_7s_ease-in-out_infinite] [transform-style:preserve-3d]">
          <svg width="150" height="150" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="shd" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.88 0.14 220)" />
                <stop offset="55%" stopColor="oklch(0.58 0.18 258)" />
                <stop offset="100%" stopColor="oklch(0.34 0.14 270)" />
              </linearGradient>
            </defs>
            <path
              d="M50 6 L86 20 V50 C86 72 68 88 50 94 C32 88 14 72 14 50 V20 Z"
              fill="url(#shd)"
              stroke="oklch(0.90 0.13 225)"
              strokeWidth="1.6"
              style={{ filter: "drop-shadow(0 12px 22px oklch(0 0 0 / 0.6))" }}
            />
            <path d="M50 6 L86 20 V50 C86 62 80 72 72 80 L50 52 Z" fill="oklch(1 0 0 / 0.13)" />
            <path
              d="M33 50 L45 63 L69 37"
              fill="none"
              stroke="#fff"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 0 8px oklch(0.9 0.15 220))" }}
            />
          </svg>
          <span
            aria-hidden
            className="absolute inset-0 -z-10 rounded-full blur-2xl [animation:art-pulse_4s_ease-in-out_infinite]"
            style={{ background: "radial-gradient(circle, oklch(0.75 0.18 250 / 0.7), transparent 70%)" }}
          />
        </div>
        <Art3DStyles />
      </div>
    );
  }

  if (kind === "globe") {
    return (
      <div className="pointer-events-none relative size-full">
        <div className="absolute left-1/2 top-1/2 size-[142px] -translate-x-1/2 -translate-y-1/2 [animation:art-float_8s_ease-in-out_infinite]">
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 32% 28%, oklch(0.92 0.10 210), oklch(0.52 0.17 250) 45%, oklch(0.22 0.10 265) 100%)",
              boxShadow:
                "inset -14px -18px 34px oklch(0 0 0 / 0.6), inset 8px 8px 22px oklch(1 0 0 / 0.22), 0 0 0 1px oklch(0.80 0.16 245 / 0.6), 0 0 26px oklch(0.72 0.18 250 / 0.45), 0 22px 34px -18px oklch(0 0 0 / 0.9)",
            }}
          />
          {/* meridians */}
          <div className="absolute inset-0 overflow-hidden rounded-full">
            <div className="absolute inset-0 [animation:art-spin_14s_linear_infinite]">
              {[18, 38, 58, 78].map((w) => (
                <span
                  key={w}
                  className="absolute left-1/2 top-0 h-full -translate-x-1/2 rounded-[50%] border"
                  style={{ width: `${w}%`, borderColor: "oklch(0.92 0.10 210 / 0.45)" }}
                />
              ))}
            </div>
            {[26, 50, 74].map((t) => (
              <span
                key={t}
                className="absolute inset-x-0 border-t"
                style={{ top: `${t}%`, borderColor: "oklch(0.92 0.10 210 / 0.30)" }}
              />
            ))}
          </div>
          {/* orbit ring */}
          <span
            className="absolute left-1/2 top-1/2 h-[190px] w-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full border [animation:art-orbit_9s_linear_infinite]"
            style={{ borderColor: "oklch(0.85 0.14 235 / 0.55)", transform: "rotateX(74deg)" }}
          />
        </div>
        <Art3DStyles />
      </div>
    );
  }

  // "os" — stacked holographic panels
  return (
    <div className="pointer-events-none relative size-full [perspective:1000px]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [animation:art-float_6.5s_ease-in-out_infinite]"
        style={{ transformStyle: "preserve-3d" }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-[86px] w-[140px] -translate-x-1/2 -translate-y-1/2 rounded-xl"
            style={{
              transform: `rotateX(58deg) rotateZ(-38deg) translateZ(${i * 22}px)`,
              background:
                "linear-gradient(135deg, oklch(0.62 0.17 258 / 0.85), oklch(0.30 0.12 268 / 0.85))",
              boxShadow:
                "inset 0 1px 0 oklch(1 0 0 / 0.4), 0 0 0 1px oklch(0.82 0.15 240 / 0.65), 0 0 16px oklch(0.72 0.18 250 / 0.4)",
              animation: `art-lift 4.6s ease-in-out ${i * 0.35}s infinite`,
            }}
          >
            <span className="absolute left-3 top-3 h-1 w-14 rounded-full bg-white/60" />
            <span className="absolute left-3 top-6 h-1 w-9 rounded-full bg-white/30" />
            <span className="absolute bottom-3 right-3 size-4 rounded-md bg-white/25" />
          </div>
        ))}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 size-[190px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl [animation:art-pulse_5s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle, oklch(0.70 0.19 255 / 0.6), transparent 70%)" }}
        />
      </div>
      <Art3DStyles />
    </div>
  );
}

function Art3DStyles() {
  return (
    <style>{`
      @keyframes art-float { 0%,100% { transform: translate(-50%,-50%) translateY(-5px); } 50% { transform: translate(-50%,-50%) translateY(7px); } }
      @keyframes art-pulse { 0%,100% { opacity: .55; transform: translate(-50%,-50%) scale(0.95); } 50% { opacity: 1; transform: translate(-50%,-50%) scale(1.08); } }
      @keyframes art-spin { to { transform: rotate(360deg); } }
      @keyframes art-orbit { 0% { transform: translate(-50%,-50%) rotateX(74deg) rotateZ(0deg); } 100% { transform: translate(-50%,-50%) rotateX(74deg) rotateZ(360deg); } }
      @keyframes art-lift { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
    `}</style>
  );
}
