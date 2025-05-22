import { Form, redirect, useNavigate } from "react-router-dom";
import { login } from "../api/auth";

export async function action({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const response = await login(data.username, data.password);
    if (!response.success) {
        alert(response.message);
        return redirect("/login");
    }
    return redirect("/home");
}

export default function Login() {
    const navigate = useNavigate();

    return (
    <main className="login-register">
        <Form method="post" id="login">
            <p>
                <input
                placeholder="username"
                aria-label="username"
                type="text"
                name="username"
                />
            </p>
            <p>
                <input
                type="password"
                name="password"
                placeholder="password"
                />
            </p>
            <p>
                <button type="submit">Login</button>
            </p>
        </Form>
        <p>
            <button type="button" onClick={() => navigate("/register")}>I don't have a user</button>
        </p>
    </main>
    );
}