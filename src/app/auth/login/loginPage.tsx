type LoginPageProps = {
    handleLogin: (event: React.FormEvent) => void;
    message: string;
    username: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>
};

export default function LoginPage( { handleLogin, message, username, setUsername, password, setPassword } : LoginPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
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
                
                <div className="mb-6">
                    <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded"
                        required 
                        autoComplete="current-password"
                    />
                </div> 
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                >
                    Login
                </button>
            </form>

            <button>
                // signup button should be lower than the form
                <a href="/auth/signup" className="mt-4 text-blue-500 hover:underline">Don't have an account? Sign Up</a>
            </button>
        </div>
    );
}