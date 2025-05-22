import { apiRequest } from './config';

// Login user
export async function login(username, password) {
  try {
    // For development, we're also implementing a direct check against the users endpoint
    // since we know the login logic (website field acts as password)
    // This is a fallback if the custom /auth/login endpoint doesn't work
    const users = await apiRequest('users');
    const user = users.find(u => u.username === username && u.website === password);
    
    if (user) {
      // Store user data in localStorage
      const userData = {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
      };
      localStorage.setItem('user', JSON.stringify(userData));
      return { success: true, user: userData };
    }
    
    throw new Error('Invalid username or password');
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: error.message };
  }
}

// Register user
export async function register(userData) {
  try {
    // Check if username exists
    const users = await apiRequest('users');
    const existingUser = users.find(u => u.username === userData.username);
    
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    // Create new user
    const lastUserId = Math.max(...users.map(u => u.id));
    const newUser = {
      id: lastUserId + 1,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      website: userData.password, // Using website field as password
      address: {
        street: "",
        suite: "",
        city: "",
        zipcode: "",
        geo: { lat: "", lng: "" }
      },
      phone: "",
      company: {
        name: "",
        catchPhrase: "",
        bs: ""
      }
    };
    
    const createdUser = await apiRequest('users', 'POST', newUser);
    
    // Store user data in localStorage
    const userToStore = {
      id: createdUser.id,
      name: createdUser.name,
      username: createdUser.username,
      email: createdUser.email,
    };
    localStorage.setItem('user', JSON.stringify(userToStore));
    
    return { success: true, user: userToStore };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
}

// Logout user
export function logout() {
  localStorage.removeItem('user');
  return { success: true };
}

// Get current user
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
};