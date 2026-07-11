import { Navigate, Route, Routes } from "react-router-dom"

import { DashboardPage } from "@/pages/dashboard"
import { SalesPage } from "@/pages/sales"
import { PurchasesPage } from "@/pages/purchases"
import { CustomersPage } from "@/pages/customers"
import { ProductsPage } from "@/pages/products"
import { SettingsPage } from "@/pages/settings"

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/sales" element={<SalesPage />} />
      <Route path="/purchases" element={<PurchasesPage />} />
      <Route path="/customers" element={<CustomersPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
