import { getOpponent } from './ai/opponents';
import { Board, DuelState } from './duel';
import { Mark } from './types';

const TILES: Record<'standard' | 'colorblind', Record<Mark, string>> = {
  standard: { correct: '🟩', present: '🟨', absent: '⬛' },
  colorblind: { correct: '🟧', present: '🟦', absent: '⬛' },
};
const BLANK_ROW = '💨💨💨💨💨';

function rowsUsed(board: Board): string {
  return board.solvedRow === null ? 'X' : board.solvedRow > 6 ? 'SD' : String(board.solvedRow);
}

/**
 * Spoiler-free result card: both boards side by side as emoji, no letters.
 *
 *   Wordoff #170 🤠
 *   Me 4/6 vs The Sheriff 5/6, won
 *   🟨⬛⬛⬛⬛  ⬛🟨⬛⬛⬛
 *   ...
 */
export function buildShareText(state: DuelState, options: { colorblind?: boolean } = {}): string {
  const palette = TILES[options.colorblind ? 'colorblind' : 'standard'];
  const { config, boards, outcome } = state;
  const rival = getOpponent(config.opponent).name;

  const title =
    config.mode === 'daily' && config.dayNumber !== undefined
      ? `Wordoff #${config.dayNumber}`
      : config.mode === 'level' && config.levelId !== undefined
        ? `Wordoff Level ${config.levelId}`
        : 'Wordoff Quick Duel';
  const scouts = state.scouted?.length ?? 0;
  const flags = [
    config.hardMode && 'hard',
    config.shotClockMs !== null && 'shot clock',
    scouts > 0 && `🔍×${scouts}`,
  ].filter(Boolean);
  const result = !outcome
    ? 'in progress'
    : outcome.winner === 'you'
      ? outcome.reason === 'photo-finish'
        ? 'won by a hair'
        : 'won'
      : outcome.winner === 'ai'
        ? 'lost'
        : 'draw';

  const lines = [
    `${title} 🤠${flags.length ? ` (${flags.join(', ')})` : ''}`,
    `Me ${rowsUsed(boards.you)}/6 vs ${rival} ${rowsUsed(boards.ai)}/6, ${result}`,
  ];
  const rowCount = Math.max(boards.you.rows.length, boards.ai.rows.length);
  for (let i = 0; i < rowCount; i++) {
    const cell = (board: Board) => {
      const row = board.rows[i];
      if (!row) return '      ';
      return row.marks ? row.marks.map((m) => palette[m]).join('') : BLANK_ROW;
    };
    const marker = state.suddenDeath && i === 6 ? ' ☠️' : '';
    lines.push(`${cell(boards.you)}  ${cell(boards.ai)}${marker}`);
  }
  return lines.join('\n');
}
