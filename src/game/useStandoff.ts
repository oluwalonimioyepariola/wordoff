import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  canLockIn,
  canScout,
  createBrain,
  DuelState,
  forfeit as forfeitDuel,
  isShared,
  keyboardMarks,
  lockIn,
  Mark,
  revealedToYou,
  rowStrength,
  scout as scoutDuel,
  scoredHistory,
  scoutsLeft,
  sharedRows,
  TauntEvent,
  validateGuess,
  visibleHistory,
  wordLengthOf,
} from '../engine';
import { useSettings } from '../store/settings';
import { motion } from '../theme';
import { haptic } from './feedback';

/**
 * Drives one duel on screen: your typing and firing, the AI's "aiming" delay
 * (with its letters appearing as it types), the shot clock, reveals, and taunts.
 *
 * Split board: both lock in, then 3-2-1-DRAW and both rows flip together.
 * Shared board: turns alternate; each shot flips as soon as it's fired.
 *
 * The rules themselves live in the engine; this hook only sequences them.
 */

export type Phase = 'aiming' | 'countdown' | 'reveal' | 'result';
export type CountBeat = 3 | 2 | 1 | 'draw';

interface Options {
  initial: DuelState;
  /** Called after every state change (used to save progress mid-game). */
  onChange?(state: DuelState): void;
  /** Called once, after the final reveal finishes. */
  onFinish?(state: DuelState): void;
}

export function useStandoff({ initial, onChange, onFinish }: Options) {
  const { taunts: tauntsOn, reducedMotion } = useSettings();
  const shared = isShared(initial);
  const length = wordLengthOf(initial);
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
    () => createBrain(initial.config.opponent, initial.config.seed, initial.config.tuning, length),
    [initial.config.opponent, initial.config.seed, initial.config.tuning, length],
  );
  /** How many letters of its next guess the rival has "typed" while it aims. */
  const [rivalTyped, setRivalTyped] = useState(0);
  /** Shared board: the guess the rival is typing (shown letter by letter). */
  const [rivalDraft, setRivalDraft] = useState<string | null>(null);

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
    if (!initial.outcome && initial.round === 0) {
      later(400, () => say('intro'));
      if (shared && !reducedMotion) {
        setBeat('draw');
        later(motion.countdownBeat * 1.4, () => setBeat(null));
      }
    }
    // Intro only once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const finish = useCallback(
    (next: DuelState) => {
      setPhase('result');
      const { winner, reason } = next.outcome!;
      haptic(winner === 'you' ? 'win' : winner === 'ai' ? 'lose' : 'reveal');
      say(reason === 'photo-finish' ? 'photoFinish' : winner === 'you' ? 'youWin' : winner === 'ai' ? 'aiWins' : 'draw');
      onFinish?.(next);
    },
    [onFinish, say],
  );

  const flipMs = reducedMotion ? 200 : motion.flipStagger * (length - 1) + motion.flipHalf * 2;

  /** Split board: count, reveal both rows, then hand control back (or end). */
  const runRoundReveal = useCallback(
    (next: DuelState) => {
      const beats: CountBeat[] = reducedMotion ? ['draw'] : [3, 2, 1, 'draw'];
      setPhase('countdown');
      beats.forEach((b, i) => later(i * motion.countdownBeat, () => setBeat(b)));
      const countMs = beats.length * motion.countdownBeat;

      later(countMs, () => {
        setBeat(null);
        setPhase('reveal');
        haptic('reveal');
      });
      later(countMs + flipMs + 150, () => {
        if (next.outcome) return finish(next);
        const reveal = next.lastReveal!;
        if (next.suddenDeath && reveal.round === next.maxRows - 2) say('suddenDeath');
        else if (reveal.you.guess === null) say('youBlank');
        else if (reveal.ai.marks && rowStrength(reveal.ai.marks).greens >= 3) say('aiStrongRow');
        else if (reveal.you.marks && rowStrength(reveal.you.marks).greens >= 3) say('youStrongRow');
        roundStart.current = Date.now();
        setClockLeftMs(next.config.shotClockMs);
        setPhase('aiming');
      });
    },
    [finish, flipMs, reducedMotion, say],
  );

  /** Shared board: flip the shot just fired, then pass the turn (or end). */
  const runShotReveal = useCallback(
    (prev: DuelState, next: DuelState) => {
      setPhase('reveal');
      setRivalDraft(null);
      haptic('reveal');
      later(flipMs + 150, () => {
        if (next.outcome) return finish(next);
        const shot = next.lastShot!;
        const strong = shot.row.marks && rowStrength(shot.row.marks).greens >= Math.max(2, length - 2);
        if (next.suddenDeath && !prev.suddenDeath) say('suddenDeath');
        else if (shot.row.guess === null && shot.by === 'you') say('youBlank');
        else if (strong) say(shot.by === 'ai' ? 'aiStrongRow' : 'youStrongRow');
        roundStart.current = Date.now();
        setClockLeftMs(next.config.shotClockMs);
        setPhase('aiming');
      });
    },
    [finish, flipMs, length, say],
  );

  /** Applies a shot and starts the right reveal if it completed something. */
  const afterLock = useCallback(
    (prev: DuelState, next: DuelState) => {
      commit(next);
      if (isShared(next)) runShotReveal(prev, next);
      else if (next.round !== prev.round || next.outcome) runRoundReveal(next);
    },
    [commit, runRoundReveal, runShotReveal],
  );

  // The rival aims (typing its guess a letter at a time), then fires.
  const rivalsTurn = !state.outcome && (shared ? state.turn === 'ai' : !state.locked.ai);
  useEffect(() => {
    if (phase !== 'aiming' || !rivalsTurn) return;
    const cur = stateRef.current;
    const round = cur.round;
    const think = brain.thinkTimeMs(round);
    const guess = brain.nextGuess(visibleHistory(cur, 'ai'), cur.hint, cur.boards.ai.rows.length);
    const started = Date.now();
    setRivalTyped(0);
    if (shared) setRivalDraft(guess);
    const typing = setInterval(() => {
      setRivalTyped(Math.min(length, Math.floor(((Date.now() - started) / think) * (length + 1))));
    }, 120);
    const t = setTimeout(() => {
      clearInterval(typing);
      setRivalTyped(length);
      const now = stateRef.current;
      if (now.round !== round || !canLockIn(now, 'ai')) return;
      afterLock(now, lockIn(now, 'ai', guess, think));
    }, think);
    return () => {
      clearTimeout(t);
      clearInterval(typing);
    };
    // Re-run only when a new round/shot starts or play resumes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.round, phase, rivalsTurn]);

  const fire = useCallback(
    (guess: string | null) => {
      const cur = stateRef.current;
      if (phase !== 'aiming' || !canLockIn(cur, 'you')) return;
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

  const yourTurn = canLockIn(state, 'you');

  // Shot clock: counts down while it's your shot; at zero you fire a blank.
  useEffect(() => {
    const limit = state.config.shotClockMs;
    if (limit === null || phase !== 'aiming' || !yourTurn) return;
    const tick = setInterval(() => {
      const left = limit - (Date.now() - roundStart.current);
      setClockLeftMs(Math.max(0, left));
      if (left <= 0) {
        clearInterval(tick);
        fire(null);
      }
    }, 200);
    return () => clearInterval(tick);
  }, [state.config.shotClockMs, phase, yourTurn, state.round, fire]);

  const canType = phase === 'aiming' && yourTurn;

  const typeLetter = useCallback(
    (letter: string) => {
      if (!canType) return;
      setInput((cur) => {
        if (cur.length >= length) return cur;
        haptic('key');
        return cur + letter.toLowerCase();
      });
    },
    [canType, length],
  );

  const backspace = useCallback(() => {
    if (canType) setInput((cur) => cur.slice(0, -1));
  }, [canType]);

  const submit = useCallback(() => {
    if (input.length < length) {
      haptic('error');
      setError({ message: 'Not enough letters', id: Date.now() });
      return;
    }
    fire(input);
  }, [fire, input, length]);

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

  // Split board: while the count is running, the newest row stays face down on both boards.
  const hideLast = phase === 'countdown';
  const visibleYou = hideLast ? state.boards.you.rows.slice(0, -1) : state.boards.you.rows;
  const visibleAi = hideLast ? state.boards.ai.rows.slice(0, -1) : state.boards.ai.rows;
  const pendingYou = hideLast ? (state.boards.you.rows.at(-1)?.guess ?? '') : (state.locked.you?.guess ?? null);

  const revealed = revealedToYou(state);
  const keys = useMemo(() => {
    const history = shared ? visibleHistory(state, 'you') : scoredHistory({ ...state.boards.you, rows: visibleYou });
    const marks: Record<string, Mark> = keyboardMarks(history);
    for (const { letter } of revealed) marks[letter] = 'correct';
    return marks;
  }, [shared, state, visibleYou, revealed]);

  return {
    state,
    shared,
    length,
    phase,
    input,
    error,
    beat,
    taunt,
    clockLeftMs,
    profile: brain.profile,
    canType,
    /** It's your shot (shared) / you haven't locked in yet (split). */
    yourTurn: !state.outcome && yourTurn,
    rivalsTurn: !state.outcome && shared && state.turn === 'ai',
    /** Split board: your rows that are face up right now. */
    yourRows: visibleYou,
    rivalRows: visibleAi,
    /** Shared board: every row in firing order. */
    shots: sharedRows(state),
    /** Shared board: what the rival has typed so far this turn. */
    rivalTyping: shared && rivalDraft && phase === 'aiming' ? rivalDraft.slice(0, rivalTyped) : null,
    /** Split board: your locked-in guess waiting for the reveal (letters only, no colors). */
    pendingGuess: pendingYou,
    rivalLocked: !shared && (!!state.locked.ai || phase === 'countdown'),
    rivalTyped,
    youLocked: !shared && (!!state.locked.you || phase === 'countdown'),
    /** Split: index into your rows. Shared: index into shots. */
    revealingRow:
      phase === 'reveal' ? (shared ? (state.order?.length ?? 0) - 1 : state.boards.you.rows.length - 1) : null,
    /** Answer letters revealed to you (scouted, plus the sudden-death hint). */
    revealed,
    scoutsLeft: scoutsLeft(state),
    canScout: phase === 'aiming' && canScout(state),
    keys,
    typeLetter,
    backspace,
    submit,
    scout,
    forfeit,
  };
}
