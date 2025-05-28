

export default function CreatePostForm({ onSubmit, value, onChange, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="create-post-form">
            <h3>Create New Post</h3>
            <input
                type="text"
                value={value.title}
                onChange={e => onChange({ ...value, title: e.target.value })}
                placeholder="Post title..."
                required
            />
            <textarea
                value={value.body}
                onChange={e => onChange({ ...value, body: e.target.value })}
                placeholder="Post content..."
                rows={4}
                required
            />
            <div className="form-buttons">
                <button type="submit">Create Post</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}