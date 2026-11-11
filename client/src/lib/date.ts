const TIME_ZONE = 'Europe/Dublin';

const DAY_MS = 24 * 60 * 60 * 1000;

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

const monthYearFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  month: 'long',
  year: 'numeric',
});

const calendarPartsFormat = new Intl.DateTimeFormat('en-US', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
});

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

  const published = getCalendarDate(publishedDate);
  const today = getCalendarDate(nowDate);

  if (today.day - published.day === 1) {
    return 'yesterday';
  }

  return published.year === today.year
    ? dateFormat.format(publishedDate)
    : dateWithYearFormat.format(publishedDate);
}

export function formatMonthYear(isoString: string): string {
  const date = new Date(isoString);

  return Number.isNaN(date.getTime()) ? '' : monthYearFormat.format(date);
}
