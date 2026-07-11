# 📊 تقرير المشروع — Report Generator

> يُحدَّث بعد كل جلسة. آخر تحديث: 2026-07-11 (المرحلة 3)

## نظرة عامة
مولّد تقارير احترافي. Stack: **FastAPI + React + Shadcn/ui + TailwindCSS**.
- Repo: https://github.com/joudalbakkor/report (public)
- فرع التطوير: `develop`
- تشغيل كامل: شغّل الـ backend (`uvicorn app.main:app` على 8000) ثم الـ frontend (`npm run dev`).

---

## ✅ المرحلة 1 — إنشاء الـ Repository
- إنشاء ريبو عام `report` على GitHub.
- الفروع: `main` (إنتاج) + `develop` (تطوير).
- ملفات: `CLAUDE.md`، `.gitignore` شامل.
- Initial commit مرفوع على `develop`.

## ✅ المرحلة 2 — Backend الأساسي
هيكلية FastAPI احترافية داخل `backend/`:

```
backend/
├── app/
│   ├── api/        # crud_router factory + routes aggregation
│   ├── core/       # config
│   ├── db/         # base + session
│   ├── models/     # Customer, Product, Sale, Purchase, Expense
│   ├── schemas/    # Pydantic (Create/Update/Read لكل كيان)
│   ├── services/   # CRUDService عام
│   └── main.py     # تطبيق FastAPI (CORS + /docs + /health)
├── tests/          # pytest (6 اختبارات)
├── requirements.txt
├── .env.example
└── seed_data.py
```

**قاعدة البيانات:** SQLite + SQLAlchemy 2.0 (نمط `Mapped`).

**Endpoints:** CRUD كامل تحت `/api/v1` لكل من:
`customers`, `products`, `sales`, `purchases`, `expenses`
(list / get / create / update / delete) + `/` و `/health`.

**Seed data (بيانات واقعية عربية):**
| الكيان | العدد |
|--------|------|
| customers | 150 |
| products | 32 |
| sales | 1200 |
| purchases | 600 |
| expenses | 300 |

**الاختبارات:** 6/6 ناجحة (meta + CRUD + العلاقات + تعارض SKU + فحص التحقق).

**تشغيل محلي:**
```bash
cd backend
python -m venv .venv && .venv\Scripts\activate    # Windows
pip install -r requirements.txt
python seed_data.py          # توليد البيانات
uvicorn app.main:app --reload
# التوثيق التفاعلي: http://127.0.0.1:8000/docs
```

### Commits (المرحلة 2)
- `feat: add FastAPI backend with database models, schemas and CRUD endpoints`
- `feat: add realistic seed data generator`
- `test: add backend API tests`

## ✅ المرحلة 3 — Frontend + الواجهات
واجهة احترافية بـ **React 19 + TypeScript + Vite + TailwindCSS + shadcn/ui** داخل `frontend/`:

```
frontend/src/
├── components/
│   ├── ui/          # مكوّنات shadcn (button, card, table, select, tabs, ...)
│   ├── layout/      # sidebar, header, app-layout (responsive + drawer للجوال)
│   ├── charts.tsx   # Recharts (area, bar, donut)
│   ├── data-table.tsx  # جدول ببحث + ترقيم صفحات
│   ├── export-buttons.tsx  # تصدير PDF/Excel
│   ├── stat-card.tsx / states.tsx / theme-*.tsx
├── pages/           # dashboard, sales, purchases, customers, products, settings
├── lib/             # api (client + types), format (عربي), analytics, utils
└── hooks/use-async.ts
```

**المميزات:**
- لوحة تحكم + 4 صفحات تقارير (مبيعات، مشتريات، عملاء، منتجات) + إعدادات.
- رسوم بيانية (Recharts): مساحية، أعمدة، دائرية (Donut).
- جداول مع **بحث + فلاتر** (Select) + ترقيم صفحات.
- **Dark/Light/System Mode** (محفوظ في localStorage).
- **Responsive** كامل + دعم **RTL** عربي (خط Cairo).
- تصدير **Excel** (SheetJS) و**PDF** — الأخير عبر `html2canvas + jsPDF`
  (يلتقط DOM الذي يشكّله المتصفح) لضمان **ظهور النص العربي بشكل صحيح** في الـ PDF.
- طبقة API مع Vite proxy إلى الـ Backend + حالات تحميل/خطأ.

**التحقق:**
- `npm run build` ينجح (tsc صارم + Vite، 2640 وحدة، بلا أخطاء).
- تشغيل مزدوج: Backend (8000) + Frontend dev (5173) — الواجهة تُخدَم و**بروكسي الـ API يُرجع بيانات البذور فعلياً**.

**تشغيل محلي:**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173  (يتطلب تشغيل الـ backend على 8000)
```

### Commits (المرحلة 3)
- `feat: scaffold frontend tooling (Vite + React-TS + Tailwind + shadcn/ui + theming)`
- `feat: add app layout, API client, charts, data table and PDF/Excel export`
- `feat: add dashboard and report pages with charts, filters and exports`

---

## ⏭️ التالي
- المرحلة 4: (بانتظار التعليمات).
