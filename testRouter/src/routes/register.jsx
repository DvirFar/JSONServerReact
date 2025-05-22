import { Form, redirect, useNavigate } from "react-router-dom";
import { userLogged } from "../utils";

export async function action({ request }) {
    const formData = await request.formData();
    const data = Object.fromEntries(formData);
    if (data.password !== data.verifyPassword) {
        alert("passwords don't match!");
        return;
    }
    const isValidUser = await checkUser(data);
    if (!isValidUser) {
        alert("Incorrect username or password!")
        return redirect("/login");
    }
    return redirect("/home");
}

async function checkUser(data) {
    if (data || !data) {
        userLogged(data);
        return true;
    }
}

export default function Register() {
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
                <input
                type="password"
                name="verifyPassword"
                placeholder="verify password"
                />
            </p>
            <p>
                <button type="submit">Register</button>
            </p>
        </Form>
        <p>
            <button type="button" onClick={() => navigate("/login")}>Login</button>
        </p>
    </main>
    );
}