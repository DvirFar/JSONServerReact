

export default function CreateAlbumForm({ onSubmit, value, onChange, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="create-album-form">
            <h3>Create New Album</h3>
            <input
                type="text"
                value={value}
                onChange={onChange}
                placeholder="Album title..."
                required
            />
            <div className="form-buttons">
                <button type="submit">Create Album</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}