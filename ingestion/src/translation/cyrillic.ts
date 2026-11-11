const CYRILLIC = /\p{Script=Cyrillic}/u;

// Чи є в тексті хоч одна кирилична літера (за нею ловимо недоперекладений текст)
export const hasCyrillic = (text: string): boolean => CYRILLIC.test(text);

// Джерело вважаємо українським, коли більшість його літер кириличні
export const isMostlyCyrillic = (text: string): boolean => {
  const letters = text.match(/\p{L}/gu) ?? [];

  if (letters.length === 0) {
    return false;
  }

  const cyrillic = letters.filter((letter) => CYRILLIC.test(letter)).length;

  return cyrillic / letters.length > 0.5;
};
