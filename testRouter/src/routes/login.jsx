import { Form, redirect, useNavigate, useActionData } from "react-router-dom";
import { login } from "../api/auth";

export async function action({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    
    try {
        const result = await login(data.username, data.password);
        if (result.success) {
            return redirect("/home");
        } else {
            return { error: result.message || "Login failed" };
        }
    } catch (error) {
        return { error: "Login failed: " + error.message };
    }
}

export default function Login() {
    const navigate = useNavigate();
    const actionData = useActionData();

    return (
        <main className="login-register">
            <h1>Login</h1>
            {actionData?.error && (
                <div style={{ color: 'red', marginBottom: '1rem' }}>
                    {actionData.error}
                </div>
            )}
            <Form method="post" id="login">
                <p>
                    <input
                        placeholder="Username"
                        aria-label="Username"
                        type="text"
                        name="username"
                        required
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
                    <button type="submit">Login</button>
                </p>
            </Form>
            <p>
                <button type="button" onClick={() => navigate("/register")}>
                    Go to Register
                </button>
            </p>
        </main>
    );
}