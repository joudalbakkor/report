// Capture full-page screenshots of every report for the documentation.
// Requires backend (:8000) and the Vite dev server (:5173) running.
import { chromium } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

const OUT = process.env.OUT || "../docs/screenshots"
const BASE = process.env.BASE || "http://127.0.0.1:5173"
fs.mkdirSync(OUT, { recursive: true })

const PAGES = [
  { url: "/", wait: "إجمالي الإيرادات", file: "01-dashboard.png" },
  { url: "/sales", wait: "تفاصيل المبيعات", file: "02-sales.png" },
  { url: "/purchases", wait: "تفاصيل المشتريات", file: "03-purchases.png" },
  { url: "/customers", wait: "قائمة العملاء", file: "04-customers.png" },
  { url: "/products", wait: "قائمة المنتجات", file: "05-products.png" },
  { url: "/settings", wait: "المظهر", file: "06-settings.png" },
]

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
})
const page = await context.newPage()

for (const p of PAGES) {
  await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle" })
  await page.getByText(p.wait).first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(800) // let charts finish animating
  await page.screenshot({ path: path.join(OUT, p.file), fullPage: true })
  console.log("captured", p.file)
}

// Dark-mode dashboard.
await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" })
await page.getByRole("button", { name: "داكن" }).click()
await page.waitForTimeout(300)
await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
await page.getByText("إجمالي الإيرادات").first().waitFor({ timeout: 20000 })
await page.waitForTimeout(800)
await page.screenshot({ path: path.join(OUT, "07-dashboard-dark.png"), fullPage: true })
console.log("captured 07-dashboard-dark.png")

await browser.close()
console.log("done")
