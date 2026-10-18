"use client";

import { useEffect, useRef } from "react";

/** Distant layers trail the scroll most: sky, far mesas, near ground, street. */
const DEPTH = [0.45, 0.32, 0.2, 0.08];

function Duelist({ scarf }: { scarf: string }) {
  return (
    <>
      {/* long shadow thrown toward the viewer by the low sun */}
      <path d="M-8 0 L10 0 L-30 50 L-66 50 Z" fill="#000" opacity="0.3" />
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
}

/**
 * High noon gone to sundown: the sun sets dead centre and two duelists face
 * each other across it. Composed around the middle so the standoff stays in
 * frame from a phone to a wide monitor; the layers drift apart on scroll.
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

  return (
    <svg ref={svg} className="absolute inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140904" />
          <stop offset="0.42" stopColor="#5e2a12" />
          <stop offset="0.76" stopColor="#c0622a" />
          <stop offset="1" stopColor="#f2c27a" />
        </linearGradient>
        <radialGradient id="bloom" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.95" />
          <stop offset="0.3" stopColor="#f8c977" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f0a24c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="dirt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4426" />
          <stop offset="1" stopColor="#2a160d" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0" r="0.55">
          <stop offset="0" stopColor="#f6b866" stopOpacity="0.5" />
          <stop offset="1" stopColor="#f6b866" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.7" stopColor="#4f3020" stopOpacity="0" />
          <stop offset="1" stopColor="#4f3020" />
        </linearGradient>
      </defs>

      <g data-layer="0">
        <rect y="-240" width="1440" height="1140" fill="url(#sky)" />
        <circle cx="720" cy="690" r="380" fill="url(#bloom)" />
        <circle cx="720" cy="690" r="112" fill="#fde7b6" />
        <g fill="#ffe6b0">
          {[
            [520, 480, 2.6, 0],
            [640, 560, 1.8, 4],
            [800, 440, 2.2, 8],
            [930, 590, 1.6, 2],
            [420, 600, 2, 11],
            [1010, 500, 1.8, 6],
          ].map(([x, y, r, d]) => (
            <circle key={`${x}`} className="animate-drift" style={{ animationDelay: `${d}s` }} cx={x} cy={y} r={r} />
          ))}
        </g>
      </g>
      <g data-layer="1">
        <path
          d="M0 744 L0 682 L150 682 L182 628 L330 628 L362 680 L560 680 L590 650 L660 650 L690 676 L760 676 L790 646 L870 646 L900 678 L1090 678 L1122 624 L1280 624 L1312 680 L1440 680 L1440 744 Z"
          fill="#d48a4a"
          opacity="0.5"
        />
      </g>
      <g data-layer="2">
        <path d="M0 746 L0 726 L240 722 L280 692 L380 692 L412 726 L1030 730 L1060 698 L1180 698 L1212 730 L1440 732 L1440 746 Z" fill="#8e4a24" />
        {/* the saloon, far left */}
        <g transform="translate(70 594)" fill="#24120a">
          <path d="M0 36 L0 20 L36 20 L36 8 L140 8 L140 20 L176 20 L176 36 L176 152 L0 152 Z" />
          <rect x="24" y="28" width="128" height="22" fill="#3a2214" />
          <rect x="32" y="34" width="112" height="10" fill="#b8862b" opacity="0.85" />
          <rect x="20" y="68" width="36" height="40" fill="#f2a94a" />
          <rect x="120" y="68" width="36" height="40" fill="#f2a94a" />
          <rect x="68" y="120" width="40" height="32" fill="#f2a94a" opacity="0.55" />
        </g>
        {/* a saguaro, far right */}
        <g transform="translate(1290 668)" fill="#221c0e">
          <rect x="18" y="0" width="16" height="78" rx="8" />
          <path d="M18 46 L8 46 C3 46 2 41 2 36 L2 18 C2 13 12 13 12 18 L12 36 L18 36 Z" />
          <path d="M34 32 L44 32 C49 32 50 28 50 22 L50 8 C50 3 40 3 40 8 L40 22 L34 22 Z" />
        </g>
      </g>
      <g data-layer="3">
        <rect y="744" width="1440" height="260" fill="url(#dirt)" />
        <rect y="744" width="1440" height="200" fill="url(#glow)" />
        <path d="M430 900 Q600 790 700 746" stroke="#2e180d" strokeWidth="3" opacity="0.4" fill="none" />
        <path d="M1010 900 Q840 790 740 746" stroke="#2e180d" strokeWidth="3" opacity="0.4" fill="none" />
        <g transform="translate(560 840) scale(2.1)" fill="#120804">
          <Duelist scarf="#3a5486" />
        </g>
        <g transform="translate(880 840) scale(-2.1 2.1)" fill="#120804">
          <Duelist scarf="#b8332c" />
        </g>
      </g>
      <rect width="1440" height="900" fill="url(#fade)" />
    </svg>
  );
}
