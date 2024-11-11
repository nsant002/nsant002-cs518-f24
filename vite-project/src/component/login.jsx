import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate for redirection

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); // Clear any previous error
        setLoading(true); // Set loading to true while processing

        // Simple validation
        if (!email || !password) {
            setError('Please fill in both fields');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:3000/api/login', { email, password });

            // Log the response to check if the token is returned
            console.log('Login response data:', response.data);

            // Store the token and email in localStorage
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userEmail', email);
                console.log('Stored token:', response.data.token); // Log to verify storage
            } else {
                throw new Error('Token not received from the server.');
            }

            // On successful login, navigate to the two-factor authentication page
            navigate('/twofactor', { state: { email } });
        } catch (err) {
            // Use the error message from the response, if available
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid email or password'); // Fallback error message
            }
            console.error('Login error:', err.message); // Log any errors for debugging
        } finally {
            setLoading(false); // Set loading to false after processing
        }
    };

    return (
        <div className="container">
            <h1 style={{ margin: '0' }}>Welcome to Naomi Brillhart's Web Programming Portal</h1>
            <h2 style={{ margin: '0' }}>CS 518 - Fall 2024</h2>
            <h3 style={{ margin: '0' }}>Professor: Nasreen Arif</h3>
            <div className="box">
                <form onSubmit={handleSubmit}>
                    <p>Already have an account? Log in here.</p>
                    
                    <label htmlFor="login-email">Email Address</label>
                    <input
                        type="email"
                        id="login-email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="Email Address"
                        maxLength="50"
                    />
                    
                    <label htmlFor="login-password">Password</label>
                    <input
                        type="password"
                        id="login-password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="Password"
                        maxLength="50"
                    />
                    
                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    
                    <button 
                        type="button" 
                        className="signup-button" 
                        id="signup-redirect" 
                        onClick={() => navigate('/register')} // Navigate to the register page
                    >
                        Create account
                    </button>
                    
                    <br />
                    <Link to="/forgotpassword" className="login-link">Forgot Password?</Link>
                    
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Login;
