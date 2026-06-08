import React from 'react';

export default function CompanyHoldPage({ status, reason }) {
    const isRejected = status === 'Ditolak';

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
            {isRejected ? (
                <>
                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Pendaftaran Ditolak</h2>
                    <p className="text-gray-600 max-w-md mb-6">
                        Mohon maaf, profil perusahaan Anda tidak memenuhi kriteria kami atau terdapat informasi yang tidak valid.
                    </p>
                    
                    {reason && (
                        <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl max-w-md w-full text-left">
                            <h3 className="font-semibold text-red-900 mb-1">Alasan Penolakan:</h3>
                            <p className="text-sm">{reason}</p>
                        </div>
                    )}
                    
                    <p className="text-sm text-gray-500 mt-8">
                        Silakan hubungi tim *Support* kami jika Anda merasa ini adalah sebuah kesalahan.
                    </p>
                </>
            ) : (
                <>
                    <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">Sedang Ditinjau</h2>
                    <p className="text-gray-600 max-w-md mb-6">
                        Terima kasih telah memverifikasi email Anda! Saat ini profil perusahaan Anda sedang dalam antrean tinjauan manual oleh administrator kami.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl max-w-md w-full">
                        <p className="text-sm">
                            Proses ini biasanya memakan waktu 1x24 jam kerja. Kami akan mengirimkan notifikasi setelah akun Anda disetujui untuk mulai mempublikasikan lowongan.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
