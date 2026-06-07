<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Verifikasi Email LockER</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333; }
        .container { max-w-lg mx-auto bg-white p-8 rounded-xl shadow-sm max-width: 600px; margin: 0 auto; background: #fff; padding: 30px; border-radius: 10px; border-top: 5px solid #8100D1; }
        .code-box { background: #f3e8fc; color: #8100D1; font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; padding: 20px; border-radius: 8px; margin: 30px 0; }
        .footer { font-size: 12px; color: #888; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Halo, {{ $name }}!</h2>
        <p>Terima kasih telah mendaftar di <strong>LockER</strong>. Untuk menyelesaikan proses pendaftaran dan memastikan keamanan akunmu, silakan masukkan kode OTP (One-Time Password) berikut pada halaman verifikasi:</p>
        
        <div class="code-box">
            {{ $code }}
        </div>
        
        <p>Kode ini hanya berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapa pun.</p>
        <p>Jika kamu merasa tidak pernah mendaftar di LockER, abaikan email ini.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} LockER Platform. Hak cipta dilindungi.<br>
            Perjalanan Karir Dimulai dari Sekarang!
        </div>
    </div>
</body>
</html>
