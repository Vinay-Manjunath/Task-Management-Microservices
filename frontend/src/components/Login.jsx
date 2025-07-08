import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css'; // Import shared CSS file for both forms

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post(`http://localhost:8083/users/login?username=${username}&password=${password}`);
            console.log(response.data);
            onLogin();
        } catch (error) {
            setError('Invalid credentials. Please try again.');
            console.error('Login failed:', error.response?.data || error.message);
        }
    };

    return (
        <div className="auth-container">
            <h2>Login</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email"
                    placeholder="Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
            </form>
            
        </div>
    );
}

export default Login;
