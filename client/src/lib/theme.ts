export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

// Скрипт, який виконується в <head> ще до першого малювання сторінки й ставить data-theme на
// <html>. Без нього сторінка спершу з'являлась би світлою, а тема змінювалась би вже після
// завантаження JS (мерехтіння). Тема береться зі збереженого вибору, а якщо його нема — з
// системних налаштувань. localStorage у try: у приватному режимі й за вимкнених даних сайту
// звернення до нього кидає помилку, і тоді діє системна тема. Скрипт — рядок, а не функція,
// бо вставляється в розмітку як є; ключ у ньому збігається з THEME_STORAGE_KEY
export const THEME_INIT_SCRIPT = `(function () {
  var theme;
  try {
    theme = localStorage.getItem('${THEME_STORAGE_KEY}');
  } catch (e) {}
  if (theme !== 'light' && theme !== 'dark') {
    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.dataset.theme = theme;
})();`;
