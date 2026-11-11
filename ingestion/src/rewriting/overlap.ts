// Діапазон символів тексту рерайту: від start до end
export type OverlapRange = {
  start: number;
  end: number;
};

// Результат порівняння рерайту з джерелом: числа, рядок-підсумок, попередження й місця для виділення
export type OverlapReport = {
  longestRun: number;
  longestRunStart: string;
  sharedRatio: number;
  isTooClose: boolean;
  summary: string;
  warning: string | null;
  // Діапазони символів рерайту, що повторюють джерело: вони виділяються в чернетці
  ranges: OverlapRange[];
};

// Пороги — перші припущення
// Довжина «послідовності» слів, яку порівнюємо з джерелом
const GRAM_SIZE = 8;
// Скільки в послідовності має бути звичайних слів (не назв і чисел), щоб збіг рахувався
const MIN_ORDINARY_WORDS_IN_GRAM = 4;
// Однаковий уривок довший за це (у звичайних словах) вважається надто близьким
const MAX_IDENTICAL_RUN = 12;
// Частка спільних послідовностей, вище якої текст надто близький до джерела
const MAX_SHARED_RATIO = 0.12;
// Скільки слів показати в попередженні, щоб можна було знайти найдовший уривок
const LOCATOR_WORDS = 6;
// Відповідає правилу в промпті: більше п'яти звичайних слів підряд — забагато
const HIGHLIGHT_MIN_ORDINARY_WORDS = 6;

const QUOTED = /“[^”]*”|"[^"]*"/g;

// Одне слово тексту разом з позицією, щоб потім можна було виділити його в чернетці
type Token = {
  word: string;
  // Назви, позначення, числа й перше слово речення: вони мають лишатися як у джерелі,
  // тож не враховуються, коли вирішуємо, що текст «надто близький»
  isData: boolean;
  start: number;
  end: number;
};

// Розбиває текст на слова (літери й цифри) і запам'ятовує, де кожне слово стоїть
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

// Прямі цитати можуть збігатися з джерелом, тому порівнюється лише текст навколо них
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

// Кількість звичайних слів, без назв, позначень і чисел
const countOrdinaryWords = (tokens: Token[]): number =>
  tokens.filter((token) => !token.isData).length;

// Усі послідовності з GRAM_SIZE слів підряд, зі зсувом на одне слово
const toGrams = (tokens: Token[]): Token[][] => {
  const grams: Token[][] = [];

  for (let i = 0; i + GRAM_SIZE <= tokens.length; i += 1) {
    grams.push(tokens.slice(i, i + GRAM_SIZE));
  }

  return grams;
};

// Ключ послідовності для пошуку в наборі: її слова через пробіл
const gramKey = (gram: Token[]): string =>
  gram.map((token) => token.word).join(' ');

// Шукає найдовші уривки рерайту, що слово в слово є в джерелі
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

// Обгортає діапазони в ** (жирний): власник прибирає їх під час редагування,
// а публікація видаляє те, що лишилось. Діапазон ріжеться на переносах рядків:
// маркер не переходить через абзаци
export const highlightMatches = (
  text: string,
  ranges: OverlapRange[],
): string => {
  let result = text;

  // Йдемо з кінця, щоб попередні зміщення лишалися правильними, поки текст росте
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

// Для перекладених статей (джерело не англійською) збіги завжди ≈0%: метрика порівнює слова
// однієї мови
// Порівнює рерайт із джерелом: частка спільних послідовностей слів, найдовший однаковий уривок,
// місця для виділення. Цитати в лапках не рахуються
export const measureOverlap = (
  rewrite: string,
  source: string,
): OverlapReport => {
  const sourceTokens = toTokens(source);
  // Усі послідовності джерела в наборі: для швидкого пошуку збігів
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

      // Перелік назв і чисел — не копіювання: у послідовності мають переважати звичайні слова
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
  // Надто близько: або є завеликий однаковий уривок, або забагато спільних послідовностей
  const isTooClose =
    longestRun > MAX_IDENTICAL_RUN || sharedRatio > MAX_SHARED_RATIO;

  // Рядок-підсумок: потрапляє в чернетку й консоль
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
