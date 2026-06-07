<!DOCTYPE html>
<html>
<head>
    <title>Akun Perusahaan Disetujui</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #8100D1;">Selamat, {{ $companyName }}!</h2>
        <p>Akun perusahaan Anda di platform <strong>LockER</strong> telah disetujui oleh Administrator.</p>
        <p>Anda sekarang memiliki akses penuh untuk mempublikasikan lowongan pekerjaan dan menemukan talenta terbaik melalui platform kami.</p>
        
        <div style="margin: 30px 0; text-align: center;">
            <a href="{{ url('/') }}" style="background-color: #8100D1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Masuk ke Dashboard</a>
        </div>
        
        <p>Terima kasih telah bergabung bersama LockER.</p>
        <p>Salam,<br>Tim Administrator LockER</p>
    </div>
</body>
</html>
