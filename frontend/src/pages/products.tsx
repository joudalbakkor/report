import { useMemo, useState } from "react"
import { Boxes, Layers, Package, TrendingUp } from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { StatCard } from "@/components/stat-card"
import { LoadingState, ErrorState } from "@/components/states"
import { DataTable, type Column } from "@/components/data-table"
import { ExportButtons } from "@/components/export-buttons"
import { Badge } from "@/components/ui/badge"
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
import { groupSum, sumBy, topN } from "@/lib/analytics"
import { formatCurrency, formatNumber } from "@/lib/format"

interface ProductRow extends Record<string, unknown> {
  id: number
  name: string
  sku: string
  category: string
  unit_price: number
  stock_quantity: number
  units_sold: number
  revenue: number
}

export function ProductsPage() {
  const { data, loading, error } = useAsync(async () => {
    const [products, sales] = await Promise.all([
      api.products(),
      api.sales(),
    ])
    const sold = new Map<number, number>()
    const revenue = new Map<number, number>()
    for (const s of sales) {
      sold.set(s.product_id, (sold.get(s.product_id) ?? 0) + s.quantity)
      revenue.set(
        s.product_id,
        (revenue.get(s.product_id) ?? 0) + s.total_amount
      )
    }
    const rows: ProductRow[] = products.map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      unit_price: p.unit_price,
      stock_quantity: p.stock_quantity,
      units_sold: sold.get(p.id) ?? 0,
      revenue: revenue.get(p.id) ?? 0,
    }))
    const categories = [...new Set(rows.map((r) => r.category))].sort()
    return { rows, categories }
  })

  return (
    <AppLayout title="تقرير المنتجات" subtitle="أداء المنتجات والمخزون">
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && (
        <ProductsContent rows={data.rows} categories={data.categories} />
      )}
    </AppLayout>
  )
}

function ProductsContent({
  rows,
  categories,
}: {
  rows: ProductRow[]
  categories: string[]
}) {
  const [category, setCategory] = useState("all")

  const filtered = useMemo(
    () =>
      category === "all" ? rows : rows.filter((r) => r.category === category),
    [rows, category]
  )

  const totalStock = sumBy(filtered, "stock_quantity")
  const totalUnitsSold = sumBy(filtered, "units_sold")
  const revenue = sumBy(filtered, "revenue")

  const revenueByCategory = groupSum(filtered, "category", "revenue")
  const topProducts = topN(
    [...filtered]
      .sort((a, b) => b.revenue - a.revenue)
      .map((r) => ({ label: r.name, value: r.revenue })),
    8
  )

  const columns: Column<ProductRow>[] = [
    { key: "name", header: "المنتج" },
    { key: "sku", header: "الرمز" },
    { key: "category", header: "الفئة" },
    {
      key: "unit_price",
      header: "السعر",
      render: (r) => formatCurrency(r.unit_price),
    },
    {
      key: "stock_quantity",
      header: "المخزون",
      render: (r) =>
        r.stock_quantity <= 50 ? (
          <Badge variant="destructive">{formatNumber(r.stock_quantity)}</Badge>
        ) : (
          <Badge variant="success">{formatNumber(r.stock_quantity)}</Badge>
        ),
    },
    {
      key: "units_sold",
      header: "المبيع",
      render: (r) => formatNumber(r.units_sold),
    },
    {
      key: "revenue",
      header: "الإيراد",
      render: (r) => (
        <span className="font-medium">{formatCurrency(r.revenue)}</span>
      ),
    },
  ]

  const exportRows = filtered.map((r) => ({
    المنتج: r.name,
    الرمز: r.sku,
    الفئة: r.category,
    السعر: r.unit_price,
    المخزون: r.stock_quantity,
    "الكمية المباعة": r.units_sold,
    الإيراد: r.revenue,
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
          fileName="تقرير-المنتجات"
          pdfTargetId="report-root"
        />
      </div>

      <div id="report-root" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="عدد المنتجات"
            value={formatNumber(filtered.length)}
            icon={Package}
            accent={CHART_COLORS[0]}
          />
          <StatCard
            title="عدد الفئات"
            value={formatNumber(new Set(filtered.map((r) => r.category)).size)}
            icon={Layers}
            accent={CHART_COLORS[3]}
          />
          <StatCard
            title="إجمالي المخزون"
            value={formatNumber(totalStock)}
            icon={Boxes}
            accent={CHART_COLORS[1]}
          />
          <StatCard
            title="الوحدات المباعة"
            value={formatNumber(totalUnitsSold)}
            icon={TrendingUp}
            hint={formatCurrency(revenue)}
            accent={CHART_COLORS[2]}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>الأعلى إيراداً</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBarChart data={topProducts} color={CHART_COLORS[1]} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>الإيراد حسب الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <DonutChart data={revenueByCategory} />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>قائمة المنتجات</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              rows={filtered}
              searchKeys={["name", "sku", "category"]}
              searchPlaceholder="بحث بالاسم أو الرمز..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
