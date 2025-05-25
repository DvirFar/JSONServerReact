import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../api/auth";
import { getUserAlbums, createAlbum, deleteAlbum, getAlbumPhotos, countAlbumPhotos } from "../../api/albums";
import { addPhoto, deletePhoto } from "../../api/photos";
import "./userAlbums.css";
import AlbumCard from "./userAlbumsParts/AlbumCard";
import PhotoItem from "./userAlbumsParts/photoItem";
import CreateAlbumForm from "./userAlbumsParts/createAlbumForm";
import AddPhotoForm from "./userAlbumsParts/addPhotoForm";

export default function UserAlbums() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [ albumState, setAlbumState ] = useState({
        albums: [],
        selected: null,
        searchTerm: "",
        showCreateForm: false,
        newTitle: "",
    });
    const [ photoState, setPhotoState ] = useState({
        photos: [],
        showAddForm: false,
        newPhoto: { title: "", url: "" },
        page: 1,
        perPage: 6,
        total: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            setAlbumState((prev) => { return { ...prev, albums: albumsData} });
            setError(null);
        } catch (err) {
            setError("Failed to load albums: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadPhotos = async (albumId, page = 1) => {
        try {
            const photosData = await getAlbumPhotos(albumId, page, photoState.perPage);
            const totalCount = await countAlbumPhotos(albumId);
            
            if (page === 1) {
                setPhotoState((prev) => { return { ...prev, photos: photosData } });
            } else {
                setPhotoState((prev) => { return { ...prev, photos: [...prev.photos, photosData] } });
            }
            
            setPhotoState((prev) => { return { ...prev, page: page, total: totalCount } } );
        } catch (err) {
            setError("Failed to load photos: " + err.message);
        }
    };

    const handleCreateAlbum = async (e) => {
        e.preventDefault();
        if (!albumState.newTitle.trim()) return;

        try {
            await createAlbum({ title: albumState.newTitle.trim() });
            setAlbumState(prev => { return { ...prev, newTitle: "", showCreateForm: false } } );
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
            if (albumState.selected?.id === albumId) {
                setAlbumState(prev => { return { ...prev, selected: null } } );
                setPhotoState(prev => { return { ...prev, photos: [] } } );
            }
        } catch (err) {
            setError("Failed to delete album: " + err.message);
        }
    };

    const handleSelectAlbum = async (album) => {
        setAlbumState(prev => { return { ...prev, selected: album } } );
        setPhotoState(prev => { return { ...prev, photos: [], page: 1 } } );
        await loadPhotos(album.id);
    };

    const handleAddPhoto = async (e) => {
        e.preventDefault();
        if (!photoState.newPhoto.title.trim() || !photoState.newPhoto.url.trim()) return;

        try {
            await addPhoto(albumState.selected.id, {
                title: photoState.newPhoto.title.trim(),
                url: photoState.newPhoto.url.trim(),
                thumbnailUrl: photoState.newPhoto.url.trim()
            });
            setPhotoState(prev => { return { ...prev, newPhoto: { title: "", url: ""}, showAddForm: false } } );
            await loadPhotos(albumState.selected.id);
        } catch (err) {
            setError("Failed to add photo: " + err.message);
        }
    };

    const handleDeletePhoto = async (photoId) => {
        if (!window.confirm("Are you sure you want to delete this photo?")) return;

        try {
            await deletePhoto(photoId);
            await loadPhotos(albumState.selected.id);
        } catch (err) {
            setError("Failed to delete photo: " + err.message);
        }
    };

    const handleLoadMorePhotos = async () => {
        await loadPhotos(albumState.selected.id, photoState.page + 1);
    };

    const getFilteredAlbums = () => {
        if (!albumState.searchTerm) return albumState.albums;
        return albumState.albums.filter(album =>
            album.title.toLowerCase().includes(albumState.searchTerm.toLowerCase()) ||
            album.id.toString().includes(albumState.searchTerm)
        );
    };

    if (loading) {
        return <div className="albums-container"><p>Loading albums...</p></div>;
    }

    if (error && !albumState.albums.length) {
        return (
            <div className="albums-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        );
    }

    const filteredAlbums = getFilteredAlbums();
    const hasMorePhotos = photoState.photos.length < photoState.total;

    return (
        <div className="albums-container">
            <div className="albums-header">
                <h1>My Albums</h1>
                <div className="header-buttons">
                    <button onClick={() => setAlbumState(prev => { return { ...prev, showCreateForm: !prev.showCreateForm } } )} className="create-btn">
                        {albumState.showCreateForm ? "Cancel" : "Create Album"}
                    </button>
                    <button onClick={() => navigate("/home")} className="back-btn">Back to Home</button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Create album form */}
            {albumState.showCreateForm && (
                <CreateAlbumForm 
                  onSubmit={handleCreateAlbum}
                  value={albumState.newTitle}
                  onChange={(e) => setAlbumState(prev => { return { ...prev, newTitle: e.target.value } } ) }
                  onCancel={() => setAlbumState(prev => { return { ...prev, showCreateForm: false } } ) }
                />
            )}

            {/* Search */}
            <div className="albums-controls">
                <input
                    type="text"
                    placeholder="Search albums..."
                    value={albumState.searchTerm}
                    onChange={(e) => setAlbumState(prev => { return { ...prev, searchTerm: e.target.value } } ) }
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
                                <AlbumCard
                                  key={album.id}
                                  album={album}
                                  selected={albumState.selected?.id == album.id}
                                  onSelect={handleSelectAlbum}
                                  onDelete={handleDeleteAlbum} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Selected album photos */}
                {albumState.selected && (
                    <div className="album-photos">
                        <div className="photos-header">
                            <h2>{albumState.selected.title}</h2>
                            <button 
                                onClick={() => setPhotoState(prev => { return { ...prev, showAddForm: !prev.showAddPhotoForm } } ) }
                                className="add-photo-btn"
                            >
                                {photoState.showAddForm ? "Cancel" : "Add Photo"}
                            </button>
                        </div>

                        {/* Add photo form */}
                        {photoState.showAddForm && (
                            <AddPhotoForm 
                              onSubmit={handleAddPhoto}
                              newPhoto={photoState.newPhoto}
                              onChange={(photo) => setPhotoState(prev => { return { ...prev, newPhoto: photo} } ) }
                              onCancel={() => setPhotoState(prev => { return { ...prev, showAddForm: false } } ) }
                            />
                        )}

                        <div className="photos-info">
                            <p>Showing {photoState.photos.length} of {photoState.total} photos</p>
                        </div>

                        {/* Photos grid */}
                        <div className="photos-grid">
                            {photoState.photos.map(photo => (
                                <PhotoItem 
                                  key={photo.id}
                                  photo={photo}
                                  onDelete={handleDeletePhoto}
                                />
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

                        {photoState.photos.length === 0 && (
                            <p className="no-photos">No photos in this album</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}