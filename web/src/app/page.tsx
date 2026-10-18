import Image from "next/image";
import mainStreet from "@/assets/screens/01-main-street.png";
import duelTable from "@/assets/screens/02-duel-table.png";
import wantedPoster from "@/assets/screens/03-wanted-poster.png";
import rivalAiming from "@/assets/screens/04-rival-aiming.png";
import trailMap from "@/assets/screens/05-trail-map.png";
import trophyRoom from "@/assets/screens/06-trophy-room.png";
import ledger from "@/assets/screens/07-ledger.png";
import houseRules from "@/assets/screens/09-house-rules.png";
import logo from "@/assets/logo.svg";
import { CardTitle } from "@/components/CardTitle";
import { Reveal } from "@/components/Reveal";
import { Sundown } from "@/components/Sundown";
import { FeltRow, Ornament, Phone, Star } from "@/components/Table";

const REPO = "https://github.com/oluwalonimioyepariola/wordoff";
// Always the newest APK attached to the latest GitHub release.
const APK = `${REPO}/releases/latest/download/wordoff.apk`;
const RELEASES = `${REPO}/releases/latest`;

/** The Android robot head, simplified. */
function AndroidMark({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M17.6 9.48l1.84-3.18a.38.38 0 0 0-.66-.38l-1.86 3.22A11.4 11.4 0 0 0 12 8.2c-1.77 0-3.43.33-4.92.94L5.22 5.92a.38.38 0 0 0-.66.38L6.4 9.48A10.6 10.6 0 0 0 1 18h22a10.6 10.6 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
      />
    </svg>
  );
}

const RIVALS = [
  {
    name: "Rookie Rae",
    alias: "The Greenhorn",
    level: 1,
    blurb: "Keeps her greens and skips the grays, but can’t work out where the yellows go. Your first ten levels, with four-letter words.",
    tilt: "lg:-rotate-2",
    size: "lg:pt-10",
  },
  {
    name: "Dusty Vance",
    alias: "The Gunslinger",
    level: 2,
    blurb: "Steady hands, sharp eyes. Reads every clue more often than not and trusts his gut over the maths.",
    tilt: "lg:rotate-1",
    size: "lg:pt-6",
  },
  {
    name: "The Sheriff",
    alias: "Law of the Land",
    level: 3,
    blurb: "Calculates every possibility and picks the guess that narrows the field the most. Fast, cold, and almost never wrong.",
    tilt: "lg:-rotate-[0.8deg]",
    size: "lg:pt-2",
  },
];

const SCREENS = [
  { src: mainStreet, title: "Main Street", note: "today’s Daily Standoff" },
  { src: duelTable, title: "The table", note: "take turns, read every card" },
  { src: rivalAiming, title: "Rival’s turn", note: "her cards dealt face down" },
  { src: wantedPoster, title: "The verdict", note: "stamped and shareable" },
  { src: trailMap, title: "The Trail", note: "30 levels, three chapters" },
  { src: trophyRoom, title: "Trophy Room", note: "22 badges to earn" },
  { src: ledger, title: "The Ledger", note: "every standoff on record" },
  { src: houseRules, title: "House Rules", note: "learn it in a minute" },
];

const FEATURES = [
  ["Daily Standoff", "one word a day, the same rival game for everyone"],
  ["Level mode", "30 levels from Dusty Trail to High Noon"],
  ["Quick Duel", "4 or 5 letters, single or best of 3 and 5"],
  ["Streaks & freezes", "a freeze every seven days covers a missed one"],
  ["Scouts", "reveal a letter when you’re stuck, at a cost"],
  ["Shot clock", "20, 30 or 60 seconds, or none at all"],
  ["Share card", "a spoiler-free grid of the whole duel"],
  ["Accessible", "colourblind cards, reduced motion, dark mode"],
];

export default function Home() {
  return (
    <>
      {/* ---------- nav ---------- */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex w-[min(1160px,100%-32px)] items-center justify-between py-5">
          <a href="#top" className="flex items-center gap-2.5" aria-label="Wordoff home">
            <Image src={logo} alt="" className="size-10" priority />
            <span className="font-display text-xl tracking-wider text-cream">WORDOFF</span>
          </a>
          <nav aria-label="Sections" className="hidden gap-7 font-slab text-[17px] font-semibold text-[#f0d9ae] md:flex">
            {[
              ["#how", "How it plays"],
              ["#rivals", "The rivals"],
              ["#screens", "Screens"],
              ["#play", "Play it"],
            ].map(([href, label]) => (
              <a key={href} href={href} className="transition-colors hover:text-brass-hi">
                {label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main id="top">
        {/* ---------- hero: the standoff ---------- */}
        <section className="relative flex min-h-[100svh] flex-col overflow-hidden bg-[#140904]">
          <Sundown />
          <div className="relative z-10 mx-auto flex w-[min(1160px,100%-32px)] flex-col items-center pt-28 text-center sm:pt-36">
            <p className="font-slab text-[12px] font-semibold uppercase tracking-[0.22em] text-[#e9c48c] sm:text-sm sm:tracking-[0.34em]">
              One word · Two guns · High noon
            </p>
            <div className="mt-6 sm:mt-8">
              <CardTitle />
            </div>
            <p className="mt-8 max-w-[34ch] text-lg leading-relaxed text-[#fbecd0] [text-shadow:0_1px_10px_rgba(0,0,0,0.5)] sm:text-xl">
              A word game played as a duel. You and your rival chase the same secret word across one saloon table. Whoever lands it first wins.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:gap-7">
              <a href={APK} className="seal text-base sm:text-lg" download>
                <span className="whitespace-nowrap">
                  <AndroidMark />
                  <span className="sm:hidden">GET THE APK</span>
                  <span className="hidden sm:inline">DOWNLOAD FOR ANDROID</span>
                </span>
              </a>
              <a href="#how" className="font-slab text-lg font-semibold text-[#f0d9ae] underline decoration-brass/60 underline-offset-4 hover:text-brass-hi">
                See how it plays
              </a>
            </div>
          </div>
          {/* the street gets the bottom of the screen */}
          <div className="min-h-[30svh] flex-1" />
          <dl className="relative z-10 mx-auto mb-8 flex w-[min(1160px,100%-32px)] flex-wrap justify-center gap-x-8 gap-y-2 font-slab text-[15px] font-semibold text-[#f3dfbd] [text-shadow:0_1px_6px_rgba(0,0,0,0.6)]">
            {[
              ["3", "rivals"],
              ["30", "levels"],
              ["1", "Daily Standoff"],
              ["0", "accounts needed"],
            ].map(([n, label]) => (
              <div key={label} className="flex gap-1.5">
                <dt className="text-brass-hi">{n}</dt>
                <dd>{label}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ---------- house rules ---------- */}
        <section id="how" className="py-24">
          <div className="mx-auto w-[min(1160px,100%-32px)]">
            <Reveal>
              <div className="paper nail relative rounded-[3px] px-6 pb-12 pt-16 sm:px-14">
                <h2 className="text-center font-display text-[clamp(34px,5vw,52px)] leading-tight tracking-wide">House Rules</h2>
                <p className="mx-auto mt-2 max-w-[46ch] text-center font-slab text-xl italic text-ink-soft">Three things to know before you sit down at the table.</p>
                <Ornament className="my-10" />
                <div className="grid gap-12 md:grid-cols-3">
                  {[
                    {
                      n: "I",
                      title: "Take your shot",
                      body: "Type a word and fire. Your rival answers on the same table, dealing her guess face down before she turns it over.",
                      row: (
                        <div className="flex flex-col gap-1.5">
                          <FeltRow who="you" letters="RATE" />
                          <FeltRow who="rival" letters="LAKE" marks={["back", "back", "back", "back"]} />
                        </div>
                      ),
                    },
                    {
                      n: "II",
                      title: "Read the cards",
                      body: "Green is the right letter in the right spot, gold is in the word but elsewhere. Her cards help you as much as your own.",
                      row: <FeltRow who="you" letters="CATE" marks={["x", "g", "y", "g"]} />,
                    },
                    {
                      n: "III",
                      title: "Land it first",
                      body: "Turn over the whole word before she does. If the table fills up, sudden death shows a letter and you each get one last shot.",
                      row: <FeltRow who="you" letters="LATE" marks={["g", "g", "g", "g"]} />,
                    },
                  ].map((r, i) => (
                    <Reveal key={r.n} delay={i * 120}>
                      {r.row}
                      <h3 className="mt-5 flex items-baseline gap-3 font-slab text-2xl font-bold">
                        <span className="font-display text-2xl text-oxblood">{r.n}</span>
                        {r.title}
                      </h3>
                      <p className="mt-2 text-ink">{r.body}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- the rivals ---------- */}
        <section id="rivals" className="pb-24 pt-6">
          <div className="mx-auto w-[min(1160px,100%-32px)]">
            <Reveal>
              <h2 className="text-center font-display text-[clamp(34px,5vw,52px)] text-[#f8e8c8]">Three rivals in town</h2>
              <p className="mx-auto mt-2 text-center font-slab text-xl italic text-cream-soft">They play fair: each only ever learns from the cards on the table.</p>
            </Reveal>
            <div className="mt-14 grid grid-cols-[minmax(0,1fr)] items-end gap-8 lg:grid-cols-[0.92fr_1fr_1.1fr]">
              {RIVALS.map((r, i) => (
                <Reveal key={r.name} delay={i * 140} className={r.size}>
                  <article className={`paper px-5 pb-8 pt-9 sm:px-7 text-center ${r.tilt}`}>
                    <div className={`font-display leading-none tracking-[0.12em] ${i === 2 ? "text-[clamp(32px,11vw,46px)]" : "text-[clamp(28px,9.5vw,38px)]"}`}>WANTED</div>
                    <p className="mt-4 font-slab text-2xl font-bold uppercase tracking-[0.12em]">{r.name}</p>
                    <p className="font-slab italic text-ink-soft">alias “{r.alias}”</p>
                    <div className="mt-3 flex justify-center gap-1" aria-label={`Difficulty ${r.level} of 3`}>
                      {[0, 1, 2].map((s) => (
                        <Star key={s} on={s < r.level} />
                      ))}
                    </div>
                    <p className="mt-4 text-[15px]">{r.blurb}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- the prototype ---------- */}
        <section id="screens" className="py-24">
          <div className="mx-auto w-[min(1160px,100%-32px)]">
            <Reveal>
              <h2 className="text-center font-display text-[clamp(34px,5vw,52px)] text-[#f8e8c8]">The working prototype</h2>
              <p className="mx-auto mt-2 text-center font-slab text-xl italic text-cream-soft">Real screenshots from the app running in the iOS Simulator.</p>
            </Reveal>
            <div className="mt-16 grid grid-cols-2 gap-x-5 gap-y-14 md:grid-cols-4 md:gap-x-7">
              {SCREENS.map((s, i) => (
                <Reveal key={s.title} delay={(i % 4) * 90} className={i % 2 ? "translate-y-8" : ""}>
                  <figure>
                    <Phone src={s.src} alt={`Wordoff: ${s.title}`} eager className="rounded-[32px] p-2 [&_img]:rounded-[25px]" />
                    <figcaption className="mt-4 text-center font-slab font-semibold text-cream">
                      {s.title}
                      <small className="block text-sm font-medium italic text-cream-soft">{s.note}</small>
                    </figcaption>
                  </figure>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- what's in the saddlebag ---------- */}
        <section className="pb-24 pt-16">
          <div className="mx-auto w-[min(1160px,100%-32px)]">
            <Reveal>
              <div className="paper nail relative rounded-[3px] px-6 pb-12 pt-16 sm:px-14">
                <h2 className="text-center font-display text-[clamp(32px,5vw,48px)] leading-tight tracking-wide">What’s in the saddlebag</h2>
                <p className="mx-auto mt-2 text-center font-slab text-xl italic text-ink-soft">Everything runs on your phone. No account, no server, no ads.</p>
                <dl className="mt-10 grid gap-x-14 md:grid-cols-2">
                  {FEATURES.map(([title, body]) => (
                    <div key={title} className="flex items-baseline gap-4 border-b border-rule py-4">
                      <dt className="whitespace-nowrap font-slab text-[19px] font-bold">{title}</dt>
                      <dd className="text-[15px] text-ink-soft">{body}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- play it ---------- */}
        <section id="play" className="pb-28 pt-10">
          <Reveal className="mx-auto flex w-[min(720px,100%-32px)] flex-col items-center text-center">
            <Image src={logo} alt="" className="size-20 sm:size-24" />
            <h2 className="mt-6 font-display text-[clamp(32px,6vw,52px)] leading-tight text-[#f8e8c8]">Play it today</h2>
            <p className="mt-4 max-w-[44ch] text-[#e9d7b6]">
              Download the APK on your Android phone and open it. The first time, your phone asks you to allow installs from your browser. Not in the app stores yet.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-4">
              <a href={APK} className="seal text-[17px]" download>
                <span>
                  <AndroidMark />
                  GET THE APK
                </span>
              </a>
              <a href={RELEASES} className="font-slab text-lg font-semibold text-[#f0d9ae] underline decoration-brass/60 underline-offset-4 hover:text-brass-hi">
                All releases
              </a>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="pb-16 pt-6 text-center text-sm text-cream-soft">
        <Image src={logo} alt="Wordoff sheriff star logo" className="mx-auto mb-3 size-14" />
        Wordoff · a word standoff · built with React Native and Expo
      </footer>
    </>
  );
}
