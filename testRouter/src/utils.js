import { getUserAlbums, getAlbumPhotos, countAlbumPhotos, createAlbum as createAlbumUtil, deleteAlbum as deleteAlbumUtil } from "./api/albums";
import { addPhoto as addPhotoUtil, deletePhoto as deletePhotoUtil } from "./api/photos";
import { getUserPosts, createPost as createPostApi, deletePost as deletePostApi, getPostComments, addComment as addCommentApi, deleteComment as deleteCommentApi } from "./api/posts";

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
    await loadPhotos(album.id, 1, setPhotoState);
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
        await loadPhotos(albumState.selected.id, 1, setPhotoState);
    } catch (err) {
        setError("Failed to add photo: " + err.message);
    }
};

export const deletePhoto = async ( photoId, albumState, setPhotoState, setError ) => {
    if (!window.confirm("Are you sure you want to delete this photo?")) return;
    try {
        await deletePhotoUtil(photoId);
        await loadPhotos(albumState.selected.id, 1, setPhotoState);
    } catch (err) {
        setError("Failed to delete photo: " + err.message);
    }
};

export const loadMorePhotos = async ( albumState, photoState, setPhotoState ) => {
    await loadPhotos(albumState.selected.id, photoState.page + 1, setPhotoState, true);
};

export const getFilteredAlbums = ( albumState ) => {
    if (!albumState.searchTerm) return albumState.albums;
    return albumState.albums.filter(album =>
        album.title.toLowerCase().includes(albumState.searchTerm.toLowerCase()) ||
        album.id.toString().includes(albumState.searchTerm)
    );
};

const loadPhotos = async (albumId, page = 1, setPhotoState, append = false) => {
    try {
        const photosData = await getAlbumPhotos(albumId, page, 6);
        const totalCount = await countAlbumPhotos(albumId);
        
        if (page === 1 || !append) {
            setPhotoState((prev) => { return { ...prev, photos: photosData, page: page, total: totalCount } });
        } else {
            setPhotoState((prev) => { return { ...prev, photos: [...prev.photos, ...photosData], page: page, total: totalCount } } );
        }
    } catch (err) {
        console.error("Failed to load photos: " + err.message);
    }
};

export const loadPosts = async (setPostState, setError) => {
    try {
        setPostState(prev => ({ ...prev, loading: true }));
        const postsData = await getUserPosts();
        setPostState(prev => ({ ...prev, posts: postsData, error: null, loading: false }));
    } catch (err) {
        setError("Failed to load posts: " + err.message);
        setPostState(prev => ({ ...prev, loading: false }));
    }
};

export const createPost = async (e, postState, setPostState, setError) => {
    e.preventDefault();
    if (!postState.newPost.title.trim() || !postState.newPost.body.trim()) return;
    try {
        await createPostApi(postState.newPost);
        setPostState(prev => ({ ...prev, newPost: { title: "", body: "" }, showCreateForm: false }));
        loadPosts(setPostState, setError);
    } catch (err) {
        setError("Failed to create post: " + err.message);
    }
};

export const deletePost = async (postId, postState, setPostState, setCommentState, setError) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
        await deletePostApi(postId);
        loadPosts(setPostState, setError);
        if (postState.selected?.id === postId) {
            setPostState(prev => ({ ...prev, selected: null }));
            setCommentState(prev => ({ ...prev, show: false, comments: [] }));
        }
    } catch (err) {
        setError("Failed to delete post: " + err.message);
    }
};

export const selectPost = (post, username, navigate,) => {
    let url = `/users/${username}/posts/${post.id}`;
    navigate(url);
};

export const toggleComments = (post, username, postId, navigate, currentShowComments, setCommentState) => {
    // Toggle showComments in the URL
    let url = `/users/${username}/posts/${post.id}`;
    if (!currentShowComments || String(post.id) !== String(postId)) url += "?showComments=true";
    setCommentState(prev => ({ ...prev, show: !currentShowComments }));
    navigate(url);
};

export const loadComments = async (postId, setCommentState, setError) => {
    try {
        const commentsData = await getPostComments(postId);
        setCommentState(prev => ({ ...prev, comments: commentsData }));
    } catch (err) {
        setError("Failed to load comments: " + err.message);
    }
};

export const addComment = async (e, postState, commentState, setCommentState, setError) => {
    e.preventDefault();
    if (!commentState.newComment.trim()) return;
    try {
        await addCommentApi(postState.selected.id, { body: commentState.newComment.trim() });
        setCommentState(prev => ({ ...prev, newComment: "" }));
        await loadComments(postState.selected.id, setCommentState, setError);
    } catch (err) {
        setError("Failed to add comment: " + err.message);
    }
};

export const deleteComment = async (commentId, postState, setCommentState, setError) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
        await deleteCommentApi(commentId);
        await loadComments(postState.selected.id, setCommentState, setError);
    } catch (err) {
        setError("Failed to delete comment: " + err.message);
    }
};

export const getFilteredPosts = (postState) => {
    if (!postState.searchTerm) return postState.posts;
    return postState.posts.filter(post =>
        post.title.toLowerCase().includes(postState.searchTerm.toLowerCase()) ||
        post.body.toLowerCase().includes(postState.searchTerm.toLowerCase()) ||
        post.id.toString().includes(postState.searchTerm)
    );
};