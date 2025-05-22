import { Form, redirect, useNavigate } from "react-router-dom";
import { useState } from "react";
import { register } from "../api/auth";
import './login-register.css'

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
    const [showAdditional, setShowAdditional] = useState(false);

    return (
        <main className="login-register">
            <Form method="post" id="register">
                <section className="form-group">
                <input placeholder="Name" aria-label="name" type="text" name="name" required />
                <input placeholder="Username" aria-label="username" type="text" name="username" required />
                </section>

                <section className="form-group">
                <input placeholder="Email" aria-label="email" type="email" name="email" required />
                </section>

                <section className="form-group">
                <input type="password" name="password" placeholder="Password" required />
                <input type="password" name="verifyPassword" placeholder="Verify password" required />
                </section>
                <button
                    type="button"
                    onClick={() => setShowAdditional((v) => !v)}
                    style={{ marginBottom: "1em" }}
                >
                    {showAdditional ? "Hide Additional Info" : "Show Additional Info"}
                </button>
                {showAdditional && (
                  <section className="additional-info">
                    <div className="form-group">
                      <input placeholder="Street" name="street" />
                      <input placeholder="Suite" name="suite" />
                    </div>
                    <div className="form-group">
                      <input placeholder="City" name="city" />
                      <input placeholder="Zipcode" name="zipcode" />
                    </div>
                    <div className="form-group">
                      <input placeholder="Latitude" name="lat" />
                      <input placeholder="Longitude" name="lng" />
                    </div>
                    <div className="form-group">
                      <input placeholder="Phone" name="phone" />
                    </div>
                    <div className="form-group">
                      <input placeholder="Company Name" name="companyName" />
                      <input placeholder="Catch Phrase" name="catchPhrase" />
                      <input placeholder="BS" name="bs" />
                    </div>
                  </section>
                )}
                <section>
                    <button type="submit">Register</button>
                </section>
            </Form>
            <p>
                <button type="button" onClick={() => navigate("/login")}>I have a user</button>
            </p>
        </main>
    );
}

/*
    {
      id: lastUserId + 1,
      name: userData.name,
      username: userData.username,
      email: userData.email,
      website: userData.password, // Using website field as password
      address: {
        street: "",
        suite: "",
        city: "",
        zipcode: "",
        geo: { lat: "", lng: "" }
      },
      phone: "",
      company: {
        name: "",
        catchPhrase: "",
        bs: ""
      }
    }
 */