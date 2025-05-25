

export default function PhotoItem({ photo, onDelete }) {
    return (
        <div className="photo-item">
            <img 
                src={photo.thumbnailUrl} 
                alt={photo.title}
                onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x150?text=No+Image';
                }}
            />
            <div className="photo-overlay">
                <h4>{photo.title}</h4>
                <div className="photo-actions">
                    <a href={photo.url} target="_blank" rel="noopener noreferrer">View Full</a>
                    <button onClick={() => onDelete(photo.id)} className="delete-photo-btn">Delete</button>
                </div>
            </div>
        </div>
    );
}