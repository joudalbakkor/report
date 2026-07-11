# CLAUDE.md - قواعد المشروع

## 🎯 المشروع
مولد تقارير احترافي (Report Generator)
- Repo: `report` (public) على GitHub
- Stack: FastAPI + React + Shadcn/ui + TailwindCSS

## 📌 قواعد إلزامية
1. **الرفع التدريجي**: كل feature = commit + push فوري
2. **Conventional Commits**: feat:, fix:, docs:, test:, refactor:
3. **اللغة**: العربية في الـ UI، الإنجليزية في الكود والتعليقات
4. **لا أسرار في الكود**: استخدم .env دائماً
5. **اختبر قبل الرفع**: تأكد من عمل الميزة قبل الـ commit

## 🌳 الـ Branches
- `main`: للإنتاج فقط
- `develop`: للتطوير
- `feature/*`: للميزات الجديدة

## 📊 معايير الجودة
- Unit Tests تغطي 80%+ من الـ Backend
- UI Tests بـ Playwright لكل تدفق رئيسي
- واجهة Responsive + Dark/Light Mode
- لا أخطاء في الـ console

## 🔄 بعد كل جلسة
- حدّث `PROJECT_REPORT.md`
- ارفع كل شيء على GitHub
- أخبرني بالنتيجة قبل إنهاء الجلسة
