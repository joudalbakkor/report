import { Monitor, Moon, Sun } from "lucide-react"

import { AppLayout } from "@/components/layout/app-layout"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useTheme } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const THEMES = [
  { value: "light", label: "فاتح", icon: Sun },
  { value: "dark", label: "داكن", icon: Moon },
  { value: "system", label: "النظام", icon: Monitor },
] as const

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <AppLayout title="الإعدادات" subtitle="تخصيص التطبيق">
      <div className="max-w-2xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>المظهر</CardTitle>
            <CardDescription>اختر سمة العرض المفضّلة لديك.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-sm font-medium transition-colors",
                    theme === t.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-accent"
                  )}
                >
                  <t.icon className="h-6 w-6" />
                  {t.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عن التطبيق</CardTitle>
            <CardDescription>مولّد التقارير الاحترافي.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <InfoRow label="الإصدار" value="0.1.0" />
            <InfoRow label="الواجهة الأمامية" value="React + TypeScript + Vite" />
            <InfoRow label="مكتبة الواجهة" value="shadcn/ui + TailwindCSS" />
            <InfoRow label="الخادم" value="FastAPI + SQLAlchemy" />
            <div className="pt-3">
              <Button
                variant="outline"
                asChild
              >
                <a
                  href="/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  توثيق واجهة الـ API
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b py-2 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
