/**
 * WORDOFF dealt as a row of playing cards on the felt. Each card lands face
 * down, then turns over to a green "right letter, right spot" face, one after
 * another: the title is a winning row. CSS-only; reduced motion shows the
 * final row straight away.
 */
const LETTERS = "WORDOFF".split("");

export function CardTitle() {
  return (
    <h1 aria-label="Wordoff" className="flex justify-center gap-[clamp(4px,1.1vw,12px)]">
      {LETTERS.map((l, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="card-flip relative block aspect-[5/6] w-[clamp(40px,11.2vw,104px)] [perspective:800px]"
          style={{ "--i": i } as React.CSSProperties}
        >
          <span className="card-inner absolute inset-0 [transform-style:preserve-3d]">
            {/* back: oxblood with a brass diamond inside a cream border */}
            <span className="absolute inset-0 grid place-items-center rounded-[clamp(4px,0.8vw,10px)] bg-[#7d2a22] shadow-[inset_0_0_0_3px_#7d2a22,inset_0_0_0_4px_#f6ead2,0_6px_14px_rgba(0,0,0,0.45)] [backface-visibility:hidden]">
              <span className="size-[28%] rotate-45 bg-brass" />
            </span>
            {/* face: cactus green, cream wood-type letter */}
            <span className="absolute inset-0 grid place-items-center rounded-[clamp(4px,0.8vw,10px)] bg-cactus font-display text-[clamp(26px,7.6vw,72px)] leading-none text-card shadow-[0_6px_14px_rgba(0,0,0,0.45),inset_0_-4px_0_rgba(0,0,0,0.18)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              {l}
            </span>
          </span>
        </span>
      ))}
    </h1>
  );
}
