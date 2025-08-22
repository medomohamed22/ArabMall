# Pi Network Donations (PHP)
موقع تبرعات متكامل يدعم مدفوعات Pi Network عبر SDK و API الرسمية.

## المتطلبات
- PHP 8.1+ مع cURL و PDO MySQL
- MySQL 5.7+ أو MariaDB
- تشغيل الموقع داخل **Pi Browser** لاختبار الدفع
- حساب مطور على Pi App Platform، والحصول على API Key و App ID

## الإعداد
1) أنشئ قاعدة البيانات والجداول:
```
mysql -u root -p < server/db.sql
```
2) انسخ ملف البيئة:
```
cp server/.env.example server/.env
```
3) عدِّل `server/.env` وضع القيم الصحيحة (DB_* ، PI_API_KEY ، PI_APP_ID). اجعل `PI_SANDBOX=1` أثناء الاختبار.
4) ارفع كل المشروع إلى خادم PHP (Apache/Nginx). اجعل مسار الوثائق يشير إلى مجلد المشروع (يُفضّل تشغيله كـ VirtualHost).
5) افتح عنوان الموقع داخل **Pi Browser**.

## التدفُّق (Flow)
- تسجيل الدخول: الزر يستدعي `Pi.authenticate` ثم يرسل بيانات المستخدم إلى `server/api/auth_login.php` للتخزين.
- إنشاء دفع: `Pi.createPayment` من الواجهة الأمامية.
  - onReadyForServerApproval → يستدعي `server/api/payments_approve.php` للموافقة عبر API.
  - onReadyForServerCompletion → يستدعي `server/api/payments_complete.php` لإكمال العملية وتسجيل التبرع في قاعدة البيانات.
- `server/api/stats.php` يوفر أرقامًا موجزة للوحة الأمامية.

## ملاحظات أمان
- قَيِّد الوصول إلى مجلد `server/` عبر إعدادات الخادم (deny direct listing).
- تحقَّق من توكنات المصادقة مع Pi API عند الحاجة.
- فعِّل HTTPS دائمًا.
- استخدم مفاتيح الإنتاج والحسابات الموثوقة فقط عند الإطلاق.

## تخصيص
- حرِّر `public/css/styles.css` للألوان.
- أضف صفحات: /about، /admin (يمكنك بناء صفحة إدارة بسيطة تقرأ من `stats.php` وجداول أخرى).
