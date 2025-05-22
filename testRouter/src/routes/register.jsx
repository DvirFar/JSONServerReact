import { Form, redirect, useNavigate } from "react-router-dom";
import { register } from "../api/auth";

export async function action({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    if (data.password !== data.verifyPassword) {
        alert("Passwords don't match!");
        return null; // Stay on register page
    }
    
    const result = await register({
        username: data.username,
        password: data.password,
        name: data.name || data.username,
        email: data.email || `${data.username}@example.com`
    });
    
    if (!result.success) {
        alert(result.message || "Registration failed!");
        return null; // Stay on register page
    }
    
    return redirect("/home");
}

export default function Register() {
    const navigate = useNavigate();

    return (
        <main className="login-register">
            <Form method="post" id="register">
                <p>
                    <input
                        placeholder="Full Name"
                        aria-label="name"
                        type="text"
                        name="name"
                    />
                </p>
                <p>
                    <input
                        placeholder="Username"
                        aria-label="username"
                        type="text"
                        name="username"
                        required
                    />
                </p>
                <p>
                    <input
                        placeholder="Email"
                        aria-label="email"
                        type="email"
                        name="email"
                    />
                </p>
                <p>
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                    />
                </p>
                <p>
                    <input
                        type="password"
                        name="verifyPassword"
                        placeholder="Verify Password"
                        required
                    />
                </p>
                <p>
                    <button type="submit">Register</button>
                </p>
            </Form>
            <p>
                <button type="button" onClick={() => navigate("/login")}>
                    Login
                </button>
            </p>
        </main>
    );
}