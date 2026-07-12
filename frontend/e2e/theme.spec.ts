import { test, expect } from "@playwright/test"

test("dark mode toggle applies and removes the .dark class", async ({
  page,
}) => {
  await page.goto("/settings")

  await page.getByRole("button", { name: "داكن" }).click()
  await expect(page.locator("html")).toHaveClass(/dark/)

  await page.getByRole("button", { name: "فاتح" }).click()
  await expect(page.locator("html")).not.toHaveClass(/dark/)
})
