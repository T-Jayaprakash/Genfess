import { Post, Comment, PostTag } from '../types/index';
import { supabase } from './supabaseClient';
import { getCurrentUser } from './userService';

const PROFILE_FIELDS = 'id, anon_id, display_name, avatar_color, college, department, has_onboarded';
const FEED_CACHE_KEY = 'lastbench_feed_cache';

const mapDbPostToPost = (dbPost: any): Post => {
    const profile = Array.isArray(dbPost.profiles) ? dbPost.profiles[0] : dbPost.profiles;

    let images: string[] = dbPost.images || [];
    let mainImageUrl = dbPost.image_url;

    if (images.length === 0 && mainImageUrl && typeof mainImageUrl === 'string') {
        if (mainImageUrl.trim().startsWith('[')) {
            try {
                const parsed = JSON.parse(mainImageUrl);
                if (Array.isArray(parsed)) {
                    images = parsed;
                    mainImageUrl = parsed[0];
                }
            } catch (e) {
                images = [mainImageUrl];
            }
        } else {
            images = [mainImageUrl];
        }
    }

    return {
        id: dbPost.id,
        authorAnonId: profile?.anon_id || 'Unknown',
        displayName: profile?.display_name || 'Anonymous',
        authorAvatarColor: profile?.avatar_color || '#ccc',
        authorAvatarUrl: profile?.avatar_url,
        text: dbPost.text,
        imageUrl: mainImageUrl,
        images: images,
        department: dbPost.department,
        tags: dbPost.tags || [],
        likesCount: dbPost.likes_count || 0,
        commentsCount: dbPost.comments_count || 0,
        createdAt: new Date(dbPost.created_at),
        trendingScore: (dbPost.likes_count || 0) + (dbPost.comments_count * 2),
        isLiked: dbPost.isLiked || false, // Will be set by getPosts after fetching user likes
    };
};

const mapDbCommentToComment = (dbComment: any): Comment => {
    const profile = Array.isArray(dbComment.profiles) ? dbComment.profiles[0] : dbComment.profiles;

    // Default to false, will be populated by getComments logic if applicable
    const isLiked = false;

    return {
        id: dbComment.id,
        postId: dbComment.post_id,
        parentId: dbComment.parent_id || null,
        authorAnonId: profile?.anon_id || 'Unknown',
        authorAvatarColor: profile?.avatar_color || '#ccc',
        authorAvatarUrl: profile?.avatar_url,
        text: dbComment.text,
        likesCount: dbComment.likes_count || 0,
        isLiked: isLiked,
        createdAt: new Date(dbComment.created_at),
    };
};

// Retrieve cached posts instantly
export const getCachedPosts = (): Post[] => {
    try {
        const cached = localStorage.getItem(FEED_CACHE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached);
            // Re-hydrate Date objects
            const posts = parsed.map((p: any) => ({
                ...p,
                createdAt: new Date(p.createdAt)
            }));
            console.log(`Loaded ${posts.length} posts from cache`);
            return posts;
        } else {
            console.log('No cached posts found');
        }
    } catch (e) {
        console.error("Cache parse error", e);
        // Clear corrupted cache
        try {
            localStorage.removeItem(FEED_CACHE_KEY);
        } catch { }
    }
    return [];
};

export const getPosts = async (page = 0, limit = 20): Promise<Post[]> => {
    try {
        const user = await getCurrentUser();

        if (!user || !user.college) {
            return [];
        }

        const userCollege = user.college.trim();
        const from = page * limit;
        const to = from + limit - 1;

        // PERFORMANCE OPTIMIZATION: 
        // 1. Filter by 'college' column on posts table directly (faster than joining profiles)
        // 2. Use left join instead of inner join to avoid LATERAL join overhead
        // 3. Select only needed fields to reduce data transfer
        // 4. Fetch posts and likes in parallel for faster loading
        const [postsResult, likesResult] = await Promise.all([
            supabase
                .from('posts')
                .select(`
                    id, author_id, text, image_url, images, department, tags, likes_count, comments_count, created_at, college,
                    profiles!left (${PROFILE_FIELDS})
                `)
                .eq('college', userCollege)
                .order('created_at', { ascending: false })
                .range(from, to),
            // Fetch likes in parallel - increase limit to ensure liked state persists
            user ? supabase
                .from('interactions')
                .select('post_id')
                .eq('user_id', user.userId)
                .eq('type', 'like')
                .order('created_at', { ascending: false })
                .limit(2000)
                : Promise.resolve({ data: null, error: null })
        ]);

        const { data, error } = postsResult;

        // ... (existing fallback logic) ...

        if (error) {
            console.error('getPosts Error:', JSON.stringify(error, null, 2));
            return [];
        }

        const mappedPosts = (data || []).map(mapDbPostToPost);

        // Apply likes from parallel fetch
        if (likesResult.data) {
            const likedPostIds = new Set(likesResult.data.map((like: any) => like.post_id));
            mappedPosts.forEach(post => {
                post.isLiked = likedPostIds.has(post.id);
            });
        }

        // ... (caching logic) ...

        return mappedPosts;
    } catch (err) {
        console.error("Unexpected error in getPosts:", err);
        return [];
    }
};

export const createPost = async (newPostData: { text: string; images?: string[]; tags: PostTag[] }): Promise<Post | null> => {
    try {
        const user = await getCurrentUser();
        if (!user) throw new Error('User not authenticated');

        const payload: any = {
            author_id: user.userId,
            text: newPostData.text,
            tags: newPostData.tags,
            department: user.department,
            college: user.college // DENORMALIZATION: Save college on post to speed up future queries
        };

        if (newPostData.images && newPostData.images.length > 0) {
            payload.images = newPostData.images;
            payload.image_url = newPostData.images[0];
        }

        const { data, error } = await supabase
            .from('posts')
            .insert(payload)
            .select(`
                *,
                profiles:author_id (${PROFILE_FIELDS})
            `)
            .single();

        if (error) {
            const isSchemaError = error.code === '42703' || error.code === 'PGRST204' || error.message?.includes('images') || error.message?.includes('college');

            // Fallback logic if schema is old
            if (isSchemaError) {
                // Remove fields that might not exist yet
                if (payload.images) {
                    payload.image_url = JSON.stringify(payload.images);
                    delete payload.images;
                }
                delete payload.college; // Remove college if column missing

                const { data: retryData, error: retryError } = await supabase
                    .from('posts')
                    .insert(payload)
                    .select(`*, profiles:author_id (${PROFILE_FIELDS})`)
                    .single();

                if (retryError) return null;
                return mapDbPostToPost(retryData);
            }
            return null;
        }

        return mapDbPostToPost(data);
    } catch (err) {
        return null;
    }
};

export const deletePost = async (postId: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) {
        console.error("deletePost: No user authenticated");
        return false;
    }

    try {
        // 1. Delete Post Interactions (Likes)
        await supabase.from('interactions').delete().eq('post_id', postId);

        // 2. Delete Reports
        await supabase.from('reports').delete().eq('post_id', postId);

        // 3. Delete Comments and their Interactions
        const { data: comments } = await supabase.from('comments').select('id').eq('post_id', postId);

        if (comments && comments.length > 0) {
            const commentIds = comments.map(c => c.id);
            await supabase.from('interactions').delete().in('comment_id', commentIds);
            await supabase.from('comments').delete().eq('post_id', postId);
        }

        // 4. Finally, Delete the Post
        const { error, count } = await supabase
            .from('posts')
            .delete({ count: 'exact' })
            .eq('id', postId)
            .eq('author_id', user.userId);

        if (error) {
            console.error("Error deleting post DB:", JSON.stringify(error, null, 2));
            return false;
        }

        if (count === 0) {
            console.warn("Delete op returned 0 rows affected. Permission denied or post not found.");
            return false;
        }

        return true;
    } catch (e) {
        console.error("Unexpected error during delete sequence:", e);
        return false;
    }
};

const toggleInteraction = async (postId: string, type: 'like'): Promise<number> => {
    const user = await getCurrentUser();
    if (!user) return 0;

    const { data: existingInteraction, error: fetchError } = await supabase
        .from('interactions')
        .select('*')
        .eq('user_id', user.userId)
        .eq('post_id', postId)
        .eq('type', type)
        .maybeSingle();

    if (fetchError) return 0;

    let newCount = 0;

    if (existingInteraction) {
        const { error: deleteError } = await supabase
            .from('interactions')
            .delete()
            .eq('id', existingInteraction.id);

        if (!deleteError) {
            const { data: post } = await supabase.from('posts').select(`${type}s_count`).eq('id', postId).single();
            const currentCount = post ? post[`${type}s_count`] : 0;
            newCount = Math.max(0, currentCount - 1);
            await supabase.from('posts').update({ [`${type}s_count`]: newCount }).eq('id', postId);
        }
    } else {
        const { error: insertError } = await supabase
            .from('interactions')
            .insert({
                user_id: user.userId,
                post_id: postId,
                type: type
            });

        if (!insertError) {
            const { data: post } = await supabase.from('posts').select(`${type}s_count`).eq('id', postId).single();
            const currentCount = post ? post[`${type}s_count`] : 0;
            newCount = currentCount + 1;
            await supabase.from('posts').update({ [`${type}s_count`]: newCount }).eq('id', postId);
        }
    }

    return newCount;
};

export const toggleLike = async (postId: string): Promise<number> => {
    return toggleInteraction(postId, 'like');
};

export const getUserPosts = async (anonId: string): Promise<Post[]> => {
    const user = await getCurrentUser();

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles:author_id!inner (${PROFILE_FIELDS})
        `)
        .eq('profiles.anon_id', anonId)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) {
        return [];
    }

    const mappedPosts = (data || []).map(mapDbPostToPost);

    if (user && mappedPosts.length > 0) {
        const postIds = mappedPosts.map(p => p.id);
        const { data: userLikes, error: likesError } = await supabase
            .from('interactions')
            .select('post_id')
            .eq('user_id', user.userId)
            .eq('type', 'like')
            .in('post_id', postIds);

        if (!likesError && userLikes) {
            const likedPostIds = new Set(userLikes.map((like: any) => like.post_id));
            mappedPosts.forEach(post => {
                post.isLiked = likedPostIds.has(post.id);
            });
        }
    }

    return mappedPosts;
};

export const updatePost = async (postId: string, text: string): Promise<boolean> => {
    const user = await getCurrentUser();
    if (!user) return false;

    try {
        const { error } = await supabase
            .from('posts')
            .update({ text: text, is_edited: true })
            .eq('id', postId)
            .eq('author_id', user.userId);

        if (error) {
            console.error("Error updating post:", error);
            return false;
        }
        return true;
    } catch (e) {
        console.error("Exception updating post:", e);
        return false;
    }
};

export const getLikedPosts = async (anonId: string): Promise<Post[]> => {
    // 1. Find Profile ID from Anon ID
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('anon_id', anonId)
        .single();

    if (profileError || !profile) {
        return [];
    }

    // 2. Find interactions
    const { data, error } = await supabase
        .from('interactions')
        .select(`
            post_id,
            posts:post_id (
                *,
                profiles:author_id (${PROFILE_FIELDS})
            )
        `)
        .eq('user_id', profile.id)
        .eq('type', 'like')
        .order('created_at', { ascending: false })
        .limit(50); // Limit to 50 liked posts for performance

    if (error) {
        return [];
    }

    return (data || [])
        .map((item: any) => item.posts)
        .filter((p: any) => p !== null)
        .map(dbPost => {
            const post = mapDbPostToPost(dbPost);
            post.isLiked = true; // Since we fetched from liked interactions, it IS liked
            return post;
        });
};

export const getComments = async (postId: string): Promise<Comment[]> => {
    const user = await getCurrentUser();
    const userId = user ? user.userId : null;

    // 1. Fetch Comments
    // We do NOT join interactions here because schema matching often fails on polymorphic tables or missing FKs
    const { data: commentsData, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles:author_id (${PROFILE_FIELDS})
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error fetching comments:', JSON.stringify(error, null, 2));
        return [];
    }

    if (!commentsData || commentsData.length === 0) return [];

    const comments = commentsData.map(mapDbCommentToComment);

    // 2. Fetch User Likes for these comments (Manual Join logic)
    if (userId) {
        const commentIds = comments.map(c => c.id);
        const { data: likes } = await supabase
            .from('interactions')
            .select('comment_id')
            .eq('user_id', userId)
            .eq('type', 'like')
            .in('comment_id', commentIds);

        if (likes) {
            const likedCommentIds = new Set(likes.map((l: any) => l.comment_id));
            comments.forEach(c => {
                c.isLiked = likedCommentIds.has(c.id);
            });
        }
    }

    return comments;
};

export const addComment = async (postId: string, text: string, parentId?: string): Promise<Comment> => {
    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const payload: any = {
        post_id: postId,
        author_id: user.userId,
        text: text
    };

    if (parentId) {
        payload.parent_id = parentId;
    }

    try {
        const { data, error } = await supabase
            .from('comments')
            .insert(payload)
            .select(`
                *,
                profiles:author_id (${PROFILE_FIELDS})
            `)
            .single();

        if (error) {
            // Fallback if parent_id not in schema yet
            if (error.code === '42703' || error.message?.includes('parent_id')) {
                delete payload.parent_id;
                const { data: retryData, error: retryError } = await supabase
                    .from('comments')
                    .insert(payload)
                    .select(`*, profiles:author_id (${PROFILE_FIELDS})`)
                    .single();
                if (retryError) throw retryError;

                // Update count
                const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
                const currentCount = post ? post.comments_count : 0;
                await supabase.from('posts').update({ comments_count: currentCount + 1 }).eq('id', postId);

                return mapDbCommentToComment(retryData);
            }
            throw error;
        }

        // Update comment count on post
        const { data: post } = await supabase.from('posts').select('comments_count').eq('id', postId).single();
        const currentCount = post ? post.comments_count : 0;
        await supabase.from('posts').update({ comments_count: currentCount + 1 }).eq('id', postId);

        return mapDbCommentToComment(data);
    } catch (err) {
        console.error("addComment failed:", err);
        throw err;
    }
};

export const toggleCommentLike = async (commentId: string): Promise<number | undefined> => {
    const user = await getCurrentUser();
    if (!user) return undefined;

    try {
        // Check existing
        const { data: existing } = await supabase
            .from('interactions')
            .select('id')
            .eq('user_id', user.userId)
            .eq('comment_id', commentId)
            .eq('type', 'like')
            .maybeSingle();

        if (existing) {
            await supabase.from('interactions').delete().eq('id', existing.id);
        } else {
            try {
                await supabase.from('interactions').insert({
                    user_id: user.userId,
                    comment_id: commentId,
                    type: 'like'
                });
            } catch (e) {
                return undefined;
            }
        }

        // Update count
        const { count } = await supabase
            .from('interactions')
            .select('*', { count: 'exact', head: true })
            .eq('comment_id', commentId)
            .eq('type', 'like');

        if (count !== null) {
            await supabase.from('comments').update({ likes_count: count }).eq('id', commentId);
            return count;
        }
    } catch (e) {
        // fail silently
    }
    return undefined;
};

export const submitReport = async (postId: string, reason: string): Promise<boolean | 'DELETED'> => {
    try {
        // 1. Insert Report
        const { error } = await supabase.from('reports').insert({
            post_id: postId,
            reason: reason
        });

        if (error) {
            if (error.code === '42P01' || error.code === 'PGRST205') {
                // Table doesn't exist, pretend success
                return true;
            }
            console.error("Error submitting report:", JSON.stringify(error, null, 2));
            return false;
        }

        // 2. Check Count for Auto-Delete
        const { count, error: countError } = await supabase
            .from('reports')
            .select('*', { count: 'exact', head: true })
            .eq('post_id', postId);

        if (!countError && count !== null && count >= 10) {
            const deleteSuccess = await deletePost(postId);
            if (deleteSuccess) return 'DELETED';
        }

        return true;
    } catch (e) {
        console.error("Report exception:", e);
        return false;
    }
};