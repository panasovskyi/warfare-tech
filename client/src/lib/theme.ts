export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

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
