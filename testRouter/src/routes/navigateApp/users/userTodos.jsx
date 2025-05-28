import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../../api/auth";
import { getUserTodos, createTodo, updateTodo, deleteTodo } from "../../../api/todos";
import "./userTodos.css";

export default function UserTodos() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newTodoTitle, setNewTodoTitle] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortBy, setSortBy] = useState("id");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        if (currentUser.username !== username) {
            setError("Access denied: You can only view your own todos");
            setLoading(false);
            return;
        }

        loadTodos();
    }, [username, navigate]);

    const loadTodos = async () => {
        try {
            setLoading(true);
            const todosData = await getUserTodos();
            setTodos(todosData);
            setError(null);
        } catch (err) {
            setError("Failed to load todos: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTodo = async (e) => {
        e.preventDefault();
        if (!newTodoTitle.trim()) return;

        try {
            await createTodo({ title: newTodoTitle.trim() });
            setNewTodoTitle("");
            loadTodos();
        } catch (err) {
            setError("Failed to create todo: " + err.message);
        }
    };

    const handleToggleTodo = async (todo) => {
        try {
            await updateTodo(todo.id, { completed: !todo.completed });
            loadTodos();
        } catch (err) {
            setError("Failed to update todo: " + err.message);
        }
    };

    const handleDeleteTodo = async (todoId) => {
        if (!window.confirm("Are you sure you want to delete this todo?")) return;

        try {
            await deleteTodo(todoId);
            loadTodos();
        } catch (err) {
            setError("Failed to delete todo: " + err.message);
        }
    };

    const handleUpdateTodoTitle = async (todo, newTitle) => {
        if (!newTitle.trim()) return;

        try {
            await updateTodo(todo.id, { title: newTitle.trim() });
            loadTodos();
        } catch (err) {
            setError("Failed to update todo: " + err.message);
        }
    };

    const getFilteredAndSortedTodos = () => {
        let filtered = todos;

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(todo =>
                todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                todo.id.toString().includes(searchTerm)
            );
        }

        // Filter by status
        if (filterStatus === "completed") {
            filtered = filtered.filter(todo => todo.completed);
        } else if (filterStatus === "pending") {
            filtered = filtered.filter(todo => !todo.completed);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case "title":
                    return a.title.localeCompare(b.title);
                case "status":
                    return a.completed === b.completed ? 0 : a.completed ? 1 : -1;
                case "id":
                default:
                    return a.id - b.id;
            }
        });

        return filtered;
    };

    if (loading) {
        return <div className="todos-container"><p>Loading todos...</p></div>;
    }

    if (error && !todos.length) {
        return (
            <div className="todos-container">
                <div className="error-message">{error}</div>
                <button onClick={() => navigate("/home")}>Back to Home</button>
            </div>
        );
    }

    const filteredTodos = getFilteredAndSortedTodos();

    return (
        <div className="todos-container">
            <div className="todos-header">
                <h1>My Todos</h1>
                <button onClick={() => navigate("/home")} className="back-btn">Back to Home</button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {/* Add new todo */}
            <form onSubmit={handleCreateTodo} className="add-todo-form">
                <input
                    type="text"
                    value={newTodoTitle}
                    onChange={(e) => setNewTodoTitle(e.target.value)}
                    placeholder="Enter new todo..."
                    required
                />
                <button type="submit">Add Todo</button>
            </form>

            {/* Controls */}
            <div className="todos-controls">
                <input
                    type="text"
                    placeholder="Search todos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="id">Sort by ID</option>
                    <option value="title">Sort by Title</option>
                    <option value="status">Sort by Status</option>
                </select>

                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Todos</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            {/* Todos list */}
            <div className="todos-list">
                {filteredTodos.length === 0 ? (
                    <p className="no-todos">No todos found</p>
                ) : (
                    filteredTodos.map(todo => (
                        <TodoItem
                            key={todo.id}
                            todo={todo}
                            onToggle={handleToggleTodo}
                            onDelete={handleDeleteTodo}
                            onUpdateTitle={handleUpdateTodoTitle}
                        />
                    ))
                )}
            </div>

            <div className="todos-summary">
                <p>Total: {todos.length} | Completed: {todos.filter(t => t.completed).length} | Pending: {todos.filter(t => !t.completed).length}</p>
            </div>
        </div>
    );
}

function TodoItem({ todo, onToggle, onDelete, onUpdateTitle }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleSave = () => {
        if (editTitle.trim() !== todo.title) {
            onUpdateTitle(todo, editTitle);
        }
        setIsEditing(false);
    };

    const handleCancel = () => {
        setEditTitle(todo.title);
        setIsEditing(false);
    };

    return (
        <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
            <div className="todo-info">
                <span className="todo-id">#{todo.id}</span>
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => onToggle(todo)}
                    className="todo-checkbox"
                />
                {isEditing ? (
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="todo-edit-input"
                        onKeyPress={(e) => e.key === 'Enter' && handleSave()}
                        autoFocus
                    />
                ) : (
                    <span 
                        className="todo-title"
                        onDoubleClick={() => setIsEditing(true)}
                        title="Double click to edit"
                    >
                        {todo.title}
                    </span>
                )}
            </div>
            <div className="todo-actions">
                {isEditing ? (
                    <>
                        <button onClick={handleSave} className="save-btn">Save</button>
                        <button onClick={handleCancel} className="cancel-btn">Cancel</button>
                    </>
                ) : (
                    <>
                        <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
                        <button onClick={() => onDelete(todo.id)} className="delete-btn">Delete</button>
                    </>
                )}
            </div>
        </div>
    );
}