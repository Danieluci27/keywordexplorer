"use client";

import { useState } from "react";
import SignupPage from "./signupPage";

class SignupError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "SignupError";
    }
}

export default function Signup() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [validPassword, setValidPassword] = useState(false);
    const [passwordConfirm, setPasswordConfirm] = useState(""); 
    const [email, setEmail] = useState("");

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log(password);
        console.log(passwordConfirm);
        if (!passwordValidityCheck()) {
            setMessage("Password must be at least 8 characters long.");
            return;
        } else if (password !== passwordConfirm) {
            setMessage("Passwords do not match.");
            return;
        }

        setMessage("");
        const url = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "auth/signup";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: username, email: email, password: password })
            });
            if (response.ok) {
                // Redirect to the login page or update state to show logged-in view
                window.location.href = "/auth/login";
                console.log("Signup successful");
                setMessage("Signup successful. Please log in.");
            } else {
                const data = await response.json();
                console.log(data.message); 
                throw new SignupError(data.message);
            }
 
        } catch (error) {
            if (error instanceof Error) {
                console.log(error.message);
                setMessage(error.message);
            } else {
                setMessage("An error occurred during sign up.");
            }
        }
    }

    const passwordValidityCheck = () => {
        return password.length >= 8;
    }
    //TODO: Add email validation and bloom filter for username existence check
    return (
        <SignupPage
            handleSignup={handleSignup}
            message={message}
            validPassword={validPassword}
            username={username}
            setUsername={setUsername}
            passwordConfirm={passwordConfirm}
            setPasswordConfirm={setPasswordConfirm}
            password={password}
            setPassword={(pwd: string) => { setPassword(pwd); setValidPassword(passwordValidityCheck()); }}
            email={email}
            setEmail={setEmail}
        />
    );
}