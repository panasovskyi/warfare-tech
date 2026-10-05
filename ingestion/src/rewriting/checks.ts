export type CheckInput = {
  title: string;
  description: string;
  body: string;
  sourceName: string;
  sourceText: string;
};

// TODO: ліміти — перші припущення, відкалібрувати на справжніх чернетках
const MAX_OUTLET_NAME_MENTIONS = 1;
const MAX_GENERIC_REFERENCES = 3;
// If the source text itself names the outlet this often, the outlet is also the
// subject (a company's own press release), so naming it repeatedly is natural
const FIRST_PARTY_MIN_MENTIONS = 3;
const MAX_LISTED_DATES = 5;

const QUOTED = /“[^”]*”|"[^"]*"/g;
const BARE_SOURCE = /\bthe source(?: article| material)?\b(?! of\b)/gi;
const GENERIC_OUTLET = /\bthe (?:outlet|publication)\b/gi;
const SOURCE_LINE = /^\s*(?:sources?|via|credits?|read more)\s*:/i;
const RELATIVE_DATE =
  /\b(?:yesterday|today|tomorrow|tonight|(?:last|this|next) (?:week|month|year|spring|summer|autumn|fall|winter|weekend)|(?:a|one|two|three|several|few) (?:days?|weeks?|months?|years?) ago|on (?:monday|tuesday|wednesday|thursday|friday|saturday|sunday))\b/gi;

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
const MAX_LISTED_WORDS = 5;

const escapeRegExp = (text: string): string =>
  text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const findAll = (text: string, pattern: RegExp): string[] =>
  text.match(pattern) ?? [];

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

export const checkDraft = ({
  title,
  description,
  body,
  sourceName,
  sourceText,
}: CheckInput): string[] => {
  const warnings: string[] = [];
  // Direct quotes keep the source's own words, so they are not checked
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
