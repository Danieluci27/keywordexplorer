"use client";

import { useState } from "react";
import LoginPage  from "./loginPage";
import { useRouter } from "next/navigation";

class LoginError extends Error {
    constructor(status: string) {
        super(status);
        this.name = "LoginError";
    }
}

export default function Login() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage("");

        const url = process.env.NEXT_PUBLIC_BACKEND_SERVER_URL + "auth/login";
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username: username, password: password })
            });

            if (response.ok) {
                // Redirect to the main app page or update state to show logged-in view
                router.push("/explorer");
                console.log("Login successful");
                setMessage("Login successful");
            } else {
                console.log(1);
                console.log(response);
                console.log(response.status); 
                console.log(2);
                throw new LoginError(response.status.toString());
            } 
        }  catch (error) {
            if (error instanceof LoginError) {
                if (error.message == "401") {
                    console.log(error.message);
                    setMessage("Invalid username or password.");
                }
            } else if (error instanceof Error) {
                setMessage(error.message);
            } else {
                setMessage("An error occurred during login.");
            }
        }
    };
 
    return (
        <LoginPage 
            handleLogin={handleLogin} 
            message={message}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
        />
    );
}