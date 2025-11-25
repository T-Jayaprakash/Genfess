# 🔧 Supabase Setup & Troubleshooting Guide

## 🚨 Critical Issues & Fixes

You're experiencing these issues:
1. **Likes disappear after 1-2 seconds** → RLS policy blocking 
2. **Posts not uploading** → RLS policy blocking
3. **Can't edit/delete posts** → RLS policy blocking

**Root Cause**: Supabase Row Level Security (RLS) policies are blocking your operations.

---

## ✅ Step-by-Step Fix

### 1. Open Supabase Dashboard
1. Go to https://supabase.com
2. Open your project: `koxukijufywvgnxqtuzz`
3. Click **Authentication** → **Policies**

---

### 2. Fix RLS Policies for `posts` Table

#### Option A: Disable RLS (Quick Fix for Testing)
```sql
-- Run this in SQL Editor
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
```

#### Option B: Proper RLS Policies (Recommended for Production)

Go to **SQL Editor** and run this:

```sql
-- ============================================
-- POSTS TABLE POLICIES
-- ============================================

-- Allow anyone to read posts
CREATE POLICY "Allow public read posts" 
ON posts FOR SELECT 
USING (true);

-- Allow authenticated users to insert posts
CREATE POLICY "Allow authenticated users to insert posts" 
ON posts FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to update their own posts
CREATE POLICY "Allow users to update own posts" 
ON posts FOR UPDATE 
USING (auth.uid() = author_id);

-- Allow users to delete their own posts
CREATE POLICY "Allow users to delete own posts" 
ON posts FOR DELETE 
USING (auth.uid() = author_id);

-- ============================================
-- INTERACTIONS TABLE POLICIES (for likes)
-- ============================================

-- Allow anyone to read interactions
CREATE POLICY "Allow public read interactions" 
ON interactions FOR SELECT 
USING (true);

-- Allow authenticated users to insert interactions (like)
CREATE POLICY "Allow authenticated users to insert interactions" 
ON interactions FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Allow users to delete their own interactions (unlike)
CREATE POLICY "Allow users to delete own interactions" 
ON interactions FOR DELETE 
USING (auth.uid() = user_id);

-- ============================================
-- COMMENTS TABLE POLICIES
-- ============================================

-- Allow anyone to read comments
CREATE POLICY "Allow public read comments" 
ON comments FOR SELECT 
USING (true);

-- Allow authenticated users to insert comments
CREATE POLICY "Allow authenticated users to insert comments" 
ON comments FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- Allow users to delete their own comments
CREATE POLICY "Allow users to delete own comments" 
ON comments FOR DELETE 
USING (auth.uid() = author_id);

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Allow anyone to read profiles
CREATE POLICY "Allow public read profiles" 
ON profiles FOR SELECT 
USING (true);

-- Allow users to update their own profile
CREATE POLICY "Allow users to update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Allow authenticated users to insert their profile
CREATE POLICY "Allow authenticated users to insert profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- ============================================
-- REPORTS TABLE POLICIES
-- ============================================

-- Allow authenticated users to insert reports
CREATE POLICY "Allow authenticated users to insert reports" 
ON reports FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- NOTIFICATIONS TABLE POLICIES
-- ============================================

-- Allow users to read their own notifications
CREATE POLICY "Allow users to read own notifications" 
ON notifications FOR SELECT 
USING (auth.uid() = user_id);

-- Allow system to insert notifications
CREATE POLICY "Allow insert notifications" 
ON notifications FOR INSERT 
WITH CHECK (true);

-- Allow users to update their own notifications (mark as read)
CREATE POLICY "Allow users to update own notifications" 
ON notifications FOR UPDATE 
USING (auth.uid() = user_id);
```

---

### 3. Check if Policies Already Exist

If you get errors like "policy already exists", first drop them:

```sql
-- Drop existing policies for posts
DROP POLICY IF EXISTS "Allow public read posts" ON posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert posts" ON posts;
DROP POLICY IF EXISTS "Allow users to update own posts" ON posts;
DROP POLICY IF EXISTS "Allow users to delete own posts" ON posts;

-- Drop existing policies for interactions
DROP POLICY IF EXISTS "Allow public read interactions" ON interactions;
DROP POLICY IF EXISTS "Allow authenticated users to insert interactions" ON interactions;
DROP POLICY IF EXISTS "Allow users to delete own interactions" ON interactions;

-- Drop existing policies for comments
DROP POLICY IF EXISTS "Allow public read comments" ON comments;
DROP POLICY IF EXISTS "Allow authenticated users to insert comments" ON comments;
DROP POLICY IF EXISTS "Allow users to delete own comments" ON comments;

-- Drop existing policies for profiles
DROP POLICY IF EXISTS "Allow public read profiles" ON profiles;
DROP POLICY IF EXISTS "Allow users to update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow authenticated users to insert profile" ON profiles;

-- Then run the CREATE POLICY commands above
```

---

### 4. Enable RLS (if not already)

```sql
-- Make sure RLS is enabled
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
```

---

### 5. Verify Tables Exist

Check if all required columns exist:

```sql
-- Check posts table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'posts';

-- Check interactions table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'interactions';
```

**Required columns for `posts`:**
- id (uuid)
- author_id (uuid)
- text (text)
- image_url (text, nullable)
- images (text[], nullable)
- department (text, nullable)
- college (text, nullable)
- tags (text[])
- likes_count (int, default 0)
- comments_count (int, default 0)
- is_edited (boolean, default false)
- created_at (timestamp)

**Required columns for `interactions`:**
- id (uuid)
- user_id (uuid)
- post_id (uuid, nullable)
- comment_id (uuid, nullable)
- type (text) - should be 'like'
- created_at (timestamp)

---

## 🧪 Testing After Fix

### Test in Browser Console

1. Open your app
2. Open Chrome DevTools (F12)
3. Go to **Console** tab
4. Try these actions:

#### Test Like
```
Look for these logs:
🔄 toggleInteraction: like for post [id] by user [userId]
👍 Adding like...
✅ Like successful. New count: X

If you see ❌ errors, read the message carefully!
```

#### Test Create Post
```
Look for:
📝 Creating post: {userId, college, tags}
📤 Inserting post with payload: {...}
✅ Post created successfully

If you see ❌ errors, it will show the exact issue!
```

#### Test Edit/Delete
```
Look for:
✏️ Updating post [id] by user [userId]
✅ Post updated successfully

OR

🗑️ Deleting post [id]
✅ Post deleted (or specific error)
```

---

## 🔍 Common Error Messages & Solutions

### Error: "new row violates row-level security policy"
**Problem**: RLS blocking INSERT/UPDATE/DELETE  
**Solution**: Run the RLS policies above OR disable RLS temporarily

### Error: "permission denied for table posts"
**Problem**: User role doesn't have permissions  
**Solution**: Grant permissions:
```sql
GRANT ALL ON posts TO authenticated;
GRANT ALL ON interactions TO authenticated;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON profiles TO authenticated;
```

### Error: "column images does not exist"
**Problem**: Old table schema  
**Solution**: Add missing columns:
```sql
ALTER TABLE posts ADD COLUMN IF NOT EXISTS images text[];
ALTER TABLE posts ADD COLUMN IF NOT EXISTS college text;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false;
```

### Error: "violates foreign key constraint"
**Problem**: Referenced user or post doesn't exist  
**Solution**: Check if user profile exists in profiles table

---

## 📊 Quick Diagnosis Checklist

Run this query to check your setup:

```sql
-- Check RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('posts', 'interactions', 'comments', 'profiles');

-- Check existing policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename IN ('posts', 'interactions', 'comments', 'profiles');
```

---

## 🚀 Recommended Setup (Copy-Paste This)

**For Development/Testing** (Quick & Easy):

```sql
-- OPTION 1: Disable RLS for testing
ALTER TABLE posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE interactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE comments DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE reports DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;

-- Grant all permissions
GRANT ALL ON posts TO authenticated;
GRANT ALL ON posts TO anon;
GRANT ALL ON interactions TO authenticated;
GRANT ALL ON interactions TO anon;
GRANT ALL ON comments TO authenticated;
GRANT ALL ON comments TO anon;
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON profiles TO anon;
```

**⚠️ Warning**: This makes all data public. Use only for testing!

---

## 📞 Still Not Working?

1. **Check Browser Console**:
   - Look for ❌ emoji errors
   - Copy the exact error message

2. **Check Supabase Logs**:
   - Go to Supabase Dashboard
   - Click **Logs** → **Database**
   - Look for failed queries

3. **Verify Connection**:
   ```javascript
   // Test in browser console
   console.log(import.meta.env.VITE_SUPABASE_URL);
   console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
   ```

4. **Check Authentication**:
   - Make sure you're logged in
   - Check if user.userId exists

---

## ✅ Success Indicators

You'll know it's working when you see:
- ✅ Like successful. New count: X
- ✅ Post created successfully
- ✅ Post updated successfully
- ✅ Post deleted successfully
- **NO ❌ errors in console**

---

**After applying these fixes, rebuild the app and test!**
