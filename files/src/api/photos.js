import { apiRequest } from './config';
import { getCurrentUser } from './auth';
import { getAlbum } from './albums';

// Get a single photo by ID
export async function getPhoto(id) {
  try {
    const photo = await apiRequest(`photos/${id}`);
    return photo;
  } catch (error) {
    console.error(`Error fetching photo ${id}:`, error);
    throw error;
  }
}

// Add a photo to an album
export async function addPhoto(albumId, photoData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Check if the album belongs to the current user
    const album = await getAlbum(albumId);
    if (album.userId !== user.id) {
      throw new Error('You do not have permission to add photos to this album');
    }
    
    const newPhoto = {
      albumId,
      title: photoData.title,
      url: photoData.url,
      thumbnailUrl: photoData.thumbnailUrl || photoData.url,
    };
    
    const createdPhoto = await apiRequest('photos', 'POST', newPhoto);
    return createdPhoto;
  } catch (error) {
    console.error(`Error adding photo to album ${albumId}:`, error);
    throw error;
  }
}

// Update a photo
export async function updatePhoto(id, photoData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Check if the photo's album belongs to the current user
    const photo = await getPhoto(id);
    const album = await getAlbum(photo.albumId);
    
    if (album.userId !== user.id) {
      throw new Error('You do not have permission to update this photo');
    }
    
    const updatedPhoto = await apiRequest(`photos/${id}`, 'PATCH', photoData);
    return updatedPhoto;
  } catch (error) {
    console.error(`Error updating photo ${id}:`, error);
    throw error;
  }
}

// Delete a photo
export async function deletePhoto(id) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Check if the photo's album belongs to the current user
    const photo = await getPhoto(id);
    const album = await getAlbum(photo.albumId);
    
    if (album.userId !== user.id) {
      throw new Error('You do not have permission to delete this photo');
    }
    
    await apiRequest(`photos/${id}`, 'DELETE');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting photo ${id}:`, error);
    throw error;
  }
}

export default {
  getPhoto,
  addPhoto,
  updatePhoto,
  deletePhoto,
};