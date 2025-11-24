
import { Post, Comment } from '../types/index';
import { mockPosts, mockComments } from '../constants/mockData';
import { AVATAR_COLORS } from '../constants/config';

let posts: Post[] = [...mockPosts];
let comments: Comment[] = [...mockComments];


const simulateDelay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getPosts = async (): Promise<Post[]> => {
    await simulateDelay(500);
    // Sort posts by creation date, newest first.
    return [...posts].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
};


export const createPost = async (newPostData: Omit<Post, 'id' | 'likesCount' | 'commentsCount' | 'createdAt' | 'trendingScore'>): Promise<Post> => {
    await simulateDelay(700);
    const newPost: Post = {
        id: `post_${posts.length + 1}`,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        trendingScore: 10, // Initial score
        ...newPostData,
    };
    posts.unshift(newPost); // Add to the top of the feed
    return newPost;
};

export const toggleLike = async (postId: string): Promise<number> => {
    await simulateDelay(200);
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        // This is a simplified toggle for demo. A real app would track user likes.
        posts[postIndex].likesCount += 1;
        return posts[postIndex].likesCount;
    }
    throw new Error('Post not found');
};

export const getUserPosts = async (userId: string): Promise<Post[]> => {
    await simulateDelay(400);
    return posts.filter(p => p.authorAnonId === userId).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export const getLikedPosts = async (userId: string): Promise<Post[]> => {
    await simulateDelay(400);
    // In a real app, this would be based on a 'likes' collection.
    // For the demo, we'll return a few random posts.
    return [...posts].sort(() => 0.5 - Math.random()).slice(0, 5);
}

export const getComments = async (postId: string): Promise<Comment[]> => {
    await simulateDelay(300);
    return comments.filter(c => c.postId === postId).sort((a,b) => a.createdAt.getTime() - b.createdAt.getTime());
};

export const addComment = async (postId: string, text: string): Promise<Comment> => {
    await simulateDelay(500);
    const newComment: Comment = {
        id: `comment_${comments.length + 1}`,
        postId: postId,
        authorAnonId: 'Student#101', // Mock current user
        authorAvatarColor: AVATAR_COLORS[0],
        text: text,
        likesCount: 0,
        createdAt: new Date(),
    };
    comments.push(newComment);
    
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
        posts[postIndex].commentsCount += 1;
    }

    return newComment;
};

export const submitReport = async (postId: string, reason: string): Promise<boolean> => {
    await simulateDelay(600);
    console.log(`Post ${postId} reported for: ${reason}`);
    return true; // Simulate success
};