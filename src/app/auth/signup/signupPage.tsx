import React from "react";

type SignupPageProps = {
    handleSignup: (event: React.FormEvent) => void;
    message: string;
    validPassword: boolean;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    passwordConfirm: string;
    setPasswordConfirm: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: (pwd: string) => void;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
};   

export default function SignupPage(props: SignupPageProps) { 
    const { handleSignup, message, validPassword, username, setUsername, passwordConfirm, setPasswordConfirm, password, setPassword, email, setEmail } = props;
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSignup} className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Sign Up</h2>
                {message && <p className="text-red-500 mb-4">{message}</p>}
                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                        autoComplete="username"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2" htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                        autoComplete="email"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                        autoComplete="password"
                    />
                    {!validPassword && <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters long.</p>}

                </div>
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                    <input
                        id="retype-password"
                        type="password"
                        value={passwordConfirm}
                        onChange={(e) => setPasswordConfirm(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required
                        autoComplete="Retype your password"
                    />
                    {(password != passwordConfirm) && <p className="text-red-500 text-sm mt-1">password doesn't match.</p>}

                </div>
                <button
                    type="submit"
                    className={'bg-blue-500 hover:bg-blue-600'}
                    disabled={!validPassword}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
}
