// Builds the bundled word lists so the game runs fully offline.
//   answers: scripts/answers.txt (curated, common words)
//   guesses: macOS /usr/share/dict/words 5-letter words + simple "-s" forms of 4-letter words
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DICT = '/usr/share/dict/words';
const isWord = (w) => /^[a-z]{5}$/.test(w);

const answers = [
  ...new Set(
    readFileSync(new URL('./answers.txt', import.meta.url), 'utf8')
      .split('\n')
      .filter((l) => !l.startsWith('#'))
      .join(' ')
      .split(/\s+/)
      .filter(Boolean),
  ),
].sort();
