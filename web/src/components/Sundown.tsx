"use client";

import { useEffect, useRef } from "react";

/** Distant layers trail the scroll most: sky, far mesas, near mesas, street. */
const DEPTH = [0.45, 0.32, 0.2, 0.08];

/**
 * Main street at sundown, in four parallax layers with dust drifting through
 * the low sun. The same scene as the app's home screen, drawn wide.
 */
export function Sundown() {
  const svg = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(svg.current?.querySelectorAll<SVGGElement>("[data-layer]") ?? []);
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 900);
        layers.forEach((g) => g.setAttribute("transform", `translate(0 ${y * DEPTH[Number(g.dataset.layer)]})`));
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const duelist = (scarf: string) => (
    <>
      <path d="M-8 0 L10 0 L-26 44 L-58 44 Z" fill="#000" opacity="0.28" />
      <path d="M-8 -78 Q-7 -88 0 -86 Q7 -88 8 -78 Z" />
      <path d="M-19 -77 Q0 -82 19 -77 Q0 -73 -19 -77 Z" />
      <circle cx="0" cy="-68" r="6.5" />
      <path d="M-6 -61 L7 -61 L4 -55 L-4 -55 Z" fill={scarf} />
      <path d="M-9 -58 L9 -58 L12 -30 L16 -12 L-15 -12 L-11 -30 Z" />
      <path d="M-9 -14 L-3 -14 L-4 -1 L-11 0 Z" />
      <path d="M3 -14 L9 -14 L11 0 L4 -1 Z" />
      <path d="M6 -54 L26 -50 L26 -46 L6 -49 Z" />
      <path d="M25 -52 L35 -52 L35 -49 L28 -49 L27 -45 L25 -45 Z" />
    </>
  );

  return (
    <svg ref={svg} className="absolute inset-0 h-full w-full" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1e0f08" />
          <stop offset="0.38" stopColor="#6e3418" />
          <stop offset="0.74" stopColor="#c66a2a" />
          <stop offset="1" stopColor="#f2c27a" />
        </linearGradient>
        <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#f8c977" stopOpacity="0.45" />
          <stop offset="1" stopColor="#f0a24c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4426" />
          <stop offset="1" stopColor="#3a2014" />
        </linearGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.62" stopColor="#4f3020" stopOpacity="0" />
          <stop offset="1" stopColor="#4f3020" />
        </linearGradient>
      </defs>

      <g data-layer="0">
        <rect y="-200" width="1440" height="1020" fill="url(#sky)" />
        <circle cx="1060" cy="620" r="320" fill="url(#bloom)" />
        <circle cx="1060" cy="620" r="98" fill="#fde7b6" />
        <g fill="#ffe6b0">
          {[
            [760, 420, 2.6, 0],
            [900, 500, 1.8, 4],
            [1010, 360, 2.2, 8],
            [1180, 520, 1.6, 2],
            [680, 560, 2, 11],
            [1260, 410, 1.8, 6],
          ].map(([x, y, r, d]) => (
            <circle key={`${x}`} className="animate-drift" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r={r} />
          ))}
        </g>
      </g>
      <g data-layer="1">
        <path
          d="M0 660 L0 606 L180 606 L210 556 L360 556 L392 604 L640 604 L672 570 L790 570 L824 598 L1000 598 L1030 546 L1180 546 L1214 596 L1440 596 L1440 660 Z"
          fill="#d48a4a"
          opacity="0.55"
        />
      </g>
      <g data-layer="2">
        <path d="M0 662 L0 644 L260 640 L300 608 L420 608 L452 644 L1440 650 L1440 662 Z" fill="#8e4a24" />
        <g transform="translate(1250 512)" fill="#2a160d">
          <path d="M0 36 L0 20 L36 20 L36 8 L140 8 L140 20 L176 20 L176 36 L176 150 L0 150 Z" />
          <rect x="24" y="28" width="128" height="22" fill="#3a2214" />
          <rect x="32" y="34" width="112" height="10" fill="#b8862b" opacity="0.85" />
          <rect x="20" y="68" width="36" height="40" fill="#f2a94a" />
          <rect x="120" y="68" width="36" height="40" fill="#f2a94a" />
          <rect x="68" y="120" width="40" height="30" fill="#f2a94a" opacity="0.55" />
        </g>
        <g transform="translate(120 600)" fill="#2c2412">
          <rect x="18" y="0" width="16" height="62" rx="8" />
          <path d="M18 40 L8 40 C3 40 2 35 2 30 L2 14 C2 9 12 9 12 14 L12 30 L18 30 Z" />
          <path d="M34 28 L44 28 C49 28 50 24 50 18 L50 6 C50 1 40 1 40 6 L40 18 L34 18 Z" />
        </g>
      </g>
      <g data-layer="3">
        <rect y="660" width="1440" height="260" fill="url(#dirt)" />
        <path d="M640 820 Q860 700 1030 660" stroke="#2e180d" strokeWidth="3" opacity="0.4" fill="none" />
        <path d="M1300 820 Q1150 720 1090 660" stroke="#2e180d" strokeWidth="3" opacity="0.4" fill="none" />
        <g transform="translate(870 760) scale(1.9)" fill="#140a05">
          {duelist("#3a5486")}
        </g>
        <g transform="translate(1250 760) scale(-1.9 1.9)" fill="#140a05">
          {duelist("#b8332c")}
        </g>
      </g>
      <rect width="1440" height="820" fill="url(#fade)" />
    </svg>
  );
}
