import { getUserAlbums, getAlbumPhotos, countAlbumPhotos, createAlbum as createAlbumUtil, deleteAlbum as deleteAlbumUtil } from "./api/albums";
import { addPhoto as addPhotoUtil, deletePhoto as deletePhotoUtil } from "./api/photos";

export function userLogged(userData) {
  localStorage.setItem("loggedUser", JSON.stringify(userData));
}

export const loadAlbums = async ( setLoading, setAlbumState, setError ) => {
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

export const createAlbum = async ( e, albumState, setAlbumState, setError ) => {
        e.preventDefault();
        if (!albumState.newTitle.trim()) return;

        try {
            await createAlbumUtil({ title: albumState.newTitle.trim() });
            setAlbumState(prev => { return { ...prev, newTitle: "", showCreateForm: false } } );
            loadAlbums();
        } catch (err) {
            setError("Failed to create album: " + err.message);
        }
    };

export const deleteAlbum = async ( albumId, albumState, setAlbumState, setPhotoState, setError ) => {
    if (!window.confirm("Are you sure you want to delete this album and all its photos?")) return;
    try {
        await deleteAlbumUtil(albumId);
        loadAlbums();
        if (albumState.selected?.id === albumId) {
            setAlbumState(prev => { return { ...prev, selected: null } } );
            setPhotoState(prev => { return { ...prev, photos: [] } } );
        }
    } catch (err) {
        setError("Failed to delete album: " + err.message);
    }
};

export const selectAlbum = async ( album, setAlbumState, setPhotoState ) => {
    setAlbumState(prev => { return { ...prev, selected: album } } );
    setPhotoState(prev => { return { ...prev, photos: [], page: 1 } } );
    await loadPhotos(album.id);
};

export const addPhoto = async ( e, albumState, photoState, setPhotoState, setError ) => {
    e.preventDefault();
    if (!photoState.newPhoto.title.trim() || !photoState.newPhoto.url.trim()) return;
    try {
        await addPhotoUtil(albumState.selected.id, {
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

export const deletePhoto = async ( photoId, albumState, setError ) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
        await deletePhotoUtil(photoId);
        await loadPhotos(albumState.selected.id);
    } catch (err) {
        setError("Failed to delete photo: " + err.message);
    }
};

export const loadMorePhotos = async ( albumState, photoState ) => {
    await loadPhotos(albumState.selected.id, photoState.page + 1);
};

export const getFilteredAlbums = ( albumState ) => {
    if (!albumState.searchTerm) return albumState.albums;
    return albumState.albums.filter(album =>
        album.title.toLowerCase().includes(albumState.searchTerm.toLowerCase()) ||
        album.id.toString().includes(albumState.searchTerm)
    );
};

const loadPhotos = async (albumId, page = 1, photoState, setPhotoState, setError ) => {
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
