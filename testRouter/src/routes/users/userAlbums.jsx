import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import { getUserAlbums, createAlbum, deleteAlbum, getAlbumPhotos, countAlbumPhotos } from "../../api/albums";
import { addPhoto, deletePhoto } from "../../api/photos";
import "./userAlbums.css";

export default function UserAlbums() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [albums, setAlbums] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newAlbumTitle, setNewAlbumTitle] = useState("");
    const [showAddPhotoForm, setShowAddPhotoForm] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ title: "", url: "" });
    const [photosPage, setPhotosPage] = useState(1);
    const [photosPerPage] = useState(6);
    const [totalPhotos, setTotalPhotos] = useState(0);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        if (currentUser.username !== username) {
            setError("Access denied: You can only view your own albums");
            setLoading(false);
            return;
        }

        loadAlbums();
    }, [username, navigate]);

    const loadAlbums = async () => {
        try {
            setLoading(true);
            const albumsData = await getUserAlbums();
            setAlbums(albumsData);
            setError(null);
        } catch (err) {
            setError("Failed to load albums: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async (albumId, page = 1) => {
        try {
            const photosData = await getAlbumPhotos(albumId, page, photosPerPage);
            const totalCount = await countAlbumPhotos(albumId);
            
            if (page === 1) {
                setPhotos(photosData);
            } else {
                setPhotos(prev => [...prev, ...photosData]);
            }
            
            setTotalPhotos(totalCount);
            setPhotosPage(page);
        } catch (err) {
            setError("Failed to load photos: " + err.message);
        }
    };

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) return;

        try {
            await createAlbum({ title: newAlbumTitle.trim() });
            setNewAlbumTitle("");
            setShowCreateForm(false);
            loadAlbums();
        } catch (err) {
            setError("Failed to create album: " + err.message);
        }
    };

    const handleDeleteAlbum = async (albumId) => {
        if (!window.confirm("Are you sure you want to delete this album and all its photos?")) return;

        try {
            await deleteAlbum(albumId);
            loadAlbums();
            if (selectedAlbum && selectedAlbum.id === albumId) {
                setSelectedAlbum(null);
                setPhotos([]);
            }
        } catch (err) {
            setError("Failed to delete album: " + err.message);
        }
    };

    const handleSelectAlbum = async (album) => {
        setSelectedAlbum(album);
        setPhotos([]);
        setPhotosPage(1);
        await loadPhotos(album.id);
    };

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!newPhoto.title.trim() || !newPhoto.url.trim()) return;

        try {
            await addPhoto(selectedAlbum.id, {
                title: newPhoto.title.trim(),
                url: newPhoto.url.trim(),
                thumbnailUrl: newPhoto.url.trim()
            });
            setNewPhoto({ title: "", url: "" });
            setShowAddPhotoForm(false);
            await loadPhotos(selectedAlbum.id);
        } catch (err) {
            setError("Failed to add photo: " + err.message);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        try {
            await deletePhoto(photoId);
            await loadPhotos(selectedAlbum.id);
        } catch (err) {
            setError("Failed to delete photo: " + err.message);
        }
    };

    const handleLoadMorePhotos = async () => {
        await loadPhotos(selectedAlbum.id, photosPage + 1);
    };

    const getFilteredAlbums = () => {
        if (!searchTerm) return albums;
        return albums.filter(album =>
            album.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            album.id.toString().includes(searchTerm)
        );
    };

    if (loading) {
        return <div className="albums-container"><p>Loading albums...</p></div>;
    }

    if (error && !albums.length) {
        return (
            <div className="albums-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        );
    }

    const filteredAlbums = getFilteredAlbums();
    const hasMorePhotos = photos.length < totalPhotos;

    return (
        <div className="albums-container">
            <div className="albums-header">
                <h1>My Albums</h1>
                <div className="header-buttons">
                    <button onClick={() => setShowCreateForm(!showCreateForm)} className="create-btn">
                        {showCreateForm ? "Cancel" : "Create Album"}
                    </button>
                    <button onClick={() => navigate("/home")} className="back-btn">Back to Home</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Create album form */}
            {showCreateForm && (
                <form onSubmit={handleCreateAlbum} className="create-album-form">
                    <h3>Create New Album</h3>
                    <input
                        type="text"
                        value={newAlbumTitle}
                        onChange={(e) => setNewAlbumTitle(e.target.value)}
                        placeholder="Album title..."
                        required
                    />
                    <div className="form-buttons">
                        <button type="submit">Create Album</button>
                        <button type="button" onClick={() => setShowCreateForm(false)}>Cancel</button>
                    </div>
                </form>
            )}

            {/* Search */}
            <div className="albums-controls">
                <input
                    type="text"
                    placeholder="Search albums..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
            </div>

            <div className="albums-layout">
                {/* Albums overview */}
                <div className="albums-overview">
                    <h2>Albums Overview ({filteredAlbums.length})</h2>
                    {filteredAlbums.length === 0 ? (
                        <p className="no-albums">No albums found</p>
                    ) : (
                        <div className="albums-grid">
                            {filteredAlbums.map(album => (
                                <div key={album.id} className={`album-card ${selectedAlbum?.id === album.id ? 'selected' : ''}`}>
                                    <div className="album-header">
                                        <span className="album-id">#{album.id}</span>
                                        <h3 onClick={() => handleSelectAlbum(album)}>{album.title}</h3>
                                    </div>
                                    <div className="album-actions">
                                        <button onClick={() => handleSelectAlbum(album)}>View Photos</button>
                                        <button onClick={() => handleDeleteAlbum(album.id)} className="delete-btn">Delete</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected album photos */}
                {selectedAlbum && (
                    <div className="album-photos">
                        <div className="photos-header">
                            <h2>{selectedAlbum.title}</h2>
                            <button 
                                onClick={() => setShowAddPhotoForm(!showAddPhotoForm)} 
                                className="add-photo-btn"
                            >
                                {showAddPhotoForm ? "Cancel" : "Add Photo"}
                            </button>
                        </div>

                        {/* Add photo form */}
                        {showAddPhotoForm && (
                            <form onSubmit={handleAddPhoto} className="add-photo-form">
                                <input
                                    type="text"
                                    value={newPhoto.title}
                                    onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                                    placeholder="Photo title..."
                                    required
                                />
                                <input
                                    type="url"
                                    value={newPhoto.url}
                                    onChange={(e) => setNewPhoto({...newPhoto, url: e.target.value})}
                                    placeholder="Photo URL..."
                                    required
                                />
                                <div className="form-buttons">
                                    <button type="submit">Add Photo</button>
                                    <button type="button" onClick={() => setShowAddPhotoForm(false)}>Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="photos-info">
                            <p>Showing {photos.length} of {totalPhotos} photos</p>
                        </div>

                        {/* Photos grid */}
                        <div className="photos-grid">
                            {photos.map(photo => (
                                <div key={photo.id} className="photo-item">
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
                                            <button onClick={() => handleDeletePhoto(photo.id)} className="delete-photo-btn">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Load more button */}
                        {hasMorePhotos && (
                            <div className="load-more">
                                <button onClick={handleLoadMorePhotos} className="load-more-btn">
                                    Load More Photos
                                </button>
                            </div>
                        )}

                        {photos.length === 0 && (
                            <p className="no-photos">No photos in this album</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}