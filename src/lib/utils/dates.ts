export function formatDate(value: string | Date, locale = "en-US"): string {
  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}
