import { monthKey, monthLabel } from "@/lib/format"

export interface Series {
  label: string
  value: number
}

export function sumBy<T>(items: T[], key: keyof T): number {
  return items.reduce((acc, item) => acc + (Number(item[key]) || 0), 0)
}

/** Aggregate a numeric field into a monthly time series (chronological). */
export function monthlySeries<T>(
  items: T[],
  dateKey: keyof T,
  valueKey: keyof T
): Series[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const key = monthKey(String(item[dateKey]))
    map.set(key, (map.get(key) ?? 0) + (Number(item[valueKey]) || 0))
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, value]) => ({ label: monthLabel(key), value }))
}

/** Group by a categorical field and sum a numeric field, sorted desc. */
export function groupSum<T>(
  items: T[],
  groupKey: keyof T,
  valueKey: keyof T
): Series[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const key = String(item[groupKey])
    map.set(key, (map.get(key) ?? 0) + (Number(item[valueKey]) || 0))
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

/** Count occurrences grouped by a categorical field, sorted desc. */
export function groupCount<T>(items: T[], groupKey: keyof T): Series[] {
  const map = new Map<string, number>()
  for (const item of items) {
    const key = String(item[groupKey])
    map.set(key, (map.get(key) ?? 0) + 1)
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
}

export function topN(series: Series[], n: number): Series[] {
  return series.slice(0, n)
}
