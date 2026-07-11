import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  ShoppingCart,
  PackageSearch,
  Users,
  Package,
  Settings,
  FileBarChart,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/", label: "لوحة التحكم", icon: LayoutDashboard, end: true },
  { to: "/sales", label: "تقرير المبيعات", icon: ShoppingCart },
  { to: "/purchases", label: "تقرير المشتريات", icon: PackageSearch },
  { to: "/customers", label: "تقرير العملاء", icon: Users },
  { to: "/products", label: "تقرير المنتجات", icon: Package },
  { to: "/settings", label: "الإعدادات", icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <aside className="flex h-full w-64 flex-col border-l bg-card">
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <FileBarChart className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">مولّد التقارير</p>
          <p className="text-xs text-muted-foreground">لوحة الأعمال</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <item.icon className="h-[1.15rem] w-[1.15rem]" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-4 text-center text-xs text-muted-foreground">
        الإصدار 0.1.0
      </div>
    </aside>
  )
}
