// Self-contained: starts backend + frontend, captures screenshots, stops them.
// All server lifecycle lives inside Node so the parent shell stays clean.
import { chromium } from "@playwright/test"
import { spawn, spawnSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

const ROOT = path.resolve("..")
const BACKEND = path.join(ROOT, "backend")
const FRONTEND = path.join(ROOT, "frontend")
const VENV_PY = path.join(BACKEND, ".venv", "Scripts", "python.exe")
const OUT = process.env.OUT || path.join(ROOT, "docs", "screenshots")
const BASE = "http://127.0.0.1:5173"
fs.mkdirSync(OUT, { recursive: true })

const children = []
function start(cmd, args, cwd) {
  const p = spawn(cmd, args, { cwd, detached: true, stdio: "ignore", windowsHide: true })
  children.push(p)
  return p
}
function killAll() {
  for (const c of children) {
    try {
      spawnSync("taskkill", ["/pid", String(c.pid), "/T", "/F"], { stdio: "ignore" })
    } catch {}
  }
}

async function waitReady(url, ms) {
  const end = Date.now() + ms
  while (Date.now() < end) {
    try {
      const r = await fetch(url)
      if (r.ok) return true
    } catch {}
    await new Promise((r) => setTimeout(r, 500))
  }
  throw new Error(`server not ready: ${url}`)
}

const PAGES = [
  { url: "/", wait: "إجمالي الإيرادات", file: "01-dashboard.png" },
  { url: "/sales", wait: "تفاصيل المبيعات", file: "02-sales.png" },
  { url: "/purchases", wait: "تفاصيل المشتريات", file: "03-purchases.png" },
  { url: "/customers", wait: "قائمة العملاء", file: "04-customers.png" },
  { url: "/products", wait: "قائمة المنتجات", file: "05-products.png" },
  { url: "/settings", wait: "المظهر", file: "06-settings.png" },
]

try {
  start(VENV_PY, ["-m", "uvicorn", "app.main:app", "--port", "8000"], BACKEND)
  start(process.execPath, ["node_modules/vite/bin/vite.js", "--port", "5173", "--host"], FRONTEND)

  await waitReady("http://127.0.0.1:8000/health", 40000)
  await waitReady(BASE, 40000)

  const browser = await chromium.launch()
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })

  for (const p of PAGES) {
    await page.goto(`${BASE}${p.url}`, { waitUntil: "networkidle" })
    await page.getByText(p.wait).first().waitFor({ timeout: 20000 })
    await page.waitForTimeout(800)
    await page.screenshot({ path: path.join(OUT, p.file), fullPage: true })
    console.log("captured", p.file)
  }

  await page.goto(`${BASE}/settings`, { waitUntil: "networkidle" })
  await page.getByRole("button", { name: "داكن" }).click()
  await page.waitForTimeout(300)
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" })
  await page.getByText("إجمالي الإيرادات").first().waitFor({ timeout: 20000 })
  await page.waitForTimeout(800)
  await page.screenshot({
    path: path.join(OUT, "07-dashboard-dark.png"),
    fullPage: true,
  })
  console.log("captured 07-dashboard-dark.png")

  await browser.close()
  console.log("DONE")
} catch (e) {
  console.log("ERROR:", e.message)
} finally {
  killAll()
}
