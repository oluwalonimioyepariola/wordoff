import Image, { type StaticImageData } from "next/image";

/** A phone frame around a real app screenshot. */
export function Phone({ src, alt, className = "", priority = false, eager = false }: { src: StaticImageData; alt: string; className?: string; priority?: boolean; eager?: boolean }) {
  return (
    <div className={`relative rounded-[44px] bg-[#120a05] p-[10px] shadow-[0_0_0_2px_#3a2416,0_30px_70px_rgba(0,0,0,0.55)] ${className}`}>
      <Image src={src} alt={alt} priority={priority} loading={priority || eager ? "eager" : "lazy"} className="h-auto w-full rounded-[34px]" sizes="(max-width: 768px) 70vw, 330px" />
    </div>
  );
}

type Mark = "g" | "y" | "x" | "back" | undefined;

const CARD: Record<string, string> = {
  g: "bg-cactus text-card",
  y: "bg-brass text-ink",
  x: "bg-[#8a7562] text-card",
  back: "bg-[#7d2a22]",
  plain: "bg-card text-ink",
};

/** One row on the felt, built from the same pieces as the app: a seat chip and cards. */
export function FeltRow({ who, letters, marks = [] }: { who: "you" | "rival"; letters: string; marks?: Mark[] }) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-xl bg-felt p-2.5 shadow-[inset_0_0_18px_rgba(0,0,0,0.35)]" aria-hidden="true">
      <span
        className={`grid size-[30px] place-items-center rounded-full border-[3px] border-dashed border-[#f1e3c6] font-slab text-[9px] font-bold text-card ${
          who === "you" ? "bg-navy" : "bg-oxblood"
        }`}
      >
        {who === "you" ? "YOU" : "R"}
      </span>
      {letters.split("").map((l, i) => {
        const m = marks[i];
        return (
          <span
            key={i}
            className={`relative grid size-9 place-items-center rounded-md font-slab text-xl font-bold shadow-[0_2px_3px_rgba(0,0,0,0.35)] ${CARD[m ?? "plain"]}`}
            style={m === "back" ? { boxShadow: "inset 0 0 0 3px #7d2a22, inset 0 0 0 4px #f6ead2, 0 2px 3px rgba(0,0,0,0.35)" } : undefined}
          >
            {m === "back" ? <span className="size-2.5 rotate-45 bg-brass" /> : l}
          </span>
        );
      })}
    </div>
  );
}

/** A four-point brass star, for difficulty and ratings. */
export function Star({ on = true }: { on?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={`size-5 ${on ? "text-brass" : "text-brass/30"}`} aria-hidden="true">
      <path fill="currentColor" d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" />
    </svg>
  );
}

/** An ornament rule: two lines and a star between them. */
export function Ornament({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 text-ink-soft ${className}`} aria-hidden="true">
      <span className="h-px flex-1 bg-[#b89a6e]" />
      <svg viewBox="0 0 24 24" className="size-3">
        <path fill="currentColor" d="M12 1 L14.6 9.4 L23 12 L14.6 14.6 L12 23 L9.4 14.6 L1 12 L9.4 9.4 Z" />
      </svg>
      <span className="h-px flex-1 bg-[#b89a6e]" />
    </div>
  );
}
