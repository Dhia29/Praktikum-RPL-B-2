<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Reset Password LockER</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; border-top: 5px solid #8100D1; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
        .btn { display: inline-block; background: #8100D1; color: #ffffff; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; margin: 25px 0; }
        .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Halo, {{ $name }}!</h2>
        <p>Kami menerima permintaan untuk mereset password akun <strong>LockER</strong> Anda. Klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
        
        <div style="text-align: center;">
            <a href="{{ url('/reset-password?token=' . $token . '&email=' . urlencode($email)) }}" class="btn" style="color: white;">Reset Password</a>
        </div>
        
        <p>Tautan ini hanya berlaku selama <strong>60 menit</strong>.</p>
        <p>Jika Anda merasa tidak pernah meminta reset password, abaikan email ini dan akun Anda akan tetap aman.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} LockER Platform. Hak cipta dilindungi.<br>
            Perjalanan Karir Dimulai dari Sekarang!
        </div>
    </div>
</body>
</html>
