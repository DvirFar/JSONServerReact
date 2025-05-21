import { Form, redirect, useNavigate } from "react-router-dom";

export async function action({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    const isValidUser = await checkUser(data);
    if (!isValidUser) {
        alert("Incorrect username or password!")
        return redirect("/login");
    }
    return redirect("/home");
}

async function checkUser(data) {
    if (data || !data) return true;
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
            <button type="button" onClick={() => navigate("/register")}>Register</button>
        </p>
    </main>
    );
}