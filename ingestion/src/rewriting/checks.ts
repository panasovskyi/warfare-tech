// Що перевіряємо: заголовок, опис, текст, назву видання й текст джерела
export type CheckInput = {
  title: string;
  description: string;
  body: string;
  sourceName: string;
  sourceText: string;
};

// TODO: ліміти — перші припущення, відкалібрувати на справжніх чернетках
// Скільки разів дозволено назвати видання в тексті (далі — лише «the outlet said»)
const MAX_OUTLET_NAME_MENTIONS = 1;
// Скільки разів дозволено написати «the outlet» або «the publication»
const MAX_GENERIC_REFERENCES = 3;
// Якщо видання стільки разів названо в самому тексті джерела, воно ще й предмет статті
// (прес-реліз компанії про себе), тож повторювати його назву природно
const FIRST_PARTY_MIN_MENTIONS = 3;
// Скільки відносних дат показувати в одному попередженні
const MAX_LISTED_DATES = 5;

// Прямі цитати: текст у лапках
const QUOTED = /“[^”]*”|"[^"]*"/g;
// «the source» без уточнення: англомовний читач сприйме це як анонімного інформатора
const BARE_SOURCE = /\bthe source(?: article| material)?\b(?! of\b)/gi;
// «the outlet» / «the publication»: загальні посилання на видання
const GENERIC_OUTLET = /\bthe (?:outlet|publication)\b/gi;
// Рядок на кшталт «Source: …» чи «Via: …»
const SOURCE_LINE = /^\s*(?:sources?|via|credits?|read more)\s*:/i;
// Відносні вирази часу (yesterday, last week…), які мають стати абсолютними датами
const RELATIVE_DATE =
  /\b(?:yesterday|today|tomorrow|tonight|(?:last|this|next) (?:week|month|year|spring|summer|autumn|fall|winter|weekend)|(?:a|one|two|three|several|few) (?:days?|weeks?|months?|years?) ago|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;

// Одиниці виміру, які пишуться з малої літери навіть у заголовку
const LOWERCASE_UNITS = new Set([
  'km',
  'm',
  'cm',
  'mm',
  'kg',
  't',
  'kt',
  'mph',
  'km/h',
  'm/s',
  'nm',
  'ft',
]);
// Скільки слів із малої літери показувати в попередженні
const MAX_LISTED_WORDS = 5;

// Екранує спецсимволи, щоб назву видання шукати як звичайний текст
const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Усі збіги шаблону в тексті (порожній список, якщо збігів нема)
const findAll = (text: string, pattern: RegExp): string[] =>
  text.match(pattern) ?? [];

// Знаходить три слова підряд, що повторюються (ознака збою в заголовку)
const findRepeatedPhrase = (text: string): string | null => {
  const words = text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const seen = new Set<string>();

  for (let i = 0; i + 3 <= words.length; i += 1) {
    const phrase = words.slice(i, i + 3).join(' ');

    if (seen.has(phrase)) {
      return phrase;
    }

    seen.add(phrase);
  }

  return null;
};

// Перевірки стилю й правил видання. Повертає список попереджень: вони не блокують публікацію
export const checkDraft = ({
  title,
  description,
  body,
  sourceName,
  sourceText,
}: CheckInput): string[] => {
  const warnings: string[] = [];
  // Прямі цитати зберігають слова джерела, тому їх не перевіряємо
  const text = body.replace(QUOTED, ' ');
  const nameMatcher = new RegExp(escapeRegExp(sourceName), 'gi');

  const isFirstParty =
    findAll(sourceText, nameMatcher).length >= FIRST_PARTY_MIN_MENTIONS;
  const nameMentions = findAll(text, nameMatcher).length;

  if (!isFirstParty && nameMentions > MAX_OUTLET_NAME_MENTIONS) {
    warnings.push(
      `The outlet "${sourceName}" is named ${nameMentions} times: name it once, then use "the outlet said" or "the publication reported"`,
    );
  }

  const bareSources = findAll(text, BARE_SOURCE).length;

  if (bareSources > 0) {
    warnings.push(
      `"the source" is used ${bareSources} time(s): it reads as an anonymous informant, use "the outlet" instead`,
    );
  }

  const genericReferences = findAll(text, GENERIC_OUTLET).length;

  if (genericReferences > MAX_GENERIC_REFERENCES) {
    warnings.push(
      `"the outlet" / "the publication" is used ${genericReferences} times: ${MAX_GENERIC_REFERENCES} at most`,
    );
  }

  // Текст — це Markdown: рядки без порожнього між ними склеюються в один абзац
  const brokenParagraph = body
    .split(/\n\s*\n/)
    .find(
      (paragraph) =>
        paragraph.trim().includes('\n') &&
        !paragraph
          .trim()
          .split('\n')
          .every((line) => /^\s*[-*]\s/.test(line)),
    );

  if (brokenParagraph) {
    warnings.push(
      `A paragraph is split into several lines ("${brokenParagraph.trim().slice(0, 40)}…"): Markdown joins such lines into one, put a blank line between paragraphs`,
    );
  }

  // Останній рядок тексту: сайт показує джерело окремо, тож рядок «Source: …» тут зайвий
  const lastLine = body.trim().split(/\r?\n/).at(-1) ?? '';

  if (SOURCE_LINE.test(lastLine)) {
    warnings.push(
      `The body ends with a source line ("${lastLine.trim()}"): the site shows the source separately, remove it`,
    );
  }

  const repeatedPhrase = findRepeatedPhrase(title);

  if (repeatedPhrase) {
    warnings.push(
      `The title repeats the phrase "${repeatedPhrase}": check it for a glitch`,
    );
  }

  // Слова заголовка з малої літери (крім одиниць виміру): у заголовку кожне слово з великої
  const lowercaseWords = title
    .split(/\s+/)
    .map((word) => word.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}/]+$/gu, ''))
    .filter((word) => /^\p{Ll}/u.test(word) && !LOWERCASE_UNITS.has(word));

  if (lowercaseWords.length > 0) {
    const listed = lowercaseWords
      .slice(0, MAX_LISTED_WORDS)
      .map((word) => `"${word}"`)
      .join(', ');

    warnings.push(
      `Title words not capitalized: ${listed}. Every word in a title must start with a capital letter`,
    );
  }

  const relativeDates = [
    ...new Set(
      findAll(`${title}\n${description}\n${text}`, RELATIVE_DATE).map((date) =>
        date.toLowerCase(),
      ),
    ),
  ];

  if (relativeDates.length > 0) {
    const listed = relativeDates
      .slice(0, MAX_LISTED_DATES)
      .map((date) => `"${date}"`)
      .join(', ');

    warnings.push(
      `Relative dates left in the text: ${listed}. Replace them with absolute dates or leave them out`,
    );
  }

  return warnings;
};
