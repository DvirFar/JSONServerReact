

export default function CommentItem({ comment, canDelete, onDelete }) {
    return (
        <div className="comment-item">
            <div className="comment-header" dir="rtl">
                <strong>{comment.name}</strong>
                <span className="comment-email">({comment.email})</span>
            </div>
            <p dir="rtl">{comment.body}</p>
            {canDelete && (
                <button onClick={() => onDelete(comment.id)} className="delete-comment-btn">Delete</button>
            )}
        </div>
    );
}