import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canScout,
  createBrain,
  DuelState,
  forfeit as forfeitDuel,
  keyboardMarks,
  lockIn,
  Mark,
  revealedToYou,
  rowStrength,
  scout as scoutDuel,
  scoredHistory,
  scoutsLeft,
  TauntEvent,
  validateGuess,
  WORD_LENGTH,
} from '../engine';
import { useSettings } from '../store/settings';
import { motion } from '../theme';
import { haptic } from './feedback';

/**
 * Drives one standoff on screen: your typing and lock-in, the AI's "aiming"
 * delay, the shot clock, the 3-2-1-DRAW count, the reveal, and taunts.
 * The rules themselves live in the engine; this hook only sequences them.
 */

export type Phase = 'aiming' | 'countdown' | 'reveal' | 'result';
export type CountBeat = 3 | 2 | 1 | 'draw';

interface Options {
  initial: DuelState;
  /** Called after every state change (used to save the daily mid-game). */
  onChange?(state: DuelState): void;
  /** Called once, after the final reveal finishes. */
  onFinish?(state: DuelState): void;
}

export function useStandoff({ initial, onChange, onFinish }: Options) {
  const { taunts: tauntsOn, reducedMotion } = useSettings();
  const [state, setState] = useState(initial);
  const stateRef = useRef(initial);
  const [phase, setPhase] = useState<Phase>(initial.outcome ? 'result' : 'aiming');
  const [input, setInput] = useState('');
  const [error, setError] = useState<{ message: string; id: number } | null>(null);
  const [beat, setBeat] = useState<CountBeat | null>(null);
  const [taunt, setTaunt] = useState<{ event: TauntEvent; text: string; id: number } | null>(null);
  const [clockLeftMs, setClockLeftMs] = useState<number | null>(initial.config.shotClockMs);
  const roundStart = useRef(Date.now());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const brain = useMemo(
    () => createBrain(initial.config.opponent, initial.config.seed, initial.config.tuning),
    [initial.config.opponent, initial.config.seed, initial.config.tuning],
  );
  /** How many of the rival's five letters are "typed" while it aims (0–5). */
  const [rivalTyped, setRivalTyped] = useState(0);

  const later = (ms: number, fn: () => void) => {
    timers.current.push(setTimeout(fn, ms));
  };
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const commit = useCallback(
    (next: DuelState) => {
      stateRef.current = next;
      setState(next);
      onChange?.(next);
    },
    [onChange],
  );

  const say = useCallback(
    (event: TauntEvent) => {
      if (!tauntsOn) return;
      const lines = brain.profile.taunts[event];
      setTaunt({ event, text: lines[Math.floor(Math.random() * lines.length)], id: Date.now() });
    },
    [brain, tauntsOn],
  );

  useEffect(() => {
    if (!initial.outcome && initial.round === 0) later(400, () => say('intro'));
    // Intro only once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Plays the count, the reveal, then hands control back (or ends). */
  const runReveal = useCallback(
    (next: DuelState) => {
      const beats: CountBeat[] = reducedMotion ? ['draw'] : [3, 2, 1, 'draw'];
      setPhase('countdown');
      beats.forEach((b, i) => later(i * motion.countdownBeat, () => setBeat(b)));
      const countMs = beats.length * motion.countdownBeat;
      const flipMs = reducedMotion ? 200 : motion.flipStagger * (WORD_LENGTH - 1) + motion.flipHalf * 2;

      later(countMs, () => {
        setBeat(null);
        setPhase('reveal');
        haptic('reveal');
      });
      later(countMs + flipMs + 150, () => {
        const reveal = next.lastReveal!;
        if (next.outcome) {
          setPhase('result');
          const { winner, reason } = next.outcome;
          haptic(winner === 'you' ? 'win' : winner === 'ai' ? 'lose' : 'reveal');
          say(
            reason === 'photo-finish'
              ? 'photoFinish'
              : winner === 'you'
                ? 'youWin'
                : winner === 'ai'
                  ? 'aiWins'
                  : 'draw',
          );
          onFinish?.(next);
          return;
        }
        if (next.suddenDeath && reveal.round === next.maxRows - 2) say('suddenDeath');
        else if (reveal.you.guess === null) say('youBlank');
        else if (reveal.ai.marks && rowStrength(reveal.ai.marks).greens >= 3) say('aiStrongRow');
        else if (reveal.you.marks && rowStrength(reveal.you.marks).greens >= 3) say('youStrongRow');
        roundStart.current = Date.now();
        setClockLeftMs(next.config.shotClockMs);
        setPhase('aiming');
      });
    },
    [onFinish, reducedMotion, say],
  );

  /** Applies a lock-in and starts the reveal if that completed the round. */
  const afterLock = useCallback(
    (prev: DuelState, next: DuelState) => {
      commit(next);
      if (next.round !== prev.round || next.outcome) runReveal(next);
    },
    [commit, runReveal],
  );

  // The rival aims, then locks in, once per round.
  useEffect(() => {
    if (phase !== 'aiming' || state.outcome || state.locked.ai) return;
    const round = state.round;
    const think = brain.thinkTimeMs(round);
    const guess = brain.nextGuess(scoredHistory(state.boards.ai), state.hint);
    const started = Date.now();
    setRivalTyped(0);
    // Show the rival "typing" its guess, a letter at a time, while it aims.
    const typing = setInterval(() => {
      setRivalTyped(Math.min(WORD_LENGTH, Math.floor(((Date.now() - started) / think) * (WORD_LENGTH + 1))));
    }, 120);
    const t = setTimeout(() => {
      clearInterval(typing);
      setRivalTyped(WORD_LENGTH);
      const cur = stateRef.current;
      if (cur.round !== round || cur.locked.ai || cur.outcome) return;
      afterLock(cur, lockIn(cur, 'ai', guess, think));
    }, think);
    return () => {
      clearTimeout(t);
      clearInterval(typing);
    };
    // Re-run only when a new round starts or play resumes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.round, phase]);

  const fire = useCallback(
    (guess: string | null) => {
      const cur = stateRef.current;
      if (phase !== 'aiming' || cur.locked.you || cur.outcome) return;
      const elapsed = Date.now() - roundStart.current;
      if (guess === null) {
        haptic('error');
        afterLock(cur, lockIn(cur, 'you', null, cur.config.shotClockMs ?? elapsed));
        setInput('');
        return;
      }
      const check = validateGuess(cur, 'you', guess);
      if (!check.ok) {
        haptic('error');
        setError({ message: check.message, id: Date.now() });
        return;
      }
      haptic('lock');
      setInput('');
      afterLock(cur, lockIn(cur, 'you', check.guess, elapsed));
    },
    [afterLock, phase],
  );

  // Shot clock: counts down while you're aiming; at zero you fire a blank.
  useEffect(() => {
    const limit = state.config.shotClockMs;
    if (limit === null || phase !== 'aiming' || state.locked.you || state.outcome) return;
    const tick = setInterval(() => {
      const left = limit - (Date.now() - roundStart.current);
      setClockLeftMs(Math.max(0, left));
      if (left <= 0) {
        clearInterval(tick);
        fire(null);
      }
    }, 200);
    return () => clearInterval(tick);
  }, [state.config.shotClockMs, phase, state.locked.you, state.outcome, state.round, fire]);

  const canType = phase === 'aiming' && !state.locked.you && !state.outcome;

  const typeLetter = useCallback(
    (letter: string) => {
      if (!canType) return;
      setInput((cur) => {
        if (cur.length >= WORD_LENGTH) return cur;
        haptic('key');
        return cur + letter.toLowerCase();
      });
    },
    [canType],
  );

  const backspace = useCallback(() => {
    if (canType) setInput((cur) => cur.slice(0, -1));
  }, [canType]);

  const submit = useCallback(() => {
    if (input.length < WORD_LENGTH) {
      haptic('error');
      setError({ message: 'Not enough letters', id: Date.now() });
      return;
    }
    fire(input);
  }, [fire, input]);

  const scout = useCallback(() => {
    const cur = stateRef.current;
    if (phase !== 'aiming' || !canScout(cur)) return;
    const next = scoutDuel(cur);
    commit(next);
    haptic('lock');
    const index = next.scouted[next.scouted.length - 1];
    const ordinal = ['1st', '2nd', '3rd', '4th', '5th'][index];
    setError({ message: `Scouted: ${ordinal} letter is ${cur.config.answer[index].toUpperCase()}`, id: Date.now() });
  }, [commit, phase]);

  const forfeit = useCallback(() => {
    const cur = stateRef.current;
    if (cur.outcome) return;
    timers.current.forEach(clearTimeout);
    const next = forfeitDuel(cur, 'you');
    commit(next);
    setPhase('result');
    onFinish?.(next);
  }, [commit, onFinish]);

  // While the count is running, the newest row stays face down on both boards.
  const hideLast = phase === 'countdown';
  const visibleYou = hideLast ? state.boards.you.rows.slice(0, -1) : state.boards.you.rows;
  const visibleAi = hideLast ? state.boards.ai.rows.slice(0, -1) : state.boards.ai.rows;
  const pendingYou = hideLast ? (state.boards.you.rows.at(-1)?.guess ?? '') : (state.locked.you?.guess ?? null);

  const revealed = revealedToYou(state);
  const keys = useMemo(() => {
    const marks: Record<string, Mark> = keyboardMarks(scoredHistory({ ...state.boards.you, rows: visibleYou }));
    for (const { letter } of revealed) marks[letter] = 'correct';
    return marks;
  }, [state.boards.you, visibleYou, revealed]);

  return {
    state,
    phase,
    input,
    error,
    beat,
    taunt,
    clockLeftMs,
    profile: brain.profile,
    canType,
    /** Your rows that are face up right now. */
    yourRows: visibleYou,
    rivalRows: visibleAi,
    /** Your locked-in guess waiting for the reveal (letters only, no colors). */
    pendingGuess: pendingYou,
    rivalLocked: !!state.locked.ai || phase === 'countdown',
    rivalTyped,
    /** Answer letters revealed to you (scouted, plus the sudden-death hint). */
    revealed,
    scoutsLeft: scoutsLeft(state),
    canScout: phase === 'aiming' && canScout(state),
    scout,
    youLocked: !!state.locked.you || phase === 'countdown',
    revealingRow: phase === 'reveal' ? state.boards.you.rows.length - 1 : null,
    keys,
    typeLetter,
    backspace,
    submit,
    forfeit,
  };
}
