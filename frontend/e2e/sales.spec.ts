import { test, expect } from "@playwright/test"

test("sales report text search narrows the results", async ({ page }) => {
  await page.goto("/sales")
  await expect(page.getByText("تفاصيل المبيعات")).toBeVisible({
    timeout: 20_000,
  })

  const counter = page.locator("text=/\\d+ سجل/").first()
  const before = (await counter.textContent())?.trim()

  await page.getByPlaceholder("بحث بالعميل أو المنتج...").fill("محمد")

  // The record counter must change after filtering.
  await expect
    .poll(async () => (await counter.textContent())?.trim(), {
      timeout: 5_000,
    })
    .not.toBe(before)
})

test("sales report category filter updates the table", async ({ page }) => {
  await page.goto("/sales")
  await expect(page.getByText("تفاصيل المبيعات")).toBeVisible({
    timeout: 20_000,
  })

  const counter = page.locator("text=/\\d+ سجل/").first()
  const before = (await counter.textContent())?.trim()

  // Open the category Select and pick the first real category.
  await page.locator("button[role=combobox]").first().click()
  await page.getByRole("option").nth(1).click()

  await expect
    .poll(async () => (await counter.textContent())?.trim(), {
      timeout: 5_000,
    })
    .not.toBe(before)
  await expect(page.locator("tbody tr").first()).toBeVisible()
})
