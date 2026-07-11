# 📊 تقرير المشروع — Report Generator

> يُحدَّث بعد كل جلسة. آخر تحديث: 2026-07-11

## نظرة عامة
مولّد تقارير احترافي. Stack: **FastAPI + React + Shadcn/ui + TailwindCSS**.
- Repo: https://github.com/joudalbakkor/report (public)
- فرع التطوير: `develop`

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

---

## ⏭️ التالي
- المرحلة 3: (بانتظار التعليمات).
