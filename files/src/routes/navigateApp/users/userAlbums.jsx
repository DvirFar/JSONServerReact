import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../../api/auth";
import { loadAlbums, createAlbum, deleteAlbum, selectAlbum, addPhoto, deletePhoto, loadMorePhotos, getFilteredAlbums } from "../../../utils"

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

        handleLoadAlbums();
    }, [username, navigate]);

    const handleLoadAlbums = async () => { 
        await loadAlbums(setLoading, setAlbumState, setError);
    };

    const handleCreateAlbum = async (e) => { 
        await createAlbum(e, albumState, setAlbumState, setError);
        // Reload albums after creating
        await loadAlbums(setLoading, setAlbumState, setError);
    };

    const handleDeleteAlbum = async (albumId) => { 
        await deleteAlbum(albumId, albumState, setAlbumState, setPhotoState, setError);
        // Reload albums after deleting
        await loadAlbums(setLoading, setAlbumState, setError);
    };

    const handleSelectAlbum = async (album) => { 
        await selectAlbum(album, setAlbumState, setPhotoState);
    };

    const handleAddPhoto = async (e) => { 
        await addPhoto(e, albumState, photoState, setPhotoState, setError);
    };

    const handleDeletePhoto = async (photoId) => { 
        await deletePhoto(photoId, albumState, setPhotoState, setError);
    };

    const handleLoadMorePhotos = async () => { 
        await loadMorePhotos(albumState, photoState, setPhotoState);
    };

    const handleGetFilteredAlbums = () => { 
        return getFilteredAlbums(albumState);
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

    const filteredAlbums = handleGetFilteredAlbums();
    const hasMorePhotos = photoState.photos.length < photoState.total;

    return (
        <div className="albums-container">
            <div className="albums-header">
                <h1>My Albums</h1>
                <div className="header-buttons">
                    <button onClick={() => setAlbumState(prev => ({ ...prev, showCreateForm: !prev.showCreateForm }) )} className="create-btn">
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
                  onChange={(e) => setAlbumState(prev => ({ ...prev, newTitle: e.target.value }) ) }
                  onCancel={() => setAlbumState(prev => ({ ...prev, showCreateForm: false }) ) }
                />
            )}

            {/* Search */}
            <div className="albums-controls">
                <input
                    type="text"
                    placeholder="Search albums..."
                    value={albumState.searchTerm}
                    onChange={(e) => setAlbumState(prev => ({ ...prev, searchTerm: e.target.value }) ) }
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
                                onClick={() => setPhotoState(prev => ({ ...prev, showAddForm: !prev.showAddForm }) ) }
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
                              onChange={(photo) => setPhotoState(prev => ({ ...prev, newPhoto: photo}) ) }
                              onCancel={() => setPhotoState(prev => ({ ...prev, showAddForm: false }) ) }
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