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
