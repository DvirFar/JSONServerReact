// Base API configuration
const API_BASE_URL = 'http://localhost:3001';

// Helper function for making API requests
export async function apiRequest(endpoint, method = 'GET', data = null) {
  const url = `${API_BASE_URL}/${endpoint}`;
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Add body for non-GET requests
  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  // Add auth token if user is logged in
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    options.headers.Authorization = `Bearer ${user.token}`;
  }

  try {
    const response = await fetch(url, options);
    
    // For non-JSON responses
    if (!response.headers.get('content-type')?.includes('application/json')) {
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      return null;
    }

    const responseData = await response.json();

    if (!response.ok) {
      throw new Error(responseData.message || 'API request failed');
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Export default configurations
export default {
  baseUrl: API_BASE_URL,
  apiRequest,
};