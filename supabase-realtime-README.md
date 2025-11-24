# Supabase Realtime Integration

This document describes the Supabase Realtime integration added to the Lastbench app.

## Features

✅ **Real-time Post Updates** - New posts appear instantly without refresh  
✅ **Real-time Comments** - Comments update live as they're posted  
✅ **Real-time Likes** - Like counts update immediately  
✅ **Instagram-style Notifications** - Bell icon with push notifications for likes, comments, and replies  
✅ **Smart Debouncing** - Prevents UI thrashing from rapid updates  
✅ **Reconnection Logic** - Automatically reconnects if connection drops  

## Setup Instructions

### 1. Enable Realtime in Supabase

Go to your Supabase dashboard and enable Realtime for these tables:

```sql
-- Enable Realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;

-- Enable Realtime for comments table  
ALTER PUBLICATION supabase_realtime ADD TABLE comments;

-- Enable Realtime for interactions table
ALTER PUBLICATION supabase_realtime ADD TABLE interactions;

-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

### 2. Create Notifications Table

If you don't have a notifications table yet, create it:

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reply', 'mention')),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    actor_id UUID NOT NULL,
    actor_name TEXT NOT NULL,
    actor_avatar TEXT,
    content TEXT,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Allow inserts (for triggers/functions)
CREATE POLICY "Allow notification inserts"
    ON notifications FOR INSERT
    WITH CHECK (true);
```

### 3. Create Database Triggers for Notifications

Automatically create notifications when users interact:

```sql
-- Function to create like notification
CREATE OR REPLACE FUNCTION create_like_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    liker_profile RECORD;
BEGIN
    -- Get post author
    SELECT author_id INTO post_author_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Get liker profile
    SELECT display_name, avatar_url INTO liker_profile
    FROM profiles
    WHERE id = NEW.user_id;
    
    -- Don't notify if user likes own post
    IF post_author_id != NEW.user_id THEN
        INSERT INTO notifications (
            user_id, type, post_id, actor_id, actor_name, actor_avatar
        ) VALUES (
            post_author_id, 
            'like', 
            NEW.post_id, 
            NEW.user_id,
            liker_profile.display_name,
            liker_profile.avatar_url
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on interactions table
CREATE TRIGGER on_like_notification
    AFTER INSERT ON interactions
    FOR EACH ROW
    WHEN (NEW.type = 'like' AND NEW.post_id IS NOT NULL)
    EXECUTE FUNCTION create_like_notification();

-- Function to create comment notification
CREATE OR REPLACE FUNCTION create_comment_notification()
RETURNS TRIGGER AS $$
DECLARE
    post_author_id UUID;
    commenter_profile RECORD;
BEGIN
    -- Get post author
    SELECT author_id INTO post_author_id
    FROM posts
    WHERE id = NEW.post_id;
    
    -- Get commenter profile
    SELECT display_name, avatar_url INTO commenter_profile
    FROM profiles
    WHERE id = NEW.author_id;
    
    -- Don't notify if user comments on own post
    IF post_author_id != NEW.author_id THEN
        INSERT INTO notifications (
            user_id, type, post_id, comment_id, actor_id, actor_name, actor_avatar, content
        ) VALUES (
            post_author_id, 
            'comment', 
            NEW.post_id, 
            NEW.id,
            NEW.author_id,
            commenter_profile.display_name,
            commenter_profile.avatar_url,
            SUBSTRING(NEW.text, 1, 100)
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on comments table
CREATE TRIGGER on_comment_notification
    AFTER INSERT ON comments
    FOR EACH ROW
    EXECUTE FUNCTION create_comment_notification();
```

### 4. Environment Variables

Add to your `.env` or `.env.local`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_USE_SUPABASE_REALTIME=true
```

## Testing

### Manual Testing Steps

1. **Test New Post Realtime**
   - Open app in two browser tabs
   - Create a post in tab 1
   - Verify it appears instantly in tab 2

2. **Test Comment Updates** 
   - Open a post in two tabs
   - Add a comment in tab 1
   - Verify it appears in tab 2 without refresh

3. **Test Like Updates**
   - Like a post in one tab
   - Check that like count updates in other tab

4. **Test Notifications**
   - Have another user like your post
   - Check that notification bell shows badge
   - Open notifications panel to see details

### Using the Test Component

A test component is included at `src/components/RealtimeTest.jsx`:

```tsx
import RealtimeTest from './components/RealtimeTest';

// Add to your app temporarily
<RealtimeTest />
```

This component lets you:
- Simulate INSERT, UPDATE, DELETE events
- See realtime payloads in console
- Test reconnection behavior

## Architecture

### Files Added

- `src/hooks/useSupabaseRealtime.ts` - Reusable realtime hooks
- `src/utils/realtimeUtils.ts` - Merge functions and utilities
- `services/notificationService.ts` - Notification CRUD operations
- `components/NotificationBell.tsx` - Notification UI component
- `types/notifications.ts` - TypeScript types

### How It Works

1. **Subscription Management**: React hooks automatically subscribe/unsubscribe on mount/unmount
2. **Debouncing**: Rapid updates are coalesced to prevent UI thrashing (default 150ms)
3. **Merge Strategy**: Smart merging preserves pagination and prevents duplicates
4. **Reconnection**: Auto-reconnects with exponential backoff if connection drops

## Performance Optimizations

- ✅ Debounced callbacks prevent excessive re-renders
- ✅ Channel cleanup prevents memory leaks
- ✅ Filtered subscriptions reduce unnecessary data transfer
- ✅ Pagination preserved during realtime updates
- ✅ Duplicate detection prevents duplicate entries

## Troubleshooting

### Realtime not working?

1. Check that Realtime is enabled in Supabase dashboard (Database → Replication)
2. Verify `ALTER PUBLICATION` commands were run
3. Check browser console for connection errors
4. Verify environment variables are set correctly

### Too many re-renders?

Increase `debounceMilliseconds` in hook options:

```ts
useSupabaseRealtime('posts', handleUpdate, { debounceMilliseconds: 300 });
```

### Notifications not appearing?

1. Verify notifications table exists
2. Check triggers are created
3. Verify RLS policies allow inserts
4. Check browser console for errors

## Future Enhancements

- [ ] Mark notifications as read when viewing related post
- [ ] Sound effects for notifications
- [ ] Push notifications when app is closed (requires service worker)
- [ ] Notification preferences/settings
- [ ] Batch notification delivery for high-traffic periods

## Support

For issues or questions:
1. Check browser console for errors
2. Check Supabase logs in dashboard
3. Verify database triggers are working
4. Test with the included test component
