export const money = (value: number, currency = "$"): string =>
  `${currency}${value.toFixed(2)}`;

export const formatDateTime = (date: Date): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);

export const formatMonthYear = (date: Date): string =>
  date.toLocaleString("en-US", { month: "long", year: "numeric" });

export const padOrder = (n: number): string => String(n).padStart(4, "0");
