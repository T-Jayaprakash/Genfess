# Performance Optimization Guide

## Issue
The app is loading slowly due to slow database queries. The main query is taking 126ms average (up to 881ms max) and using 38% of total query time.

## Solution

### Step 1: Add Database Indexes (CRITICAL)

Run the SQL in `database-indexes.sql` in your Supabase SQL Editor:

1. Go to your Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database-indexes.sql`
4. Click "Run"

This will create indexes that will dramatically speed up your queries:
- **idx_posts_college_created_at**: Most important - speeds up the main feed query
- **idx_posts_college**: Speeds up filtering by college
- **idx_interactions_user_post_type**: Speeds up like lookups
- And more...

### Step 2: Code Optimizations (Already Applied)

The code has been optimized to:
- Use left joins instead of inner joins (reduces LATERAL join overhead)
- Filter by posts.college directly instead of joining through profiles
- Fetch likes asynchronously (non-blocking)
- Cache posts locally for instant display

### Step 3: Verify Performance

After adding indexes:
1. Check Supabase Dashboard > Database > Query Performance
2. The main posts query should drop from ~126ms to <20ms
3. App should load much faster

### Expected Results

- **Before**: 126ms average, 881ms max
- **After**: <20ms average, <50ms max
- **Improvement**: ~6x faster queries

## Additional Tips

1. **Monitor Query Performance**: Check Supabase Dashboard regularly
2. **Keep Indexes Updated**: Run ANALYZE periodically (already in the SQL)
3. **Consider Pagination**: Current limit of 20 posts per page is good
4. **Cache Strategy**: App already caches posts locally for instant display


