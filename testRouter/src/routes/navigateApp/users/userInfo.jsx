import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getCurrentUser } from "../../../api/auth";
import "./userInfo.css";

export default function UserInfo() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const currentUser = getCurrentUser();
        if (!currentUser) {
            navigate("/login");
            return;
        }
        
        if (currentUser.username !== username) {
            setError("Access denied: You can only view your own information");
            setLoading(false);
            return;
        }

        setUser(currentUser);
        setLoading(false);
    }, [username, navigate]);

    const handleBack = () => {
        navigate("/home");
    };

    if (loading) {
        return <div className="user-info-container"><p>Loading...</p></div>;
    }

    if (error) {
        return (
            <div className="user-info-container">
                <div className="error-message">{error}</div>
                <button onClick={handleBack}>Back to Home</button>
            </div>
        );
    }

    return (
        <div className="user-info-container">
            <h1>User Information</h1>
            <div className="user-info-card">
                <div className="info-section">
                    <h2>Personal Details</h2>
                    <div className="info-row">
                        <label>Full Name:</label>
                        <span>{user.name}</span>
                    </div>
                    <div className="info-row">
                        <label>Username:</label>
                        <span>{user.username}</span>
                    </div>
                    <div className="info-row">
                        <label>Email:</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="info-row">
                        <label>User ID:</label>
                        <span>{user.id}</span>
                    </div>
                    <div className="info-row">
                        <label>Status:</label>
                        <span className="status-active">Active</span>
                    </div>
                </div>
            </div>
            
            <div className="action-buttons">
                <button onClick={handleBack}>Back to Home</button>
                <button onClick={() => navigate(`/users/${username}/todos`)}>View Todos</button>
                <button onClick={() => navigate(`/users/${username}/posts`)}>View Posts</button>
                <button onClick={() => navigate(`/users/${username}/albums`)}>View Albums</button>
            </div>
        </div>
    );
}