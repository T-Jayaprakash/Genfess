import { supabase } from './supabaseClient';
import { Notification, NotificationWithPost } from '../types/notifications';

/**
 * Fetch notifications for the current user
 */
export async function getNotifications(userId: string, limit: number = 50): Promise<NotificationWithPost[]> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                posts:post_id (text, image_url),
                actor:actor_id (display_name, avatar_url, avatar_color)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) {
            console.error('Error fetching notifications:', error);
            return [];
        }

        return (data || []).map((notif: any) => ({
            ...notif,
            post_text: notif.posts?.text,
            post_image: notif.posts?.image_url,
            actor_name: notif.actor?.display_name || 'Unknown',
            actor_avatar: notif.actor?.avatar_url,
            created_at: new Date(notif.created_at)
        }));
    } catch (err) {
        console.error('Exception fetching notifications:', err);
        return [];
    }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('id', notificationId);

        return !error;
    } catch (err) {
        console.error('Error marking notification as read:', err);
        return false;
    }
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ read: true })
            .eq('user_id', userId)
            .eq('read', false);

        return !error;
    } catch (err) {
        console.error('Error marking all notifications as read:', err);
        return false;
    }
}

/**
 * Get unread notification count
 */
export async function getUnreadCount(userId: string): Promise<number> {
    try {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }

        return count || 0;
    } catch (err) {
        console.error('Exception getting unread count:', err);
        return 0;
    }
}

/**
 * Create a notification (typically called from database trigger or edge function)
 */
export async function createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('notifications')
            .insert([notification]);

        return !error;
    } catch (err) {
        console.error('Error creating notification:', err);
        return false;
    }
}

/**
 * Delete old notifications (cleanup function)
 */
export async function deleteOldNotifications(userId: string, daysOld: number = 30): Promise<boolean> {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', userId)
            .lt('created_at', cutoffDate.toISOString());

        return !error;
    } catch (err) {
        console.error('Error deleting old notifications:', err);
        return false;
    }
}
