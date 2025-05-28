

export default function AddPhotoForm({ onSubmit, newPhoto, onChange, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="add-photo-form">
            <input
                type="text"
                value={newPhoto.title}
                onChange={e => onChange({ ...newPhoto, title: e.target.value })}
                placeholder="Photo title..."
                required
            />
            <input
                type="url"
                value={newPhoto.url}
                onChange={e => onChange({ ...newPhoto, url: e.target.value })}
                placeholder="Photo URL..."
                required
            />
            <div className="form-buttons">
                <button type="submit">Add Photo</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}