// Community Forum Service for HealthWise.AI
// Mock forum posts and comments

export interface ForumPost {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    title: string;
    content: string;
    category: string;
    likes: number;
    commentCount: number;
    createdAt: string;
    isLiked?: boolean;
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
    createdAt: string;
}

// Forum categories
export const FORUM_CATEGORIES = [
    { id: 'all', label: 'All Topics', emoji: '📋' },
    { id: 'diet', label: 'Diet & Nutrition', emoji: '🥗' },
    { id: 'exercise', label: 'Exercise & Fitness', emoji: '🏃' },
    { id: 'mental', label: 'Mental Health', emoji: '🧠' },
    { id: 'chronic', label: 'Chronic Conditions', emoji: '💊' },
    { id: 'wellness', label: 'General Wellness', emoji: '✨' },
    { id: 'questions', label: 'Q&A', emoji: '❓' },
];

// Mock posts data
const MOCK_POSTS: ForumPost[] = [
    {
        id: 'post_1',
        userId: 'user_1',
        userName: 'Sarah M.',
        userAvatar: '👩',
        title: 'Tips for managing diabetes with diet changes',
        content: 'I was diagnosed with Type 2 diabetes last year and have been making significant diet changes. Cutting out sugary drinks and reducing carbs has helped me lower my A1C from 8.5 to 6.2! Happy to share my meal plan with anyone interested.',
        category: 'diet',
        likes: 47,
        commentCount: 12,
        createdAt: '2024-01-15T10:00:00Z'
    },
    {
        id: 'post_2',
        userId: 'user_2',
        userName: 'Mike R.',
        userAvatar: '👨',
        title: 'Best exercises for lower back pain?',
        content: 'I have been dealing with chronic lower back pain for months. Physical therapy helped but I want to maintain exercises at home. What exercises have worked for you?',
        category: 'exercise',
        likes: 23,
        commentCount: 18,
        createdAt: '2024-01-14T15:30:00Z'
    },
    {
        id: 'post_3',
        userId: 'user_3',
        userName: 'Dr. Emily',
        userAvatar: '👩‍⚕️',
        title: 'Understanding your blood pressure readings',
        content: 'Many people are confused about blood pressure numbers. Here\'s a quick guide:\n\n• Normal: Less than 120/80\n• Elevated: 120-129/<80\n• Stage 1 Hypertension: 130-139/80-89\n• Stage 2 Hypertension: 140+/90+\n\nAlways consult your doctor for persistent high readings!',
        category: 'chronic',
        likes: 89,
        commentCount: 34,
        createdAt: '2024-01-13T09:00:00Z'
    },
    {
        id: 'post_4',
        userId: 'user_4',
        userName: 'Anna K.',
        userAvatar: '👧',
        title: 'Meditation apps that actually work',
        content: 'I have tried so many meditation apps and finally found ones that help with my anxiety. Headspace and Calm are great, but I also discovered a free one called Insight Timer that has amazing guided meditations. What apps do you use?',
        category: 'mental',
        likes: 56,
        commentCount: 21,
        createdAt: '2024-01-12T14:00:00Z'
    },
    {
        id: 'post_5',
        userId: 'user_5',
        userName: 'James L.',
        userAvatar: '👴',
        title: 'Morning routine for better energy',
        content: 'After years of feeling tired in the mornings, I developed a routine that works:\n\n1. Wake up at the same time daily\n2. Drink water immediately\n3. 10 min stretching\n4. Healthy breakfast\n5. 15 min walk\n\nMy energy levels have improved dramatically!',
        category: 'wellness',
        likes: 78,
        commentCount: 15,
        createdAt: '2024-01-11T08:00:00Z'
    }
];

const MOCK_COMMENTS: Comment[] = [
    {
        id: 'comment_1',
        postId: 'post_1',
        userId: 'user_6',
        userName: 'John D.',
        userAvatar: '👨',
        content: 'This is really inspiring! Would love to see your meal plan.',
        createdAt: '2024-01-15T11:00:00Z'
    },
    {
        id: 'comment_2',
        postId: 'post_1',
        userId: 'user_7',
        userName: 'Lisa T.',
        userAvatar: '👩',
        content: 'Congratulations on your progress! I am just starting my journey.',
        createdAt: '2024-01-15T12:00:00Z'
    }
];

class ForumService {
    private posts: ForumPost[] = [...MOCK_POSTS];
    private comments: Comment[] = [...MOCK_COMMENTS];
    private likedPosts: Set<string> = new Set();
    private storageKey = 'hw_forum_posts';
    private likesKey = 'hw_forum_likes';

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        try {
            const savedPosts = localStorage.getItem(this.storageKey);
            if (savedPosts) {
                const userPosts = JSON.parse(savedPosts);
                this.posts = [...MOCK_POSTS, ...userPosts];
            }

            const savedLikes = localStorage.getItem(this.likesKey);
            if (savedLikes) {
                this.likedPosts = new Set(JSON.parse(savedLikes));
            }
        } catch (e) {
            console.error('Failed to load forum data:', e);
        }
    }

    private saveToStorage() {
        try {
            const userPosts = this.posts.filter(p => !MOCK_POSTS.some(mp => mp.id === p.id));
            localStorage.setItem(this.storageKey, JSON.stringify(userPosts));
            localStorage.setItem(this.likesKey, JSON.stringify([...this.likedPosts]));
        } catch (e) {
            console.error('Failed to save forum data:', e);
        }
    }

    // Get all posts
    getAllPosts(category?: string): ForumPost[] {
        let posts = this.posts;

        if (category && category !== 'all') {
            posts = posts.filter(p => p.category === category);
        }

        return posts
            .map(p => ({ ...p, isLiked: this.likedPosts.has(p.id) }))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Get post by ID
    getPostById(id: string): ForumPost | undefined {
        const post = this.posts.find(p => p.id === id);
        if (post) {
            return { ...post, isLiked: this.likedPosts.has(post.id) };
        }
        return undefined;
    }

    // Create new post
    createPost(title: string, content: string, category: string): ForumPost {
        const newPost: ForumPost = {
            id: `post_${Date.now()}`,
            userId: 'current_user',
            userName: 'You',
            userAvatar: '👤',
            title,
            content,
            category,
            likes: 0,
            commentCount: 0,
            createdAt: new Date().toISOString()
        };

        this.posts.unshift(newPost);
        this.saveToStorage();
        return newPost;
    }

    // Like/unlike post
    toggleLike(postId: string): boolean {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return false;

        if (this.likedPosts.has(postId)) {
            this.likedPosts.delete(postId);
            post.likes--;
        } else {
            this.likedPosts.add(postId);
            post.likes++;
        }

        this.saveToStorage();
        return this.likedPosts.has(postId);
    }

    // Get comments for a post
    getComments(postId: string): Comment[] {
        return this.comments
            .filter(c => c.postId === postId)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    // Add comment
    addComment(postId: string, content: string): Comment {
        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            postId,
            userId: 'current_user',
            userName: 'You',
            userAvatar: '👤',
            content,
            createdAt: new Date().toISOString()
        };

        this.comments.push(newComment);

        const post = this.posts.find(p => p.id === postId);
        if (post) post.commentCount++;

        return newComment;
    }

    // Format date for display
    formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
}

export const forumService = new ForumService();
export default forumService;
