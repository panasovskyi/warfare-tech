const CYRILLIC = /\p{Script=Cyrillic}/u;

export const hasCyrillic = (text: string): boolean => CYRILLIC.test(text);

// A source counts as Ukrainian when most of its letters are Cyrillic
export const isMostlyCyrillic = (text: string): boolean => {
  const letters = text.match(/\p{L}/gu) ?? [];

  if (letters.length === 0) {
    return false;
  }

  const cyrillic = letters.filter((letter) => CYRILLIC.test(letter)).length;

  return cyrillic / letters.length > 0.5;
};
