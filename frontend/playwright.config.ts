import { defineConfig, devices } from "@playwright/test"

// Use the project's virtualenv Python to run the backend during tests.
const python =
  process.platform === "win32"
    ? ".venv\\Scripts\\python.exe"
    : ".venv/bin/python"

// Set PW_NO_SERVER=1 to run against servers you started yourself
// (backend on :8000, frontend on :5173). Otherwise Playwright starts them.
const managedWebServers = [
  {
    command: `${python} -m uvicorn app.main:app --port 8000`,
    cwd: "../backend",
    url: "http://127.0.0.1:8000/health",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
  {
    command: "npm run dev -- --port 5173",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
]

export default defineConfig({
  testDir: "./e2e",
  testMatch: /.*\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  reporter: [["list"]],
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: process.env.PW_NO_SERVER ? undefined : managedWebServers,
})
