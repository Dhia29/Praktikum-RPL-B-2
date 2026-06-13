import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanyHoldPage from './components/CompanyHoldPage';
import LogoutConfirmModal from './components/LogoutConfirmModal';

export default function PendingApproval() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    useEffect(() => {
        axios.defaults.withCredentials = true;

        axios.get('/me')
            .then(response => {
                const user = response.data.user;
                if (!user) {
                    navigate('/');
                    return;
                }

                if (user.role === 'seeker') {
                    navigate('/loker');
                    return;
                }

                if (user.status === 'Aktif') {
                    navigate('/loker');
                    return;
                }

                setStatus(user.status);
                if (response.data.profile?.alasan_penolakan) {
                    setReason(response.data.profile.alasan_penolakan);
                }
                setIsLoading(false);

                // Setup WebSocket Listener for Real-time Verification
                if (window.Echo) {
                    const channelName = `App.Models.User.${user.id}`;
                    window.Echo.private(channelName)
                        .listen('CompanyStatusUpdated', (e) => {
                            if (e.status === 'Aktif') {
                                navigate('/loker');
                            } else if (e.status === 'Ditolak') {
                                setStatus('Ditolak');
                                setReason(e.reason || 'Ditolak oleh admin.');
                            }
                        });
                }
            })
            .catch(error => {
                navigate('/');
            });

        return () => {
            // Echo cleanup could go here, but navigating away is fine
        };
    }, [navigate]);

    const handleLogout = async () => {
        try {
            await axios.post('/logout');
            navigate('/');
        } catch (e) {
            navigate('/');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0B0F19] transition-colors duration-500">
                <div className="w-8 h-8 border-4 border-[#8100D1] dark:border-[#a055db] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center py-10 px-4 relative overflow-hidden transition-colors duration-500">
            {/* Background Decorative Glow */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[10%] -right-[10%] w-[500px] h-[500px] bg-purple-400/20 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[10%] -left-[10%] w-[400px] h-[400px] bg-indigo-400/20 dark:bg-indigo-900/20 rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="bg-white/80 dark:bg-[#0B0F19]/80 backdrop-blur-2xl p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_0_20px_rgba(255,255,255,0.02)] border border-gray-200/50 dark:border-white/5 w-full max-w-2xl relative z-10 animate-fade-in-up">
                <CompanyHoldPage status={status} reason={reason} />
                
                <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-800/50 pt-6">
                    <button 
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="text-sm font-semibold text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        Keluar / Ganti Akun
                    </button>
                </div>
            </div>

            <LogoutConfirmModal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                onConfirm={handleLogout}
            />
        </div>
    );
}
