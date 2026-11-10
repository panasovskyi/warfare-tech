// Дозволені джерела: точний домен без www. → назва видання (вона йде в текст статті й у поле source).
// Нове джерело додається одним рядком тут.
export const ALLOWED_SOURCES: Record<string, string> = {
  "defensenews.com": "Defense News",
  "defence-ua.com": "Defense Express",
  "war.gov": "US Department of War",
  "airandspaceforces.com": "Air & Space Forces Magazine",
  "rheinmetall.com": "Rheinmetall",
  "twz.com": "The War Zone",
  "breakingdefense.com": "Breaking Defense",
  "airbus.com": "Airbus",
  "rtx.com": "Raytheon",
  "news.northropgrumman.com": "Northrop Grumman",
  "news.lockheedmartin.com": "Lockheed Martin",
  "thalesgroup.com": "Thales",
  "boeing.mediaroom.com": "Boeing",
  "militarnyi.com": "Militarnyi",
  "state.gov": "US Department of State",
};

// Повертає назву видання за адресою. Невідомий домен — помилка: інші сайти ми не обробляємо
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