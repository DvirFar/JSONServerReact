import { apiRequest } from './config';

// Login user
export async function login(username, password) {
  try {
    // Get all users and check credentials (website field acts as password)
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
      localStorage.setItem('loggedUser', JSON.stringify(userData));
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

    if (!Array.isArray(users)) {
      throw new Error('Expected user list to be an array but got invalid data'); // זה היה אכן באג שהחזיר null
    }
    const existingUser = users.find(u => u.username === userData.username);


    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create new user
    const lastUserId = users.length > 0 ? Math.max(...users.map(u => u.id)) : 0;
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
    localStorage.setItem('loggedUser', JSON.stringify(userToStore));
    
    return { success: true, user: userToStore };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: error.message };
  }
}

// Logout user
export function logout() {
  localStorage.removeItem('loggedUser');
  return { success: true };
}

// Get current user
export function getCurrentUser() {
  const user = localStorage.getItem('loggedUser');
  return user ? JSON.parse(user) : null;
}

// Check if user is authenticated
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isAuthenticated,
};