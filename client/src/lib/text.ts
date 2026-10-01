// Ініціали для аватара. Два слова й більше — перші літери першого й останнього
// ("Editorial Team" → "ET", "John Ronald Tolkien" → "JT"), одне слово — дві
// перші літери ("Reuters" → "RE"). Зайві пробіли не заважають: trim і розбиття
// за будь-якою кількістю пробілів, тож порожніх "слів" не буде
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0];
  const last = words.length > 1 ? words[words.length - 1] : undefined;

  if (!first) {
    return '';
  }

  const initials = last ? first.charAt(0) + last.charAt(0) : first.slice(0, 2);

  return initials.toUpperCase();
}

