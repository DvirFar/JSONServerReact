

export default function AddCommentForm({ onSubmit, value, onChange }) {
    return (
        <form onSubmit={onSubmit} className="add-comment-form">
            <textarea
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                required
            />
            <button type="submit">Add Comment</button>
        </form>
    );
}