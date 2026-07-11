import { useState } from "react"
import { FileDown, FileSpreadsheet, Loader2 } from "lucide-react"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import * as XLSX from "xlsx"

import { Button } from "@/components/ui/button"

interface ExportButtonsProps {
  /** Rows for the Excel export (Arabic column names as keys). */
  rows: Record<string, string | number>[]
  /** File name without extension. */
  fileName: string
  /** DOM id of the element to capture for the PDF export. */
  pdfTargetId: string
}

export function ExportButtons({
  rows,
  fileName,
  pdfTargetId,
}: ExportButtonsProps) {
  const [pdfLoading, setPdfLoading] = useState(false)

  function exportExcel() {
    const worksheet = XLSX.utils.json_to_sheet(rows)
    worksheet["!views"] = [{ RTL: true }]
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "التقرير")
    XLSX.writeFile(workbook, `${fileName}.xlsx`)
  }

  /**
   * Render the target DOM node to a canvas (the browser performs Arabic
   * shaping/RTL correctly), then place the image into a paginated A4 PDF.
   * This is the reliable way to get correct Arabic text in a PDF.
   */
  async function exportPdf() {
    const el = document.getElementById(pdfTargetId)
    if (!el) return
    setPdfLoading(true)
    try {
      const bg =
        getComputedStyle(document.body).backgroundColor || "#ffffff"
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: bg,
        useCORS: true,
      })
      const imgData = canvas.toDataURL("image/png")

      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" })
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      // Add extra pages for tall content.
      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      pdf.save(`${fileName}.pdf`)
    } finally {
      setPdfLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={exportExcel}>
        <FileSpreadsheet className="h-4 w-4" />
        Excel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportPdf}
        disabled={pdfLoading}
      >
        {pdfLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        PDF
      </Button>
    </div>
  )
}
