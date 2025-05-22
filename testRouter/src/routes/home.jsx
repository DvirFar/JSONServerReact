import { redirect, useLoaderData, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";
import "./home.css";

export function loader() {
    const userData = localStorage.getItem("loggedUser");
    if (!userData) {
        return redirect("/login");
    } else {
        return { data: JSON.parse(userData) };
    }
}

export default function Home() {
    const { data } = useLoaderData();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const username = data.username || "User";

    return (
        <main className="home-main">
            <h1 className="home-title">Welcome, {data.username || "User"}!</h1>
            <div className="home-btn-group">
                <button onClick={() => navigate(`/users/${username}/info`)}>Info</button>
                <button onClick={() => navigate(`/users/${username}/todos`)}>Todos</button>
                <button onClick={() => navigate(`/users/${username}/posts`)}>Posts</button>
                <button onClick={() => navigate(`/users/${username}/albums`)}>Albums</button>
                <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
            <section>
                <h2>Your Albums</h2>
                {/* Albums list goes here */}
            </section>
            <section>
                <h2>Your Photos</h2>
                {/* Photos list goes here */}
            </section>
        </main>
    );
}