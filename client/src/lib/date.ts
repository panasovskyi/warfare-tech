// Часовий пояс редакції: від нього залежать "yesterday" і дата. Задаємо явно,
// бо інакше Intl бере пояс сервера, і локально й на проді дата могла б
// різнитися на день
const TIME_ZONE = 'Europe/Dublin';

const DAY_MS = 24 * 60 * 60 * 1000;

// Формати створюються один раз, а не на кожен виклик
const dateFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  month: 'short',
  day: 'numeric',
});

const dateWithYearFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const calendarPartsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

// Календарна дата в TIME_ZONE: рік і номер дня. Номер — та сама дата як
// північ UTC, поділена на добу: різниця двох номерів — точна кількість
// календарних днів, без сюрпризів переходу на літній час
function getCalendarDate(date: Date): { year: number; day: number } {
  const parts = calendarPartsFormat.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);

  const year = getPart('year');

  return {
    year,
    day: Date.UTC(year, getPart('month') - 1, getPart('day')) / DAY_MS,
  };
}

// "now", "5 mins ago", "3 hours ago", "yesterday", "Sep 27", "Sep 27, 2025".
// Невалідна дата — порожній рядок: інакше Intl кидає RangeError, і падає
// рендер усієї сторінки
export function formatRelativeTime(isoString: string): string {
  const publishedDate = new Date(isoString);

  if (Number.isNaN(publishedDate.getTime())) {
    return '';
  }

  const nowDate = new Date();
  const diffInSeconds = Math.floor(
    (nowDate.getTime() - publishedDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return 'now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? 'min' : 'mins'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Далі — за календарем у TIME_ZONE, а не за годинами: стаття з неділі 23:00
  // у вівторок уранці — це вже дата, а не "yesterday"
  const published = getCalendarDate(publishedDate);
  const today = getCalendarDate(nowDate);

  if (today.day - published.day === 1) {
    return 'yesterday';
  }

  return published.year === today.year
    ? dateFormat.format(publishedDate)
    : dateWithYearFormat.format(publishedDate);
}
