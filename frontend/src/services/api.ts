/**
 * Typed API client for the Report Generator backend.
 *
 * All calls go through the Vite dev proxy (`/api` -> FastAPI on :8000).
 */

const BASE_URL = "/api/v1"

export interface Customer {
  id: number
  name: string
  email: string | null
  phone: string | null
  city: string | null
  created_at: string
}

export interface Product {
  id: number
  name: string
  sku: string
  category: string
  unit_price: number
  cost_price: number
  stock_quantity: number
  created_at: string
}

export interface Sale {
  id: number
  customer_id: number
  product_id: number
  quantity: number
  unit_price: number
  total_amount: number
  sale_date: string
  created_at: string
}

export interface Purchase {
  id: number
  product_id: number
  supplier_name: string
  quantity: number
  unit_cost: number
  total_cost: number
  purchase_date: string
  created_at: string
}

export interface Expense {
  id: number
  category: string
  description: string | null
  amount: number
  expense_date: string
  created_at: string
}

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = "ApiError"
  }
}

async function getPage<T>(
  resource: string,
  skip: number,
  limit: number
): Promise<T[]> {
  let res: Response
  try {
    res = await fetch(`${BASE_URL}/${resource}/?skip=${skip}&limit=${limit}`)
  } catch {
    throw new ApiError(0, "تعذّر الوصول إلى الخادم")
  }
  if (!res.ok) {
    throw new ApiError(res.status, `فشل الاتصال بالخادم (${res.status})`)
  }
  return res.json()
}

/** Fetch every record for a resource, paging through the API. */
export async function fetchAll<T>(resource: string): Promise<T[]> {
  const limit = 1000
  let skip = 0
  const out: T[] = []
  for (let i = 0; i < 100; i++) {
    const page = await getPage<T>(resource, skip, limit)
    out.push(...page)
    if (page.length < limit) break
    skip += limit
  }
  return out
}

// --- Per-endpoint calls -----------------------------------------------------
export const getCustomers = () => fetchAll<Customer>("customers")
export const getProducts = () => fetchAll<Product>("products")
export const getSales = () => fetchAll<Sale>("sales")
export const getPurchases = () => fetchAll<Purchase>("purchases")
export const getExpenses = () => fetchAll<Expense>("expenses")

/** Convenience grouping used by the pages. */
export const api = {
  customers: getCustomers,
  products: getProducts,
  sales: getSales,
  purchases: getPurchases,
  expenses: getExpenses,
}
