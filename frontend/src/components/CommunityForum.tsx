import React, { useState, useEffect } from 'react';
import {
    MessageCircle, Heart, Plus, Send, X, ChevronRight,
    Filter, Clock, User
} from 'lucide-react';
import { forumService, ForumPost, Comment, FORUM_CATEGORIES } from '../services/forumService';

const CommunityForum: React.FC = () => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);

    useEffect(() => {
        loadPosts();
    }, [selectedCategory]);

    const loadPosts = () => {
        setPosts(forumService.getAllPosts(selectedCategory));
    };

    const handleCreatePost = (title: string, content: string, category: string) => {
        forumService.createPost(title, content, category);
        loadPosts();
        setShowCreateModal(false);
    };

    const handleLike = (postId: string) => {
        forumService.toggleLike(postId);
        loadPosts();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">💬 Community Forum</h2>
                    <p className="text-slate-500">Share experiences and learn from others</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" /> New Post
                </button>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {FORUM_CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-2 ${selectedCategory === cat.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        <span>{cat.emoji}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        onLike={() => handleLike(post.id)}
                        onClick={() => setSelectedPost(post)}
                    />
                ))}

                {posts.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500">No posts in this category yet</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="mt-3 text-blue-600 font-medium hover:underline"
                        >
                            Be the first to post!
                        </button>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {showCreateModal && (
                <CreatePostModal
                    onSubmit={handleCreatePost}
                    onClose={() => setShowCreateModal(false)}
                />
            )}

            {/* Post Detail Modal */}
            {selectedPost && (
                <PostDetailModal
                    post={selectedPost}
                    onClose={() => setSelectedPost(null)}
                    onLike={() => handleLike(selectedPost.id)}
                />
            )}
        </div>
    );
};

// Post Card Component
const PostCard: React.FC<{
    post: ForumPost;
    onLike: () => void;
    onClick: () => void;
}> = ({ post, onLike, onClick }) => {
    const category = FORUM_CATEGORIES.find(c => c.id === post.category);

    return (
        <div
            className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
            onClick={onClick}
        >
            <div className="flex items-start gap-4">
                <div className="text-3xl">{post.userAvatar}</div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-slate-900">{post.userName}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sm text-slate-400">{forumService.formatDate(post.createdAt)}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 mb-2">{post.title}</h4>
                    <p className="text-slate-600 text-sm line-clamp-2">{post.content}</p>

                    {/* Category & Stats */}
                    <div className="flex items-center gap-4 mt-3">
                        {category && (
                            <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                                {category.emoji} {category.label}
                            </span>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onLike(); }}
                            className={`flex items-center gap-1 text-sm ${post.isLiked ? 'text-red-500' : 'text-slate-400 hover:text-red-500'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes}
                        </button>
                        <span className="flex items-center gap-1 text-sm text-slate-400">
                            <MessageCircle className="w-4 h-4" />
                            {post.commentCount}
                        </span>
                    </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
            </div>
        </div>
    );
};

// Create Post Modal
const CreatePostModal: React.FC<{
    onSubmit: (title: string, content: string, category: string) => void;
    onClose: () => void;
}> = ({ onSubmit, onClose }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('wellness');

    const handleSubmit = () => {
        if (!title.trim() || !content.trim()) return;
        onSubmit(title, content, category);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl animate-fade-in">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold">Create Post</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="What's your topic?"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                        >
                            {FORUM_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.emoji} {cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Share your thoughts, experiences, or questions..."
                            className="w-full p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none h-32"
                        />
                    </div>
                </div>

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!title.trim() || !content.trim()}
                        className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50"
                    >
                        Post
                    </button>
                </div>
            </div>
        </div>
    );
};

// Post Detail Modal
const PostDetailModal: React.FC<{
    post: ForumPost;
    onClose: () => void;
    onLike: () => void;
}> = ({ post, onClose, onLike }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const category = FORUM_CATEGORIES.find(c => c.id === post.category);

    useEffect(() => {
        setComments(forumService.getComments(post.id));
    }, [post.id]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        forumService.addComment(post.id, newComment);
        setComments(forumService.getComments(post.id));
        setNewComment('');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl animate-fade-in max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div className="flex items-start gap-4">
                        <div className="text-4xl">{post.userAvatar}</div>
                        <div>
                            <p className="font-semibold text-slate-900">{post.userName}</p>
                            <p className="text-sm text-slate-400">{forumService.formatDate(post.createdAt)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{post.title}</h3>
                    {category && (
                        <span className="inline-block px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 mb-4">
                            {category.emoji} {category.label}
                        </span>
                    )}
                    <p className="text-slate-600 whitespace-pre-wrap">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
                        <button
                            onClick={onLike}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${post.isLiked
                                    ? 'bg-red-50 text-red-500'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                            {post.likes} Likes
                        </button>
                        <span className="text-slate-400">
                            <MessageCircle className="w-5 h-5 inline mr-1" />
                            {comments.length} Comments
                        </span>
                    </div>

                    {/* Comments */}
                    <div className="mt-6">
                        <h4 className="font-bold text-slate-900 mb-4">Comments</h4>
                        <div className="space-y-4">
                            {comments.map(comment => (
                                <div key={comment.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl">
                                    <div className="text-2xl">{comment.userAvatar}</div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-slate-900">{comment.userName}</span>
                                            <span className="text-xs text-slate-400">
                                                {forumService.formatDate(comment.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-slate-600 text-sm">{comment.content}</p>
                                    </div>
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <p className="text-slate-400 text-center py-4">No comments yet. Be the first!</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-t border-slate-100">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Write a comment..."
                            className="flex-1 p-3 border border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommunityForum;
