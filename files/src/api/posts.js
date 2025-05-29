import { apiRequest } from './config';
import { getCurrentUser } from './auth';

// Get all posts for current user
export async function getUserPosts() {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Get posts for the current user
    const posts = await apiRequest(`posts?userId=${user.id}`);
    return posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Get a single post by ID
export async function getPost(id) {
  try {
    const post = await apiRequest(`posts/${id}`);
    return post;
  } catch (error) {
    console.error(`Error fetching post ${id}:`, error);
    throw error;
  }
}

// Get comments for a post
export async function getPostComments(postId) {
  try {
    const comments = await apiRequest(`comments?postId=${postId}`);
    return comments;
  } catch (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }
}

// Create a new post
export async function createPost(postData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    const newPost = {
      userId: user.id,
      title: postData.title,
      body: postData.body,
    };
    
    const createdPost = await apiRequest('posts', 'POST', newPost);
    return createdPost;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// Update a post
export async function updatePost(id, postData) {
  try {
    // First fetch the existing post to make sure it exists
    const existingPost = await getPost(id);
    
    // Check if the post belongs to the current user
    const user = getCurrentUser();
    if (!user || existingPost.userId !== user.id) {
      throw new Error('You do not have permission to update this post');
    }
    
    const updatedPost = await apiRequest(`posts/${id}`, 'PATCH', postData);
    return updatedPost;
  } catch (error) {
    console.error(`Error updating post ${id}:`, error);
    throw error;
  }
}

// Delete a post
export async function deletePost(id) {
  try {
    // First fetch the existing post to make sure it exists
    const existingPost = await getPost(id);
    
    // Check if the post belongs to the current user
    const user = getCurrentUser();
    if (!user || existingPost.userId !== user.id) {
      throw new Error('You do not have permission to delete this post');
    }
    
    await apiRequest(`posts/${id}`, 'DELETE');
    
    // Also delete all comments for this post
    const comments = await getPostComments(id);
    for (const comment of comments) {
      await apiRequest(`comments/${comment.id}`, 'DELETE');
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error deleting post ${id}:`, error);
    throw error;
  }
}

// Add a comment to a post
export async function addComment(postId, commentData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    const newComment = {
      postId,
      name: user.name || commentData.name,
      email: user.email || commentData.email,
      body: commentData.body,
    };
    
    const createdComment = await apiRequest('comments', 'POST', newComment);
    return createdComment;
  } catch (error) {
    console.error(`Error adding comment to post ${postId}:`, error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(commentId) {
  try {
    // First fetch the existing comment
    const comment = await apiRequest(`comments/${commentId}`);
    
    // Check if the comment was created by the current user (check by email)
    const user = getCurrentUser();
    if (!user || comment.email !== user.email) {
      throw new Error('You do not have permission to delete this comment');
    }
    
    await apiRequest(`comments/${commentId}`, 'DELETE');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting comment ${commentId}:`, error);
    throw error;
  }
}

// Update a comment
export async function updateComment(commentId, commentData) {
  try {
    // First fetch the existing comment
    const comment = await apiRequest(`comments/${commentId}`);
    
    // Check if the comment was created by the current user (check by email)
    const user = getCurrentUser();
    if (!user || comment.email !== user.email) {
      throw new Error('You do not have permission to update this comment');
    }
    
    const updatedComment = await apiRequest(`comments/${commentId}`, 'PATCH', commentData);
    return updatedComment;
  } catch (error) {
    console.error(`Error updating comment ${commentId}:`, error);
    throw error;
  }
}

export default {
  getUserPosts,
  getPost,
  getPostComments,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  updateComment,
};