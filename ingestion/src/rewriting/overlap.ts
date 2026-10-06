export type OverlapRange = {
  start: number;
  end: number;
};

export type OverlapReport = {
  longestRun: number;
  longestRunStart: string;
  sharedRatio: number;
  isTooClose: boolean;
  summary: string;
  warning: string | null;
  // Character ranges of the rewrite that repeat the source: they get highlighted in the draft
  ranges: OverlapRange[];
};

// TODO: пороги — перші припущення, відкалібрувати на кількох справжніх статтях
const GRAM_SIZE = 8;
const MIN_ORDINARY_WORDS_IN_GRAM = 4;
const MAX_IDENTICAL_RUN = 12;
const MAX_SHARED_RATIO = 0.12;
const LOCATOR_WORDS = 6;
// Matches the rule in the prompt: more than five consecutive ordinary words is too many
const HIGHLIGHT_MIN_ORDINARY_WORDS = 6;

const QUOTED = /“[^”]*”|"[^"]*"/g;

type Token = {
  word: string;
  // Names, designations, numbers and the first word of a sentence: they have to
  // stay as in the source, so they must not count towards a "too close" verdict
  isData: boolean;
  start: number;
  end: number;
};

const toTokens = (text: string, offset = 0): Token[] =>
  [...text.matchAll(/[\p{L}\p{N}]+/gu)].map((match) => {
    const start = offset + (match.index ?? 0);

    return {
      word: match[0].toLowerCase(),
      isData: /^\p{Lu}/u.test(match[0]) || /\p{N}/u.test(match[0]),
      start,
      end: start + match[0].length,
    };
  });

// Direct quotes may match the source, so only the text around them is compared
const splitOutsideQuotes = (
  text: string,
): Array<{ text: string; offset: number }> => {
  const parts: Array<{ text: string; offset: number }> = [];
  let last = 0;

  for (const match of text.matchAll(QUOTED)) {
    const index = match.index ?? 0;
    parts.push({ text: text.slice(last, index), offset: last });
    last = index + match[0].length;
  }

  parts.push({ text: text.slice(last), offset: last });

  return parts;
};

const countOrdinaryWords = (tokens: Token[]): number =>
  tokens.filter((token) => !token.isData).length;

const toGrams = (tokens: Token[]): Token[][] => {
  const grams: Token[][] = [];

  for (let i = 0; i + GRAM_SIZE <= tokens.length; i += 1) {
    grams.push(tokens.slice(i, i + GRAM_SIZE));
  }

  return grams;
};

const gramKey = (gram: Token[]): string =>
  gram.map((token) => token.word).join(' ');

const findMaximalRuns = (tokens: Token[], source: Token[]): Token[][] => {
  const runs: Token[][] = [];
  let i = 0;

  while (i < tokens.length) {
    let best = 0;

    for (let j = 0; j < source.length; j += 1) {
      let length = 0;

      while (
        i + length < tokens.length &&
        j + length < source.length &&
        tokens[i + length]?.word === source[j + length]?.word
      ) {
        length += 1;
      }

      best = Math.max(best, length);
    }

    if (best > 0) {
      runs.push(tokens.slice(i, i + best));
    }

    i += Math.max(best, 1);
  }

  return runs;
};

// Wraps the ranges in ** (bold): the owner deletes them while editing, and publishing
// removes what is left. A range is cut at line breaks: a marker does not carry across paragraphs
export const highlightMatches = (
  text: string,
  ranges: OverlapRange[],
): string => {
  let result = text;

  // From the end, so earlier offsets stay valid while the text grows
  for (const { start, end } of [...ranges].sort((a, b) => b.start - a.start)) {
    const marked = result
      .slice(start, end)
      .split(/(\n+)/)
      .map((piece) =>
        piece.trim() && !piece.includes('\n') ? `**${piece}**` : piece,
      )
      .join('');

    result = result.slice(0, start) + marked + result.slice(end);
  }

  return result;
};

// TODO: для перекладених статей (джерело не англійською) збіги завжди ≈0%, хоча текст іде за джерелом абзац за абзацом — метрика тут нічого не гарантує; вирішити, як оцінювати близькість до джерела (ручна перевірка чи перевірка моделлю)
export const measureOverlap = (
  rewrite: string,
  source: string,
): OverlapReport => {
  const sourceTokens = toTokens(source);
  const sourceGrams = new Set(toGrams(sourceTokens).map(gramKey));

  const segments = splitOutsideQuotes(rewrite)
    .map(({ text, offset }) => toTokens(text, offset))
    .filter((tokens) => tokens.length > 0);

  let totalGrams = 0;
  let sharedGrams = 0;
  let longestRun = 0;
  let longestRunStart = '';
  const ranges: OverlapRange[] = [];

  for (const tokens of segments) {
    for (const gram of toGrams(tokens)) {
      totalGrams += 1;

      // A list of names and numbers is not copying: the sequence must be mostly ordinary words
      if (
        sourceGrams.has(gramKey(gram)) &&
        countOrdinaryWords(gram) >= MIN_ORDINARY_WORDS_IN_GRAM
      ) {
        sharedGrams += 1;
      }
    }

    for (const run of findMaximalRuns(tokens, sourceTokens)) {
      const ordinaryWords = countOrdinaryWords(run);
      const first = run[0];
      const last = run[run.length - 1];

      if (ordinaryWords > longestRun) {
        longestRun = ordinaryWords;
        longestRunStart = run
          .slice(0, LOCATOR_WORDS)
          .map((token) => token.word)
          .join(' ');
      }

      if (first && last && ordinaryWords >= HIGHLIGHT_MIN_ORDINARY_WORDS) {
        ranges.push({ start: first.start, end: last.end });
      }
    }
  }

  const sharedRatio = totalGrams > 0 ? sharedGrams / totalGrams : 0;
  const isTooClose =
    longestRun > MAX_IDENTICAL_RUN || sharedRatio > MAX_SHARED_RATIO;

  const summary = `${Math.round(sharedRatio * 100)}% of ${GRAM_SIZE}-word sequences also appear in the source; longest identical passage: ${longestRun} ordinary words (names, numbers and quotes not counted)`;
  const warning = isTooClose
    ? `Too close to the source: rephrase the identical passages. The longest one (${longestRun} ordinary words) starts with "${longestRunStart}…"`
    : null;

  return {
    longestRun,
    longestRunStart,
    sharedRatio,
    isTooClose,
    summary,
    warning,
    ranges,
  };
};
