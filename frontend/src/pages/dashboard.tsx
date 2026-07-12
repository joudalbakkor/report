import {
  Coins,
  CreditCard,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { StatCard } from "@/components/stat-card"
import { LoadingState, ErrorState } from "@/components/states"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  CategoryBarChart,
  CHART_COLORS,
  DonutChart,
  RevenueAreaChart,
} from "@/components/charts"
import { useAsync } from "@/hooks/use-async"
import { api, type Product } from "@/services/api"
import {
  groupSum,
  monthlySeries,
  sumBy,
  topN,
  type Series,
} from "@/lib/analytics"
import { formatCurrency, formatNumber } from "@/lib/format"

function lastTrend(series: Series[]): number | undefined {
  if (series.length < 2) return undefined
  const prev = series[series.length - 2].value
  const last = series[series.length - 1].value
  if (!prev) return undefined
  return ((last - prev) / prev) * 100
}

export function DashboardPage() {
  const { data, loading, error } = useAsync(async () => {
    const [sales, purchases, expenses, customers, products] =
      await Promise.all([
        api.sales(),
        api.purchases(),
        api.expenses(),
        api.customers(),
        api.products(),
      ])
    return { sales, purchases, expenses, customers, products }
  })

  return (
    <AppLayout
      title="لوحة التحكم"
      subtitle="نظرة عامة على أداء الأعمال"
    >
      {loading && <LoadingState />}
      {error && <ErrorState message={error} />}
      {data && (
        <DashboardContent
          sales={data.sales}
          purchases={data.purchases}
          expenses={data.expenses}
          customersCount={data.customers.length}
          products={data.products}
        />
      )}
    </AppLayout>
  )
}

interface ContentProps {
  sales: { total_amount: number; sale_date: string; product_id: number }[]
  purchases: { total_cost: number; purchase_date: string }[]
  expenses: { amount: number; category: string; expense_date: string }[]
  customersCount: number
  products: Product[]
}

function DashboardContent({
  sales,
  purchases,
  expenses,
  customersCount,
  products,
}: ContentProps) {
  const revenue = sumBy(sales, "total_amount")
  const purchaseCost = sumBy(purchases, "total_cost")
  const expenseTotal = sumBy(expenses, "amount")
  const netProfit = revenue - purchaseCost - expenseTotal

  const revenueSeries = monthlySeries(sales, "sale_date", "total_amount")

  // Sales by product category (join sales -> product.category).
  const categoryOf = new Map(products.map((p) => [p.id, p.category]))
  const salesWithCat = sales.map((s) => ({
    category: categoryOf.get(s.product_id) ?? "غير مصنّف",
    total_amount: s.total_amount,
  }))
  const byCategory = topN(
    groupSum(salesWithCat, "category", "total_amount"),
    6
  )

  const expensesByCat = groupSum(expenses, "category", "amount")

  return (
    <div id="report-root" className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="إجمالي الإيرادات"
          value={formatCurrency(revenue)}
          icon={Coins}
          trend={lastTrend(revenueSeries)}
          hint="مقارنة بالشهر السابق"
          accent={CHART_COLORS[0]}
        />
        <StatCard
          title="إجمالي المشتريات"
          value={formatCurrency(purchaseCost)}
          icon={ShoppingCart}
          accent={CHART_COLORS[2]}
        />
        <StatCard
          title="إجمالي المصروفات"
          value={formatCurrency(expenseTotal)}
          icon={CreditCard}
          accent={CHART_COLORS[4]}
        />
        <StatCard
          title="صافي الربح"
          value={formatCurrency(netProfit)}
          icon={TrendingUp}
          hint={`${formatNumber(customersCount)} عميل`}
          accent={CHART_COLORS[1]}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الإيرادات الشهرية</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueAreaChart data={revenueSeries} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>المبيعات حسب الفئة</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryBarChart data={byCategory} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>توزيع المصروفات</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart data={expensesByCat} />
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="h-4 w-4" />
        {formatNumber(customersCount)} عميل ·{" "}
        {formatNumber(products.length)} منتج · {formatNumber(sales.length)}{" "}
        عملية بيع
      </div>
    </div>
  )
}
