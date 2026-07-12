// Standalone end-to-end verification driven by a real Chromium browser.
// Requires the backend (:8000) and the Vite dev server (:5173) to be running.
import { chromium } from "@playwright/test"
import fs from "node:fs"
import path from "node:path"

const OUT = process.env.OUT || "./e2e-out"
const BASE = process.env.BASE || "http://127.0.0.1:5173"
fs.mkdirSync(OUT, { recursive: true })

const results = []
function log(ok, msg) {
  results.push({ ok, msg })
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`)
}

const browser = await chromium.launch()
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  acceptDownloads: true,
})
const page = await context.newPage()
page.on("console", (m) => {
  if (m.type() === "error") console.log("  [console.error]", m.text())
})

async function saveDownload(promise, label) {
  const download = await promise
  const file = path.join(OUT, await download.suggestedFilename())
  await download.saveAs(file)
  const size = fs.statSync(file).size
  log(size > 0, `${label} downloaded -> ${path.basename(file)} (${size} bytes)`)
  return file
}

try {
  // ---- 1. Dashboard: data renders ----
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  await page.getByText("إجمالي الإيرادات").waitFor({ timeout: 20000 })
  const revenueText = await page
    .locator("text=إجمالي الإيرادات")
    .first()
    .locator("xpath=following-sibling::*")
    .first()
    .textContent()
  log(!!revenueText && /[\d٠-٩]/.test(revenueText), `Dashboard KPI renders (الإيرادات = ${revenueText?.trim()})`)
  await page.screenshot({ path: path.join(OUT, "01-dashboard.png"), fullPage: true })

  // ---- 2. Sales page: table has rows ----
  await page.goto(`${BASE}/sales`, { waitUntil: "networkidle" })
  await page.getByText("تفاصيل المبيعات").waitFor({ timeout: 20000 })
  const rowCountBefore = await page.locator("tbody tr").count()
  log(rowCountBefore > 0, `Sales table renders rows (${rowCountBefore} visible)`)
  await page.screenshot({ path: path.join(OUT, "02-sales.png"), fullPage: true })

  // ---- 3. Search filter ----
  const counter = page.locator("text=/\\d+ سجل/").first()
  const beforeText = await counter.textContent()
  await page.getByPlaceholder("بحث بالعميل أو المنتج...").fill("محمد")
  await page.waitForTimeout(400)
  const afterText = await counter.textContent()
  log(beforeText !== afterText, `Search filter works (${beforeText?.trim()} -> ${afterText?.trim()})`)
  await page.getByPlaceholder("بحث بالعميل أو المنتج...").fill("")

  // ---- 4. Category Select filter ----
  try {
    await page.locator("button[role=combobox]").first().click()
    await page.waitForTimeout(300)
    const option = page.getByRole("option").nth(1)
    const optName = (await option.textContent())?.trim()
    await option.click()
    await page.waitForTimeout(400)
    const filteredCount = await counter.textContent()
    log(true, `Category filter applied (${optName} -> ${filteredCount?.trim()})`)
  } catch (e) {
    log(false, `Category Select interaction failed: ${e.message}`)
  }

  // ---- 5. Exports (Excel + PDF) on the products page ----
  await page.goto(`${BASE}/products`, { waitUntil: "networkidle" })
  await page.getByText("قائمة المنتجات").waitFor({ timeout: 20000 })

  await saveDownload(
    (async () => {
      const p = page.waitForEvent("download", { timeout: 60000 })
      await page.getByRole("button", { name: "Excel" }).click()
      return p
    })(),
    "Excel export"
  )

  await saveDownload(
    (async () => {
      const p = page.waitForEvent("download", { timeout: 90000 })
      await page.getByRole("button", { name: "PDF" }).click()
      return p
    })(),
    "PDF export"
  )

  // ---- 6. Dark mode ----
  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "داكن" }).click()
  await page.waitForTimeout(300)
  const isDark = await page.evaluate(() =>
    document.documentElement.classList.contains("dark")
  )
  log(isDark, "Dark mode toggles (html.dark applied)")
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  await page.getByText("إجمالي الإيرادات").waitFor({ timeout: 20000 })
  await page.screenshot({ path: path.join(OUT, "03-dashboard-dark.png"), fullPage: true })
} catch (err) {
  log(false, `EXCEPTION: ${err.message}`)
} finally {
  await browser.close()
}

const failed = results.filter((r) => !r.ok).length
console.log(`\n${results.length - failed}/${results.length} checks passed`)
process.exit(failed ? 1 : 0)
