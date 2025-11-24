export interface Notification {
    id: string;
    user_id: string;
    type: 'like' | 'comment' | 'reply' | 'mention';
    post_id?: string;
    comment_id?: string;
    actor_id: string; // User who triggered the notification
    actor_name: string;
    actor_avatar?: string;
    content?: string;
    read: boolean;
    created_at: Date;
}

export interface NotificationWithPost extends Notification {
    post_text?: string;
    post_image?: string;
}
