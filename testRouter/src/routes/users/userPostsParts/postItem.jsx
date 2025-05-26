

export default function PostItem({ post, selected, onSelect, onShowComments, onDelete }) {
    return (
        <div className={`post-item ${selected ? 'selected' : ''}`}>
            <div className="post-header">
                <span className="post-id">#{post.id}</span>
                <h3 onClick={() => onSelect(post)}>{post.title}</h3>
            </div>
            <div className="post-actions">
                <button onClick={() => onSelect(post)}>View</button>
                <button onClick={() => onShowComments(post)}>Comments</button>
                <button onClick={() => onDelete(post.id)} className="delete-btn">Delete</button>
            </div>
        </div>
    );
}