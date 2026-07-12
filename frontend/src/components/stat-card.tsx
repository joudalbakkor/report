import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend?: number
  hint?: string
  accent?: string
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  hint,
  accent = "hsl(var(--primary))",
}: StatCardProps) {
  const positive = (trend ?? 0) >= 0
  // Legacy hsla() (not color-mix) so html2canvas can parse it during PDF export.
  const tint = accent.replace(/^hsl\(/, "hsla(").replace(/\)$/, ", 0.15)")
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{ backgroundColor: tint }}
          >
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </div>
        </div>
        {(trend !== undefined || hint) && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-medium",
                  positive
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-destructive/15 text-destructive"
                )}
              >
                {positive ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {hint && <span className="text-muted-foreground">{hint}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
