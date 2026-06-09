import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import CompanyHoldPage from './components/CompanyHoldPage';

export default function PendingApproval() {
    const navigate = useNavigate();
    const [status, setStatus] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);

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
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-8 h-8 border-4 border-[#8100D1] border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-10 px-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl">
                <CompanyHoldPage status={status} reason={reason} />
                
                <div className="mt-8 text-center border-t border-gray-100 pt-6">
                    <button 
                        onClick={handleLogout}
                        className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors"
                    >
                        Keluar / Ganti Akun
                    </button>
                </div>
            </div>
        </div>
    );
}
