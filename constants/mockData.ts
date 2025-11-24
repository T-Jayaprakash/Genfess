
import { Post, PostTag, Comment } from '../types/index';
import { DEPARTMENTS, AVATAR_COLORS } from './config';

const TAGS: PostTag[] = ['Confess', 'Roast', 'Meme', 'Love', 'Dept', 'Other'];

const SAMPLE_TEXTS = [
    "CSE department la nadantha fest semma vibe ah irunthuchu!",
    "Mech boys, assemble! Canteen la meet pannalam.",
    "Exam preparation epdi poguthu friends?",
    "Confession: I have a crush on my classmate.",
    "Indha new professor super ah teach panraru.",
    "That moment when you finally debug your code after 5 hours.",
    "Hostel life is the best life, change my mind.",
    "Placement season tension la iruken... any tips?",
    "That one friend who always copies assignment.",
    "College cultural event was lit this year!",
    "Love the chai at the small shop near our college.",
    "Roast: ECE students thinking they are superior.",
    "When is the next holiday? Waiting eagerly.",
    "This semester's syllabus is so heavy.",
    "Meme: My brain cells during the exam vs during a movie.",
];

const SAMPLE_COMMENTS = ["Super!", "Nice one macha", "lol 😂", "Relatable", "Semma! 🔥", "True that!"];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomTags = (): PostTag[] => {
    const numTags = Math.floor(Math.random() * 3) + 1;
    const shuffled = [...TAGS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numTags);
};

const generateMockPosts = (count: number): Post[] => {
    const posts: Post[] = [];
    for (let i = 1; i <= count; i++) {
        const now = new Date();
        const randomMinutesAgo = Math.floor(Math.random() * 60 * 24 * 7); // a week
        const createdAt = new Date(now.getTime() - randomMinutesAgo * 60000);

        const likes = Math.floor(Math.random() * 500);
        const comments = Math.floor(Math.random() * 20); // Realistic comment count

        posts.push({
            id: `post_${i}`,
            authorAnonId: `Student#${Math.floor(Math.random() * 900) + 100}`,
            displayName: `Student#${Math.floor(Math.random() * 900) + 100}`,
            authorAvatarColor: getRandomElement(AVATAR_COLORS),
            text: getRandomElement(SAMPLE_TEXTS),
            imageUrl: `https://picsum.photos/seed/${i}/400/600`,
            department: getRandomElement(DEPARTMENTS),
            tags: getRandomTags(),
            likesCount: likes,
            commentsCount: comments,
            createdAt: createdAt,
            trendingScore: likes + (comments * 2) - (randomMinutesAgo / 60)
        });
    }
    return posts;
};

export const mockPosts: Post[] = generateMockPosts(50);

const generateMockComments = (posts: Post[]): Comment[] => {
    const comments: Comment[] = [];
    let commentId = 1;
    posts.forEach(post => {
        for (let i = 0; i < post.commentsCount; i++) {
            comments.push({
                id: `comment_${commentId++}`,
                postId: post.id,
                authorAnonId: `Student#${Math.floor(Math.random() * 900) + 100}`,
                authorAvatarColor: getRandomElement(AVATAR_COLORS),
                text: getRandomElement(SAMPLE_COMMENTS),
                likesCount: Math.floor(Math.random() * 20),
                createdAt: new Date(post.createdAt.getTime() + (i * 60000 * 5)), // comments after post
            });
        }
    });
    return comments;
};

export const mockComments: Comment[] = generateMockComments(mockPosts);