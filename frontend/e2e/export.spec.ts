import { test, expect } from "@playwright/test"

test("export to Excel downloads an .xlsx file", async ({ page }) => {
  await page.goto("/products")
  await expect(page.getByText("قائمة المنتجات")).toBeVisible({
    timeout: 20_000,
  })

  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("button", { name: "Excel" }).click(),
  ])
  expect(await download.suggestedFilename()).toContain(".xlsx")
})

test("export to PDF downloads a .pdf file", async ({ page }) => {
  await page.goto("/products")
  await expect(page.getByText("قائمة المنتجات")).toBeVisible({
    timeout: 20_000,
  })

  const [download] = await Promise.all([
    page.waitForEvent("download", { timeout: 90_000 }),
    page.getByRole("button", { name: "PDF" }).click(),
  ])
  expect(await download.suggestedFilename()).toContain(".pdf")
})
