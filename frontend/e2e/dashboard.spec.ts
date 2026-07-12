import { test, expect } from "@playwright/test"

test("dashboard loads with KPIs and charts", async ({ page }) => {
  await page.goto("/")

  // KPI cards render.
  await expect(page.getByText("إجمالي الإيرادات")).toBeVisible({
    timeout: 20_000,
  })
  await expect(page.getByText("صافي الربح")).toBeVisible()
  await expect(page.getByText("إجمالي المشتريات")).toBeVisible()

  // At least one Recharts chart is drawn.
  await expect(page.locator("svg.recharts-surface").first()).toBeVisible()
})
