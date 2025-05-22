import { apiRequest } from './config';
import { getCurrentUser } from './auth';

// Get all todos for current user
export async function getUserTodos() {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    // Get todos for the current user
    const todos = await apiRequest(`todos?userId=${user.id}`);
    return todos;
  } catch (error) {
    console.error('Error fetching todos:', error);
    throw error;
  }
}

// Get a single todo by ID
export async function getTodo(id) {
  try {
    const todo = await apiRequest(`todos/${id}`);
    return todo;
  } catch (error) {
    console.error(`Error fetching todo ${id}:`, error);
    throw error;
  }
}

// Create a new todo
export async function createTodo(todoData) {
  const user = getCurrentUser();
  
  if (!user) {
    throw new Error('User is not authenticated');
  }
  
  try {
    const newTodo = {
      userId: user.id,
      title: todoData.title,
      completed: false,
      ...todoData
    };
    
    const createdTodo = await apiRequest('todos', 'POST', newTodo);
    return createdTodo;
  } catch (error) {
    console.error('Error creating todo:', error);
    throw error;
  }
}

// Update a todo
export async function updateTodo(id, todoData) {
  try {
    // First fetch the existing todo to make sure it exists
    const existingTodo = await getTodo(id);
    
    // Check if the todo belongs to the current user
    const user = getCurrentUser();
    if (!user || existingTodo.userId !== user.id) {
      throw new Error('You do not have permission to update this todo');
    }
    
    const updatedTodo = await apiRequest(`todos/${id}`, 'PATCH', todoData);
    return updatedTodo;
  } catch (error) {
    console.error(`Error updating todo ${id}:`, error);
    throw error;
  }
}

// Delete a todo
export async function deleteTodo(id) {
  try {
    // First fetch the existing todo to make sure it exists
    const existingTodo = await getTodo(id);
    
    // Check if the todo belongs to the current user
    const user = getCurrentUser();
    if (!user || existingTodo.userId !== user.id) {
      throw new Error('You do not have permission to delete this todo');
    }
    
    await apiRequest(`todos/${id}`, 'DELETE');
    return { success: true };
  } catch (error) {
    console.error(`Error deleting todo ${id}:`, error);
    throw error;
  }
}

export default {
  getUserTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
};