<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = $_POST['email'];
    $password = $_POST['password'];

    $conn = new mysqli("sql207.infinityfree.com", "if0_37758794", "3God4JKcSu6pb", "if0_37758794_Gamal");
    $result = $conn->query("SELECT * FROM users WHERE email = '$email'");

    if ($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            header("Location: upload.php");
        } else {
            echo "كلمة المرور غير صحيحة.";
        }
    } else {
        echo "البريد الإلكتروني غير موجود.";
    }
    $conn->close();
}
?>
<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>رفع الصور</title>
    <!-- رابط ملف CSS -->
    <link rel="stylesheet" href="style.css">
</head>
<body>
<div class="container">
    <h2>تسجيل الدخول</h2>
    <form method="post">
        <input type="email" name="email" placeholder="البريد الإلكتروني" required>
        <input type="password" name="password" placeholder="كلمة المرور" required>
        <button type="submit">دخول</button>
    </form>
    <div class="additional-actions">
        <p>ليس لديك حساب؟</p>
        <a href="register.php" class="register-btn">إنشاء حساب جديد</a>
    </div>
</div>

</body>
</html>