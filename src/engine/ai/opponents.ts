import { OpponentId } from '../types';

export type TauntEvent =
  | 'intro'
  | 'aiStrongRow' // AI just revealed 3+ greens
  | 'youStrongRow' // you just revealed 3+ greens
  | 'aiWins'
  | 'youWin'
  | 'draw'
  | 'suddenDeath'
  | 'youBlank' // your shot clock ran out
  | 'photoFinish'; // both solved on the same row, decided on time

export type Strategy = 'loose' | 'consistent' | 'information';

export interface OpponentProfile {
  id: OpponentId;
  name: string;
  /** What the game calls them mid-duel ("Rae has locked in"). */
  shortName: string;
  title: string;
  blurb: string;
  /** 1–3, shown as difficulty pips. */
  difficulty: 1 | 2 | 3;
  strategy: Strategy;
  /** Chance per turn the AI actually uses every clue it has (loose / consistent strategies). */
  clueDiscipline: number;
  /** Simulated time spent "aiming" per guess. Matters for photo finishes. */
  thinkMs: { min: number; max: number };
  taunts: Record<TauntEvent, string[]>;
}

export const OPPONENTS: Record<OpponentId, OpponentProfile> = {
  rookie: {
    id: 'rookie',
    name: 'Rookie Rae',
    shortName: 'Rae',
    title: 'The Greenhorn',
    blurb: 'Fresh off the stagecoach. Keeps her greens and skips the grays, but can’t work out where the yellows go.',
    difficulty: 1,
    strategy: 'loose',
    clueDiscipline: 0.1,
    thinkMs: { min: 3500, max: 8000 },
    taunts: {
      intro: ["Howdy! I've been practicing. Mostly.", 'Is it my turn? Is it yours? Let’s just go.'],
      aiStrongRow: ['Whoa, did I do that?', 'Beginner’s luck is still luck!'],
      youStrongRow: ['Hey, slow down, partner!', 'That’s… a lot of green.'],
      aiWins: ['I WON? Somebody write this down!', 'Wait till my ma hears about this.'],
      youWin: ['Good shootin’. I’ll get you next time.', 'Aw, shucks.'],
      draw: ['Nobody won? I’ll call that a win for me.'],
      suddenDeath: ['Sudden death?! Nobody told me about sudden death!'],
      youBlank: ['Did your trigger finger fall asleep?'],
      photoFinish: ['That close? My heart can’t take it.'],
    },
  },
  gunslinger: {
    id: 'gunslinger',
    name: 'Dusty Vance',
    shortName: 'Dusty',
    title: 'The Gunslinger',
    blurb: 'Steady hands, sharp eyes. Reads every clue more often than not, and trusts gut over math.',
    difficulty: 2,
    strategy: 'consistent',
    clueDiscipline: 0.4,
    thinkMs: { min: 2500, max: 6000 },
    taunts: {
      intro: ['Pick your word careful, stranger.', 'This town ain’t big enough for two solvers.'],
      aiStrongRow: ['Closing in.', 'I can smell the answer from here.'],
      youStrongRow: ['Not bad. Not good enough.', 'You’ve done this before.'],
      aiWins: ['Too slow.', 'Holster that keyboard, friend.'],
      youWin: ['Hm. Respect.', 'You drew first. Fair and square.'],
      draw: ['We walk away even. This time.'],
      suddenDeath: ['One bullet left. Make it count.'],
      youBlank: ['Clock’s ticking, and so are you.'],
      photoFinish: ['A hair’s breadth. Let’s see who blinked.'],
    },
  },
  sheriff: {
    id: 'sheriff',
    name: 'The Sheriff',
    shortName: 'The Sheriff',
    title: 'Law of the Land',
    blurb: 'Calculates every possibility. Fast, cold, and almost never wrong.',
    difficulty: 3,
    strategy: 'information',
    clueDiscipline: 1,
    thinkMs: { min: 1500, max: 4000 },
    taunts: {
      intro: ['Every word leaves tracks.', 'I’ve already narrowed it down.'],
      aiStrongRow: ['The net tightens.', 'Inevitable.'],
      youStrongRow: ['Interesting. Statistically unlikely.', 'You’re making this fun.'],
      aiWins: ['Justice is swift.', 'Expected outcome.'],
      youWin: ['…Well drawn. That won’t happen twice.', 'You beat the odds. Enjoy it.'],
      draw: ['A stalemate. Acceptable.'],
      suddenDeath: ['Sudden death favors the prepared.'],
      youBlank: ['Hesitation is a guess too. A bad one.'],
      photoFinish: ['Down to the millisecond. As it should be.'],
    },
  },
};

export const OPPONENT_ORDER: OpponentId[] = ['rookie', 'gunslinger', 'sheriff'];

export function getOpponent(id: OpponentId): OpponentProfile {
  return OPPONENTS[id];
}
