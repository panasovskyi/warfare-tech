export const ALLOWED_SOURCES: Record<string, string> = {
  "defensenews.com": "Defense News",
  "defence-ua.com": "Defense Express",
  "war.gov": "US Department of War",
  "airandspaceforces.com": "Air & Space Forces Magazine",
  "rheinmetall.com": "Rheinmetall",
};

export const resolveSource = (url: string) => {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  const source = ALLOWED_SOURCES[hostname];

  if (!source) {
    throw new Error(
      `Unknown source domain: ${hostname}. Add it to ALLOWED_SOURCES in src/rewriting/sources.ts first.`,
    );
  }

  return source;
}