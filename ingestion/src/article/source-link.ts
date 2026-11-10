// Параметри, що лише кажуть, звідки прийшов клік: без них стаття та сама
const TRACKING_PARAMETER =
  /^(utm_.*|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|oref|ncid|cmpid)$/i;

// Адреса, яка зберігається в чернетці й показується під статтею: без фрагмента й без трекінгу
export const normalizeSourceLink = (value: string): string => {
  const url = new URL(value.trim());

  url.hash = '';

  for (const key of [...url.searchParams.keys()]) {
    if (TRACKING_PARAMETER.test(key)) {
      url.searchParams.delete(key);
    }
  }

  return url.href;
};

// Що спільного в двох адрес однієї статті: www., кінцевий слеш і порядок решти параметрів
// не роблять її іншою статтею
export const sourceLinkKey = (value: string): string => {
  const url = new URL(normalizeSourceLink(value));
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const query = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, parameter]) => `${key}=${parameter}`)
    .join('&');

  return `${url.hostname.replace(/^www\./, '')}${path}${query ? `?${query}` : ''}`;
};
