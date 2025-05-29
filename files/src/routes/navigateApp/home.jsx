import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../api/auth";
import "./home.css";

export function loader() {
    const user = getCurrentUser();
    if (!user) {
        return redirect("/login");
    }
    return { user };
}

export default function Home() {
    const { user } = useLoaderData();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleInfo = () => {
        navigate(`/users/${user.username}/info`);
    };

    const handleTodos = () => {
        navigate(`/users/${user.username}/todos`);
    };

    const handlePosts = () => {
        navigate(`/users/${user.username}/posts`);
    };

    const handleAlbums = () => {
        navigate(`/users/${user.username}/albums`);
    };

    return (
        <main className="home-main">
            <h1 className="home-title">Welcome, {user.name || user.username}!</h1>
            <div className="user-summary">
                <p>Username: {user.username}</p>
                <p>Email: {user.email}</p>
            </div>
            <div className="home-btn-group">
                <button onClick={handleInfo}>Info</button>
                <button onClick={handleTodos}>Todos</button>
                <button onClick={handlePosts}>Posts</button>
                <button onClick={handleAlbums}>Albums</button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            <section>
                <h2>Quick Access</h2>
                <p>Use the buttons above to navigate to different sections of your profile.</p>
                <ul>
                    <li><strong>Info:</strong> View and edit your personal information</li>
                    <li><strong>Todos:</strong> Manage your todo list</li>
                    <li><strong>Posts:</strong> Create and manage your posts</li>
                    <li><strong>Albums:</strong> Organize your photo albums</li>
                </ul>
            </section>
        </main>
    );
}