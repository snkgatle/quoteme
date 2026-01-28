import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Notification {
    id: string;
    type: 'CLOSING_SOON' | 'QUOTE_ACCEPTED';
    message: string;
    isRead: boolean;
    createdAt: string;
    projectId?: string;
}

interface InboxProps {
    token: string | null;
}

const Inbox: React.FC<InboxProps> = ({ token }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const { logout } = useAuth();

    useEffect(() => {
        if (token) {
            fetchNotifications();
        }
    }, [token]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/sp/notifications', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                logout();
                return;
            }

            const data = await res.json();
            if (res.ok) {
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        // Optimistic update
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));

        try {
            const res = await fetch(`/api/sp/notifications/${id}/read`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.status === 401) {
                logout();
            }
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading notifications...</div>;

    if (notifications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-10 text-gray-500">
                <Bell className="w-10 h-10 mb-4 text-gray-300" />
                <p>No notifications yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 max-w-3xl">
            {notifications.map((n) => (
                <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border transition-all ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100 shadow-sm'
                        }`}
                >
                    <div className="flex gap-4">
                        <div className={`mt-1 p-2 rounded-full ${n.type === 'QUOTE_ACCEPTED' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                            }`}>
                            {n.type === 'QUOTE_ACCEPTED' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className={`text-sm font-bold ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                                    {n.type === 'QUOTE_ACCEPTED' ? 'Quote Accepted' : 'Closing Soon'}
                                </h4>
                                <span className="text-xs text-gray-400">
                                    {new Date(n.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className={`text-sm mt-1 whitespace-pre-wrap ${n.isRead ? 'text-gray-500' : 'text-gray-800'}`}>
                                {n.message}
                            </p>
                            {!n.isRead && (
                                <button
                                    onClick={() => markAsRead(n.id)}
                                    className="text-xs font-medium text-primary-600 mt-2 hover:underline"
                                >
                                    Mark as read
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default Inbox;
