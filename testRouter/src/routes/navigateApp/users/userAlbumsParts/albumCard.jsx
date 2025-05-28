

export default function AlbumCard({ album, selected, onSelect, onDelete }) {
    return (
        <div className={`album-card ${selected ? 'selected' : ''}`}>
            <div className="album-header">
                <span className="album-id">#{album.id}</span>
                <h3 onClick={() => onSelect(album)}>{album.title}</h3>
            </div>
            <div className="album-actions">
                <button onClick={() => onSelect(album)}>View Photos</button>
                <button onClick={() => onDelete(album.id)} className="delete-btn">Delete</button>
            </div>
        </div>
    );
}