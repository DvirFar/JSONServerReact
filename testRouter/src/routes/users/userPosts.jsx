import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import {
    loadPosts,
    createPost,
    deletePost,
    selectPost,
    toggleComments,
    addComment,
    deleteComment,
    getFilteredPosts,
    loadComments,
} from "../../utils";
import "./userPosts.css";
import PostItem from "./userPostsParts/PostItem";
import CreatePostForm from "./userPostsParts/createPostForm";
import CommentItem from "./userPostsParts/commentItem";
import AddCommentForm from "./userPostsParts/addCommentForm";


export default function UserPosts() {
    const { username, postId } = useParams();
    const [ searchParams ] = useSearchParams();

    const navigate = useNavigate();
    const [postState, setPostState] = useState({
        posts: [],
        selected: null,
        searchTerm: "",
        showCreateForm: false,
        newPost: { title: "", body: "" },
        loading: true,
    });
    const [commentState, setCommentState] = useState({
        comments: [],
        show: searchParams.get("showComments") === "true",
        newComment: "",
    });
    const [error, setError] = useState(null);

    async function loadPostsAsync() {
        await loadPosts(setPostState, setError);
    }

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        if (currentUser.username !== username) {
            setError("Access denied: You can only view your own posts");
            setPostState(prev => ({ ...prev, loading: false }));
            return;
        }
        loadPostsAsync();
    }, [username, navigate]);

    useEffect(() => {
        if (!postState.loading && postId) {
            const found = postState.posts.find((post) => String(post.id) === String(postId));
            setPostState(prev => ({ ...prev, selected: found || null }));
        } else if (!postId) {
            setPostState(prev => ({ ...prev, selected: null }));
        }
    }, [postId, postState.posts, postState.loading]);

    useEffect(() => {
        if (commentState.show) {
            loadComments(postId, setCommentState, setError);
        }
    }, [postId, commentState.show])

    if (postState.loading) {
        return <div className="posts-container"><p>Loading posts...</p></div>;
    }

    if (error && !postState.posts.length) {
        return (
            <div className="posts-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        );
    }

    const filteredPosts = getFilteredPosts(postState);
    const currentUser = getCurrentUser();

    return (
        <div className="posts-container">
            <div className="posts-header">
                <h1>My Posts</h1>
                <div className="header-buttons">
                    <button onClick={() => setPostState(prev => ({ ...prev, showCreateForm: !prev.showCreateForm }))} className="create-btn">
                        {postState.showCreateForm ? "Cancel" : "Create Post"}
                    </button>
                    <button onClick={() => navigate("/home")} className="back-btn">Back to Home</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Create post form */}
            {postState.showCreateForm && (
                <CreatePostForm
                    onSubmit={e => createPost(e, postState, setPostState, setError)}
                    value={postState.newPost}
                    onChange={val => setPostState(prev => ({ ...prev, newPost: val }))}
                    onCancel={() => setPostState(prev => ({ ...prev, showCreateForm: false }))}
                />
            )}

            {/* Search */}
            <div className="posts-controls">
                <input
                    type="text"
                    placeholder="Search posts..."
                    value={postState.searchTerm}
                    onChange={e => setPostState(prev => ({ ...prev, searchTerm: e.target.value }))}
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
                            <PostItem
                                key={post.id}
                                post={post}
                                selected={postState.selected?.id === post.id}
                                onSelect={p => selectPost(p, username, navigate, false)}
                                onShowComments={p => toggleComments(p, username, postId, navigate, commentState.show, setCommentState)}
                                onDelete={id => deletePost(id, postState, setPostState, setCommentState, setError)}
                            />
                        ))
                    )}
                </div>

                {/* Selected post details */}
                <div className="post-details">
                    {postState.selected ? (
                        <div>
                            <h2>Post Details</h2>
                            <div className="selected-post">
                                <div className="post-content">
                                    <h3 dir="rtl">{postState.selected.title}</h3>
                                    <p dir="rtl">{postState.selected.body}</p>
                                    <div className="post-meta">
                                        <span>Post ID: #{postState.selected.id}</span>
                                    </div>
                                </div>
                                {commentState.show && (
                                    <div className="comments-section">
                                        <h4>Comments ({commentState.comments.length})</h4>
                                        <AddCommentForm
                                            onSubmit={e => addComment(e, postState, commentState, setCommentState, setError)}
                                            value={commentState.newComment}
                                            onChange={val => setCommentState(prev => ({ ...prev, newComment: val }))}
                                        />
                                        <div className="comments-list">
                                            {commentState.comments.length === 0 ? (
                                                <p className="no-comments">No comments yet</p>
                                            ) : (
                                                commentState.comments.map(comment => (
                                                    <CommentItem
                                                        key={comment.id}
                                                        comment={comment}
                                                        canDelete={comment.email === currentUser?.email}
                                                        onDelete={id => deleteComment(id, postState, setCommentState, setError)}
                                                    />
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