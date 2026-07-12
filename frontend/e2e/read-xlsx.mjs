import XLSX from "xlsx"
import fs from "node:fs"

const file = process.argv[2]
const wb = XLSX.readFile(file)
const ws = wb.Sheets[wb.SheetNames[0]]
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 })
const out = {
  sheet: wb.SheetNames[0],
  rtl: ws["!views"]?.[0]?.RTL ?? null,
  headers: rows[0],
  sampleRows: rows.slice(1, 4),
  totalRows: rows.length - 1,
}
fs.writeFileSync(process.argv[3], JSON.stringify(out, null, 2), "utf8")
console.log("written")
