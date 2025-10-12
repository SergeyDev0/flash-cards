const locale = 'ru-RU';

const dateTimeFormatter = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

const dateFormatter = new Intl.DateTimeFormat(locale, {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const relativeFormatter = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' });

export const isOverdue = (isoDate: string) => {
  const target = new Date(isoDate).getTime();
  if (Number.isNaN(target)) return false;
  return target <= Date.now();
};

export const formatDateTime = (isoDate: string) => {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return '-';
  return dateTimeFormatter.format(value);
};

export const formatDateFull = (isoDate: string) => {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return '-';
  return dateFormatter.format(value);
};

export const formatRelative = (isoDate: string) => {
  const value = new Date(isoDate);
  const diff = value.getTime() - Date.now();
  const absMs = Math.abs(diff);
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (absMs < hour) {
    return relativeFormatter.format(
      Math.round(diff / minute),
      'minute',
    );
  }
  if (absMs < day) {
    return relativeFormatter.format(
      Math.round(diff / hour),
      'hour',
    );
  }
  const week = 7 * day;
  if (absMs < week) {
    return relativeFormatter.format(
      Math.round(diff / day),
      'day',
    );
  }
  return relativeFormatter.format(
    Math.round(diff / week),
    'week',
  );
};

