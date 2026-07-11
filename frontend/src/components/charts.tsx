import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { formatCompact, formatCurrency } from "@/lib/format"

export const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(160, 84%, 39%)",
  "hsl(27, 96%, 55%)",
  "hsl(271, 81%, 56%)",
  "hsl(340, 82%, 52%)",
  "hsl(199, 89%, 48%)",
  "hsl(47, 95%, 50%)",
]

const tooltipStyle = {
  background: "hsl(var(--popover))",
  border: "1px solid hsl(var(--border))",
  borderRadius: "0.5rem",
  color: "hsl(var(--popover-foreground))",
  fontSize: "0.8rem",
  direction: "rtl" as const,
}

const axisStyle = { fontSize: 12, fill: "hsl(var(--muted-foreground))" }

interface Point {
  label: string
  value: number
}

export function RevenueAreaChart({
  data,
  color = CHART_COLORS[0],
}: {
  data: Point[]
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.35} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [formatCurrency(Number(v)), "القيمة"]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill="url(#revFill)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function CategoryBarChart({
  data,
  color = CHART_COLORS[1],
}: {
  data: Point[]
  color?: string
}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="label" tick={axisStyle} tickLine={false} />
        <YAxis
          tick={axisStyle}
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v: number) => formatCompact(v)}
        />
        <Tooltip
          cursor={{ fill: "hsl(var(--accent))", opacity: 0.4 }}
          contentStyle={tooltipStyle}
          formatter={(v) => [formatCurrency(Number(v)), "القيمة"]}
        />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export function DonutChart({ data }: { data: Point[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [formatCurrency(Number(v)), "القيمة"]}
        />
        <Legend
          wrapperStyle={{ fontSize: "0.8rem", direction: "rtl" }}
          iconType="circle"
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
