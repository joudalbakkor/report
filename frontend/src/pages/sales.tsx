import { useMemo, useState } from "react"
import { Coins, Hash, Receipt, TrendingUp } from "lucide-react"

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
import { RevenueAreaChart, CHART_COLORS } from "@/components/charts"
import { useAsync } from "@/hooks/use-async"
import { api } from "@/services/api"
import { monthlySeries, sumBy } from "@/lib/analytics"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"

interface SaleRow extends Record<string, unknown> {
  id: number
  date: string
  customer: string
  product: string
  category: string
  quantity: number
  unit_price: number
  total_amount: number
}

export function SalesPage() {
  const { data, loading, error } = useAsync(async () => {
    const [sales, customers, products] = await Promise.all([
      api.sales(),
      api.customers(),
      api.products(),
    ])
    const customerName = new Map(customers.map((c) => [c.id, c.name]))
    const product = new Map(products.map((p) => [p.id, p]))
    const rows: SaleRow[] = sales.map((s) => ({
      id: s.id,
      date: s.sale_date,
      customer: customerName.get(s.customer_id) ?? "-",
      product: product.get(s.product_id)?.name ?? "-",
      category: product.get(s.product_id)?.category ?? "غير مصنّف",
      quantity: s.quantity,
      unit_price: s.unit_price,
      total_amount: s.total_amount,
    }))
    const categories = [...new Set(rows.map((r) => r.category))].sort()
    return { rows, categories }
  })

  return (
    <AppLayout title="تقرير المبيعات" subtitle="تحليل عمليات البيع والإيرادات">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && <SalesContent rows={data.rows} categories={data.categories} />}
    </AppLayout>
  )
}

function SalesContent({
  rows,
  categories,
}: {
  rows: SaleRow[]
  categories: string[]
}) {
  const [category, setCategory] = useState("all")

  const filtered = useMemo(
    () =>
      category === "all" ? rows : rows.filter((r) => r.category === category),
    [rows, category]
  )

  const revenue = sumBy(filtered, "total_amount")
  const totalQty = sumBy(filtered, "quantity")
  const avg = filtered.length ? revenue / filtered.length : 0
  const series = monthlySeries(filtered, "date", "total_amount")

  const columns: Column<SaleRow>[] = [
    { key: "date", header: "التاريخ", render: (r) => formatDate(r.date) },
    { key: "customer", header: "العميل" },
    { key: "product", header: "المنتج" },
    { key: "category", header: "الفئة" },
    {
      key: "quantity",
      header: "الكمية",
      render: (r) => formatNumber(r.quantity),
    },
    {
      key: "total_amount",
      header: "الإجمالي",
      render: (r) => (
        <span className="font-medium">{formatCurrency(r.total_amount)}</span>
      ),
    },
  ]

  const exportRows = filtered.map((r) => ({
    التاريخ: formatDate(r.date),
    العميل: r.customer,
    المنتج: r.product,
    الفئة: r.category,
    الكمية: r.quantity,
    "سعر الوحدة": r.unit_price,
    الإجمالي: r.total_amount,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="كل الفئات" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الفئات</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButtons
          rows={exportRows}
          fileName="تقرير-المبيعات"
          pdfTargetId="report-root"
        />
      </div>

      <div id="report-root" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي الإيرادات"
            value={formatCurrency(revenue)}
            icon={Coins}
            accent={CHART_COLORS[0]}
          />
          <StatCard
            title="عدد العمليات"
            value={formatNumber(filtered.length)}
            icon={Hash}
            accent={CHART_COLORS[3]}
          />
          <StatCard
            title="متوسط قيمة العملية"
            value={formatCurrency(avg)}
            icon={TrendingUp}
            accent={CHART_COLORS[1]}
          />
          <StatCard
            title="إجمالي الكمية المباعة"
            value={formatNumber(totalQty)}
            icon={Receipt}
            accent={CHART_COLORS[2]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>الإيرادات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={series} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المبيعات</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              rows={filtered}
              searchKeys={["customer", "product"]}
              searchPlaceholder="بحث بالعميل أو المنتج..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
