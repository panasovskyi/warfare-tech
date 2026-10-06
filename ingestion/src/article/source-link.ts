// Parameters that only say where a click came from: the article is the same without them
const TRACKING_PARAMETER =
  /^(utm_.*|fbclid|gclid|dclid|msclkid|mc_cid|mc_eid|igshid|oref|ncid|cmpid)$/i;

// The address that is stored in the draft and shown under the article: no fragment, no tracking
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

// What two addresses of the same article have in common: www., a closing slash and the order
// of the remaining parameters do not make a different article
export const sourceLinkKey = (value: string): string => {
  const url = new URL(normalizeSourceLink(value));
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const query = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, parameter]) => `${key}=${parameter}`)
    .join('&');

  return `${url.hostname.replace(/^www\./, '')}${path}${query ? `?${query}` : ''}`;
};
