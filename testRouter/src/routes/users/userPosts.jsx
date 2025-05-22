import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import { getUserPosts, createPost, deletePost, getPostComments, addComment, deleteComment } from "../../api/posts";
import "./userPosts.css";

export default function UserPosts() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPost, setNewPost] = useState({ title: "", body: "" });
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        if (currentUser.username !== username) {
            setError("Access denied: You can only view your own posts");
            setLoading(false);
            return;
        }

        loadPosts();
    }, [username, navigate]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            const postsData = await getUserPosts();
            setPosts(postsData);
            setError(null);
        } catch (err) {
            setError("Failed to load posts: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadComments = async (postId) => {
        try {
            const commentsData = await getPostComments(postId);
            setComments(commentsData);
        } catch (err) {
            setError("Failed to load comments: " + err.message);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.title.trim() || !newPost.body.trim()) return;

        try {
            await createPost(newPost);
            setNewPost({ title: "", body: "" });
            setShowCreateForm(false);
            loadPosts();
        } catch (err) {
            setError("Failed to create post: " + err.message);
        }
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;

        try {
            await deletePost(postId);
            loadPosts();
            if (selectedPost && selectedPost.id === postId) {
                setSelectedPost(null);
                setShowComments(false);
            }
        } catch (err) {
            setError("Failed to delete post: " + err.message);
        }
    };

    const handleSelectPost = (post) => {
        setSelectedPost(post);
        setShowComments(false);
    };

    const handleShowComments = async (post) => {
        setSelectedPost(post);
        setShowComments(true);
        await loadComments(post.id);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await addComment(selectedPost.id, { body: newComment.trim() });
            setNewComment("");
            await loadComments(selectedPost.id);
        } catch (err) {
            setError("Failed to add comment: " + err.message);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            await deleteComment(commentId);
            await loadComments(selectedPost.id);
        } catch (err) {
            setError("Failed to delete comment: " + err.message);
        }
    };

    const getFilteredPosts = () => {
        if (!searchTerm) return posts;
        return posts.filter(post =>
            post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.body.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.id.toString().includes(searchTerm)
        );
    };

    if (loading) {
        return <div className="posts-container"><p>Loading posts...</p></div>;
    }

    if (error && !posts.length) {
        return (
            <div className="posts-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        );
    }

    const filteredPosts = getFilteredPosts();

    return (
        <div className="posts-container">
            <div className="posts-header">
                <h1>My Posts</h1>
                <div className="header-buttons">
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-btn">
                        {showCreateForm ? "Cancel" : "Create Post"}
                    </button>
                    <button onClick={() => navigate("/home")} className="back-btn">Back to Home</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Create post form */}
            {showCreateForm && (
                <form onSubmit={handleCreatePost} className="create-post-form">
                    <h3>Create New Post</h3>
                    <input
                        type="text"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        placeholder="Post title..."
                        required
                    />
                    <textarea
                        value={newPost.body}
                        onChange={(e) => setNewPost({...newPost, body: e.target.value})}
                        placeholder="Post content..."
                        rows={4}
                        required
                    />
                    <div className="form-buttons">
                        <button type="submit">Create Post</button>
                        <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {/* Search */}
            <div className="posts-controls">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="posts-layout">
                {/* Posts list */}
                <div className="posts-list">
                    <h2>Posts Overview ({filteredPosts.length})</h2>
                    {filteredPosts.length === 0 ? (
                        <p className="no-posts">No posts found</p>
                    ) : (
                        filteredPosts.map(post => (
                            <div key={post.id} className={`post-item ${selectedPost?.id === post.id ? 'selected' : ''}`}>
                                <div className="post-header">
                                    <span className="post-id">#{post.id}</span>
                                    <h3 onClick={() => handleSelectPost(post)}>{post.title}</h3>
                                </div>
                                <div className="post-actions">
                                    <button onClick={() => handleSelectPost(post)}>View</button>
                                    <button onClick={() => handleShowComments(post)}>Comments</button>
                                    <button onClick={() => handleDeletePost(post.id)} className="delete-btn">Delete</button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Selected post details */}
                <div className="post-details">
                    {selectedPost ? (
                        <div>
                            <h2>Post Details</h2>
                            <div className="selected-post">
                                <div className="post-content">
                                    <h3 dir="rtl">{selectedPost.title}</h3>
                                    <p dir="rtl">{selectedPost.body}</p>
                                    <div className="post-meta">
                                        <span>Post ID: #{selectedPost.id}</span>
                                    </div>
                                </div>
                                
                                {showComments && (
                                    <div className="comments-section">
                                        <h4>Comments ({comments.length})</h4>
                                        
                                        {/* Add comment form */}
                                        <form onSubmit={handleAddComment} className="add-comment-form">
                                            <textarea
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                placeholder="Add a comment..."
                                                rows={3}
                                                required
                                            />
                                            <button type="submit">Add Comment</button>
                                        </form>

                                        {/* Comments list */}
                                        <div className="comments-list">
                                            {comments.length === 0 ? (
                                                <p className="no-comments">No comments yet</p>
                                            ) : (
                                                comments.map(comment => (
                                                    <div key={comment.id} className="comment-item">
                                                        <div className="comment-header" dir="rtl">
                                                            <strong>{comment.name}</strong> 
                                                            <span className="comment-email">({comment.email})</span>
                                                        </div>
                                                        <p dir="rtl">{comment.body}</p>
                                                        {comment.email === getCurrentUser()?.email && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment.id)}
                                                                className="delete-comment-btn"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="no-selection">
                            <p>Select a post to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}