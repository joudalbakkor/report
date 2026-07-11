import { useMemo, useState } from "react"
import { Coins, Crown, UserCheck, Users } from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { StatCard } from "@/components/stat-card"
import { LoadingState, ErrorState } from "@/components/states"
import { DataTable, type Column } from "@/components/data-table"
import { ExportButtons } from "@/components/export-buttons"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CategoryBarChart, CHART_COLORS, DonutChart } from "@/components/charts"
import { useAsync } from "@/hooks/use-async"
import { api } from "@/lib/api"
import { groupCount, sumBy, topN } from "@/lib/analytics"
import { formatCurrency, formatNumber } from "@/lib/format"

interface CustomerRow extends Record<string, unknown> {
  id: number
  name: string
  city: string
  phone: string
  orders: number
  spend: number
}

export function CustomersPage() {
  const { data, loading, error } = useAsync(async () => {
    const [customers, sales] = await Promise.all([
      api.customers(),
      api.sales(),
    ])
    const spend = new Map<number, number>()
    const orders = new Map<number, number>()
    for (const s of sales) {
      spend.set(s.customer_id, (spend.get(s.customer_id) ?? 0) + s.total_amount)
      orders.set(s.customer_id, (orders.get(s.customer_id) ?? 0) + 1)
    }
    const rows: CustomerRow[] = customers.map((c) => ({
      id: c.id,
      name: c.name,
      city: c.city ?? "-",
      phone: c.phone ?? "-",
      orders: orders.get(c.id) ?? 0,
      spend: spend.get(c.id) ?? 0,
    }))
    const cities = [...new Set(rows.map((r) => r.city))].sort()
    return { rows, cities }
  })

  return (
    <AppLayout title="تقرير العملاء" subtitle="تحليل قاعدة العملاء وإنفاقهم">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && <CustomersContent rows={data.rows} cities={data.cities} />}
    </AppLayout>
  )
}

function CustomersContent({
  rows,
  cities,
}: {
  rows: CustomerRow[]
  cities: string[]
}) {
  const [city, setCity] = useState("all")

  const filtered = useMemo(
    () => (city === "all" ? rows : rows.filter((r) => r.city === city)),
    [rows, city]
  )

  const revenue = sumBy(filtered, "spend")
  const active = filtered.filter((r) => r.orders > 0).length
  const avg = filtered.length ? revenue / filtered.length : 0

  const byCity = groupCount(filtered, "city")
  const topCustomers = topN(
    [...filtered]
      .sort((a, b) => b.spend - a.spend)
      .map((r) => ({ label: r.name, value: r.spend })),
    8
  )

  const columns: Column<CustomerRow>[] = [
    { key: "name", header: "العميل" },
    { key: "city", header: "المدينة" },
    { key: "phone", header: "الهاتف" },
    {
      key: "orders",
      header: "الطلبات",
      render: (r) => formatNumber(r.orders),
    },
    {
      key: "spend",
      header: "إجمالي الإنفاق",
      render: (r) => (
        <span className="font-medium">{formatCurrency(r.spend)}</span>
      ),
    },
  ]

  const exportRows = filtered.map((r) => ({
    العميل: r.name,
    المدينة: r.city,
    الهاتف: r.phone,
    الطلبات: r.orders,
    "إجمالي الإنفاق": r.spend,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="كل المدن" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المدن</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButtons
          rows={exportRows}
          fileName="تقرير-العملاء"
          pdfTargetId="report-root"
        />
      </div>

      <div id="report-root" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="عدد العملاء"
            value={formatNumber(filtered.length)}
            icon={Users}
            accent={CHART_COLORS[0]}
          />
          <StatCard
            title="عملاء نشطون"
            value={formatNumber(active)}
            icon={UserCheck}
            accent={CHART_COLORS[1]}
          />
          <StatCard
            title="إجمالي الإنفاق"
            value={formatCurrency(revenue)}
            icon={Coins}
            accent={CHART_COLORS[3]}
          />
          <StatCard
            title="متوسط إنفاق العميل"
            value={formatCurrency(avg)}
            icon={Crown}
            accent={CHART_COLORS[4]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>أفضل العملاء إنفاقاً</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart data={topCustomers} color={CHART_COLORS[0]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>العملاء حسب المدينة</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={byCity} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              rows={filtered}
              searchKeys={["name", "city"]}
              searchPlaceholder="بحث بالاسم أو المدينة..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
