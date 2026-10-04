# انتشار آنلاین سامانه محاسبه کالری

این نسخه برای اجرای عمومی روی سرویس‌های Node.js/Next.js آماده شده است.

## 1) ساخت PostgreSQL آنلاین
یک دیتابیس PostgreSQL بسازید و Connection String آن را دریافت کنید. مقدار آن باید به شکل زیر باشد:

`postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`

## 2) تنظیم متغیر محیطی
در سرویس Deploy، یک Environment Variable با نام زیر بسازید:

`DATABASE_URL`

و Connection String دیتابیس را در مقدار آن قرار دهید.

## 3) ساخت جدول‌ها
بعد از نصب وابستگی‌ها، یک بار اجرا کنید:

`npm run db:push`

این دستور جدول `patients` را مطابق `src/db/schema.ts` ایجاد می‌کند.

## 4) Deploy
Build command:

`npm run build`

Start command:

`npm start`

Framework: Next.js

## 5) استفاده
بعد از Deploy، یک URL عمومی دریافت می‌کنید. همان URL را می‌توانید روی هر کامپیوتر ویندوزی باز کنید و برای آن Shortcut روی Desktop بسازید.

### نکته امنیتی
این نسخه عمداً بدون Login است، طبق درخواست پروژه. بنابراین هر کسی که URL را داشته باشد می‌تواند به سامانه و اطلاعات ذخیره‌شده دسترسی پیدا کند. برای اطلاعات واقعی بیماران، قبل از استفاده عملی باید احراز هویت و کنترل دسترسی اضافه شود.
