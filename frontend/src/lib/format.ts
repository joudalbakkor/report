/** Formatting helpers using the Arabic (Saudi) locale. */

const LOCALE = "ar-SA"

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(value || 0)
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(LOCALE).format(value || 0)
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat(LOCALE, {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0)
}

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  if (Number.isNaN(d.getTime())) return "-"
  return new Intl.DateTimeFormat(LOCALE, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d)
}

export function monthKey(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const AR_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
]

export function monthLabel(key: string): string {
  const [year, month] = key.split("-")
  return `${AR_MONTHS[Number(month) - 1]} ${year}`
}
