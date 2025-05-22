import { apiRequest } from './config';
import { getCurrentUser } from './auth';

// Get all albums for current user
export async function getUserAlbums() {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Get albums for the current user
    const albums = await apiRequest(`albums?userId=${user.id}`);
    return albums;
  } catch (error) {
    console.error('Error fetching albums:', error);
    throw error;
  }
}

// Get a single album by ID
export async function getAlbum(id) {
  try {
    const album = await apiRequest(`albums/${id}`);
    return album;
  } catch (error) {
    console.error(`Error fetching album ${id}:`, error);
    throw error;
  }
}

// Create a new album
export async function createAlbum(albumData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    const newAlbum = {
      userId: user.id,
      title: albumData.title,
    };
    
    const createdAlbum = await apiRequest('albums', 'POST', newAlbum);
    return createdAlbum;
  } catch (error) {
    console.error('Error creating album:', error);
    throw error;
  }
}

// Update an album
export async function updateAlbum(id, albumData) {
  try {
    // First fetch the existing album to make sure it exists
    const existingAlbum = await getAlbum(id);
    
    // Check if the album belongs to the current user
    const user = getCurrentUser();
    if (!user || existingAlbum.userId !== user.id) {
      throw new Error('You do not have permission to update this album');
    }
    
    const updatedAlbum = await apiRequest(`albums/${id}`, 'PATCH', albumData);
    return updatedAlbum;
  } catch (error) {
    console.error(`Error updating album ${id}:`, error);
    throw error;
  }
}

// Delete an album
export async function deleteAlbum(id) {
  try {
    // First fetch the existing album to make sure it exists
    const existingAlbum = await getAlbum(id);
    
    // Check if the album belongs to the current user
    const user = getCurrentUser();
    if (!user || existingAlbum.userId !== user.id) {
      throw new Error('You do not have permission to delete this album');
    }
    
    // Delete the album
    await apiRequest(`albums/${id}`, 'DELETE');
    
    // Also delete all photos in this album
    const photos = await getAlbumPhotos(id);
    for (const photo of photos) {
      await apiRequest(`photos/${photo.id}`, 'DELETE');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting album ${id}:`, error);
    throw error;
  }
}

// Get photos for an album
export async function getAlbumPhotos(albumId, page = 1, limit = 10) {
  try {
    // Implement pagination to load photos in batches
    const start = (page - 1) * limit;
    const photos = await apiRequest(`photos?albumId=${albumId}&_start=${start}&_limit=${limit}`);
    return photos;
  } catch (error) {
    console.error(`Error fetching photos for album ${albumId}:`, error);
    throw error;
  }
}

// Count total photos in an album
export async function countAlbumPhotos(albumId) {
  try {
    const photos = await apiRequest(`photos?albumId=${albumId}`);
    return photos.length;
  } catch (error) {
    console.error(`Error counting photos for album ${albumId}:`, error);
    throw error;
  }
}

export default {
  getUserAlbums,
  getAlbum,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  getAlbumPhotos,
  countAlbumPhotos,
};