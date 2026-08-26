export function formatINR(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

// Date-only fields (slot dates, batch start/end, hotel check-in/out) are
// stored as UTC midnight. Formatting them in the server's local timezone
// can roll them back a day west of UTC, so always render the UTC calendar
// date regardless of where the server runs.
export function formatDate(date: Date | string): string {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}
