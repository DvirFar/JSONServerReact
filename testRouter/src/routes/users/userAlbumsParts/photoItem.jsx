import { useState } from 'react';

export default function PhotoItem({ photo, onDelete }) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = (e) => {
        setImageError(true);
        // Use a reliable placeholder service
        e.target.src = `https://picsum.photos/300/300?random=${photo.id}`;
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
    };

    const getImageSrc = () => {
        if (imageError) {
            return `https://picsum.photos/300/300?random=${photo.id}`;
        }
        
        // Try to use the original URL, but if it's a via.placeholder.com URL, 
        // replace it with picsum which is more reliable
        let imageUrl = photo.thumbnailUrl || photo.url;
        
        if (imageUrl && imageUrl.includes('via.placeholder.com')) {
            return `https://picsum.photos/300/300?random=${photo.id}`;
        }
        
        return imageUrl || `https://picsum.photos/300/300?random=${photo.id}`;
    };

    return (
        <div className="photo-item">
            <div style={{ 
                position: 'relative', 
                width: '100%', 
                height: '100%',
                background: imageLoaded ? 'transparent' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {!imageLoaded && (
                    <div style={{
                        position: 'absolute',
                        color: '#999',
                        fontSize: '0.9rem',
                        zIndex: 1
                    }}>
                        Loading...
                    </div>
                )}
                <img 
                    src={getImageSrc()}
                    alt={photo.title || 'Photo'}
                    onError={handleImageError}
                    onLoad={handleImageLoad}
                    style={{
                        opacity: imageLoaded ? 1 : 0,
                        transition: 'opacity 0.3s ease'
                    }}
                />
            </div>
            <div className="photo-overlay">
                <h4>{photo.title || 'Untitled Photo'}</h4>
                <div className="photo-actions">
                    <a 
                        href={photo.url || getImageSrc()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                    >
                        View Full
                    </a>
                    <button 
                        onClick={() => onDelete(photo.id)} 
                        className="delete-photo-btn"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}