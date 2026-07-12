"""Render the first page of a PDF to a PNG for visual inspection."""
import sys

import fitz  # PyMuPDF

pdf_path, png_path = sys.argv[1], sys.argv[2]
doc = fitz.open(pdf_path)
page = doc[0]
# Scale down large image PDFs to a viewable width.
zoom = min(1.0, 1400 / page.rect.width)
pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom))
pix.save(png_path)
print(f"pages={doc.page_count} size={page.rect.width:.0f}x{page.rect.height:.0f} -> {png_path}")
