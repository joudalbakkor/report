import { useMemo, useState } from "react"
import { Boxes, Hash, PackageSearch, Wallet } from "lucide-react"

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
import { api } from "@/lib/api"
import { monthlySeries, sumBy } from "@/lib/analytics"
import { formatCurrency, formatDate, formatNumber } from "@/lib/format"

interface PurchaseRow extends Record<string, unknown> {
  id: number
  date: string
  supplier: string
  product: string
  quantity: number
  unit_cost: number
  total_cost: number
}

export function PurchasesPage() {
  const { data, loading, error } = useAsync(async () => {
    const [purchases, products] = await Promise.all([
      api.purchases(),
      api.products(),
    ])
    const productName = new Map(products.map((p) => [p.id, p.name]))
    const rows: PurchaseRow[] = purchases.map((p) => ({
      id: p.id,
      date: p.purchase_date,
      supplier: p.supplier_name,
      product: productName.get(p.product_id) ?? "-",
      quantity: p.quantity,
      unit_cost: p.unit_cost,
      total_cost: p.total_cost,
    }))
    const suppliers = [...new Set(rows.map((r) => r.supplier))].sort()
    return { rows, suppliers }
  })

  return (
    <AppLayout
      title="تقرير المشتريات"
      subtitle="تحليل عمليات الشراء والموردين"
    >
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && (
        <PurchasesContent rows={data.rows} suppliers={data.suppliers} />
      )}
    </AppLayout>
  )
}

function PurchasesContent({
  rows,
  suppliers,
}: {
  rows: PurchaseRow[]
  suppliers: string[]
}) {
  const [supplier, setSupplier] = useState("all")

  const filtered = useMemo(
    () =>
      supplier === "all"
        ? rows
        : rows.filter((r) => r.supplier === supplier),
    [rows, supplier]
  )

  const cost = sumBy(filtered, "total_cost")
  const totalQty = sumBy(filtered, "quantity")
  const avg = filtered.length ? cost / filtered.length : 0
  const series = monthlySeries(filtered, "date", "total_cost")

  const columns: Column<PurchaseRow>[] = [
    { key: "date", header: "التاريخ", render: (r) => formatDate(r.date) },
    { key: "supplier", header: "المورّد" },
    { key: "product", header: "المنتج" },
    {
      key: "quantity",
      header: "الكمية",
      render: (r) => formatNumber(r.quantity),
    },
    {
      key: "total_cost",
      header: "التكلفة",
      render: (r) => (
        <span className="font-medium">{formatCurrency(r.total_cost)}</span>
      ),
    },
  ]

  const exportRows = filtered.map((r) => ({
    التاريخ: formatDate(r.date),
    المورّد: r.supplier,
    المنتج: r.product,
    الكمية: r.quantity,
    "تكلفة الوحدة": r.unit_cost,
    الإجمالي: r.total_cost,
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={supplier} onValueChange={setSupplier}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="كل الموردين" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الموردين</SelectItem>
            {suppliers.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ExportButtons
          rows={exportRows}
          fileName="تقرير-المشتريات"
          pdfTargetId="report-root"
        />
      </div>

      <div id="report-root" className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="إجمالي التكلفة"
            value={formatCurrency(cost)}
            icon={Wallet}
            accent={CHART_COLORS[2]}
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
            icon={PackageSearch}
            accent={CHART_COLORS[0]}
          />
          <StatCard
            title="إجمالي الكمية المشتراة"
            value={formatNumber(totalQty)}
            icon={Boxes}
            accent={CHART_COLORS[1]}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تكلفة المشتريات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <RevenueAreaChart data={series} color={CHART_COLORS[2]} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>تفاصيل المشتريات</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              rows={filtered}
              searchKeys={["supplier", "product"]}
              searchPlaceholder="بحث بالمورّد أو المنتج..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
