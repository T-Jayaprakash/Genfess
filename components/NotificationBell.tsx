import React, { useState, useEffect } from 'react';
import { NotificationWithPost } from '../types/notifications';
import { BellIcon, XMarkIcon } from './Icons';
import { useSupabaseRealtimeFiltered } from '../src/hooks/useSupabaseRealtime';
import * as notificationService from '../services/notificationService';

interface NotificationBellProps {
    userId: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ userId }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationWithPost[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Fetch initial unread count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const count = await notificationService.getUnreadCount(userId);
            setUnreadCount(count);
        };
        if (userId) {
            fetchUnreadCount();
        }
    }, [userId]);

    // Subscribe to new notifications in realtime
    useSupabaseRealtimeFiltered({
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
        callback: (payload) => {
            if (payload.eventType === 'INSERT') {
                setUnreadCount(prev => prev + 1);
                // Optionally show a toast or play a sound
                if ('vibrate' in navigator) {
                    navigator.vibrate(50);
                }
            } else if (payload.eventType === 'UPDATE' && payload.new.read) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        },
        events: ['INSERT', 'UPDATE'],
        debounceMilliseconds: 100
    });

    const handleOpenNotifications = async () => {
        setIsOpen(true);
        setLoading(true);

        const notifs = await notificationService.getNotifications(userId, 50);
        setNotifications(notifs);
        setLoading(false);
    };

    const handleMarkAllRead = async () => {
        const success = await notificationService.markAllNotificationsRead(userId);
        if (success) {
            setUnreadCount(0);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }
    };

    const getNotificationText = (notif: NotificationWithPost): string => {
        switch (notif.type) {
            case 'like':
                return `${notif.actor_name} liked your post`;
            case 'comment':
                return `${notif.actor_name} commented: ${notif.content?.substring(0, 50)}${notif.content && notif.content.length > 50 ? '...' : ''}`;
            case 'reply':
                return `${notif.actor_name} replied to your comment`;
            case 'mention':
                return `${notif.actor_name} mentioned you`;
            default:
                return 'New notification';
        }
    };

    const timeAgo = (date: Date): string => {
        const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return `${Math.floor(interval)}y`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}mo`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}m`;
        return 'now';
    };

    return (
        <>
            {/* Bell Icon */}
            <button
                onClick={handleOpenNotifications}
                className="relative p-2 text-primary-text dark:text-dark-primary-text hover:opacity-70 transition-opacity"
                aria-label="Notifications"
            >
                <BellIcon className="w-6 h-6" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notifications Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 flex flex-col justify-end sm:justify-center sm:items-center animate-fade-in">
                    <div className="bg-card-bg dark:bg-dark-card-bg w-full sm:max-w-lg sm:rounded-2xl sm:max-h-[80vh] flex flex-col overflow-hidden animate-slide-in-up shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-border-color dark:border-dark-border-color">
                            <h2 className="text-lg font-bold text-primary-text dark:text-dark-primary-text">
                                Notifications
                            </h2>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleMarkAllRead}
                                        className="text-sm text-accent-primary hover:text-accent-secondary font-medium"
                                    >
                                        Mark all read
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-secondary-text dark:text-dark-secondary-text hover:text-primary-text"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Notifications List */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="flex justify-center items-center h-40">
                                    <div className="w-8 h-8 border-4 border-accent-primary border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-secondary-text dark:text-dark-secondary-text">
                                    <BellIcon className="w-12 h-12 mb-2 opacity-50" />
                                    <p>No notifications yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border-color dark:divide-dark-border-color">
                                    {notifications.map((notif) => (
                                        <div
                                            key={notif.id}
                                            className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${!notif.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                {/* Avatar */}
                                                <div
                                                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                                                    style={{
                                                        backgroundColor: notif.actor_avatar
                                                            ? 'transparent'
                                                            : '#667eea'
                                                    }}
                                                >
                                                    {notif.actor_avatar ? (
                                                        <img
                                                            src={notif.actor_avatar}
                                                            alt={notif.actor_name}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        notif.actor_name.charAt(0).toUpperCase()
                                                    )}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-primary-text dark:text-dark-primary-text">
                                                        {getNotificationText(notif)}
                                                    </p>
                                                    <p className="text-xs text-secondary-text dark:text-dark-secondary-text mt-1">
                                                        {timeAgo(notif.created_at)}
                                                    </p>
                                                </div>

                                                {/* Unread indicator */}
                                                {!notif.read && (
                                                    <div className="w-2 h-2 bg-accent-primary rounded-full flex-shrink-0 mt-2"></div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NotificationBell;
