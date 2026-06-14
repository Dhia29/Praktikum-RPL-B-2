import React, { useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

export default function LoginAdmin() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.get('/sanctum/csrf-cookie');
            await axios.post('/api/admin/login', {
                email,
                password
            });
            window.location.href = '/admin/dashboard';
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError(t('admin.login.login_failed'));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -left-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -right-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 sm:p-10 rounded-[1.25rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-[480px] relative z-10 animate-fade-in-up">
                
                <div className="text-center mb-8">
                    <h2 className="text-[32px] font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8100D1] to-purple-600 dark:from-[#c682ff] dark:to-purple-400 tracking-tight mb-2">LockER</h2>
                    <p className="text-[#4f566b] dark:text-gray-400 text-base">{t('admin.login.portal')}</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-[14px] font-bold text-gray-700 dark:text-gray-300 mb-2">{t('admin.login.email_label')}</label>
                        <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus placeholder={t('admin.login.email_placeholder')}
                            className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all text-sm placeholder-gray-400" />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-[14px] font-bold text-gray-700 dark:text-gray-300">{t('admin.login.password_label')}</label>
                            <a href="#" className="text-[13px] font-bold text-[#8100D1] dark:text-[#c682ff] hover:underline transition-all">{t('admin.login.forgot_password')}</a>
                        </div>
                        <div className="relative">
                            <input type={showPassword ? 'text' : 'password'} id="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder={t('admin.login.password_placeholder')}
                                className="w-full px-4 py-3 bg-gray-50/50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 dark:text-white rounded-xl focus:ring-2 focus:ring-[#8100D1]/30 focus:border-[#8100D1] outline-none transition-all text-sm placeholder-gray-400 pr-10" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                                {showPassword ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-[0_8px_20px_rgba(129,0,209,0.3)] hover:shadow-[0_8px_25px_rgba(129,0,209,0.5)] transform hover:-translate-y-0.5 mt-4 group relative overflow-hidden bg-gradient-to-r from-[#8100D1] to-purple-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed">
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                        <span className="relative z-10 flex justify-center items-center gap-2">
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    {t('admin.login.processing')}
                                </>
                            ) : t('admin.login.sign_in')}
                        </span>
                    </button>
                </form>

                <div className="relative flex items-center py-6 mt-4">
                    <div className="flex-grow border-t border-gray-200/50 dark:border-slate-800"></div>
                </div>

                <div className="text-center">
                    <div className="inline-flex items-center justify-center gap-2 text-[14px] text-gray-500 dark:text-gray-400">
                        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        {t('admin.login.secure_portal')}
                    </div>
                    <div className="mt-4">
                        <a href="/" className="text-sm font-bold text-[#8100D1] dark:text-[#c682ff] hover:underline transition-all">{t('admin.login.back_home')}</a>
                    </div>
                </div>
            </div>
        </div>
    );
}
