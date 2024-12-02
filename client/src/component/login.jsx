/*import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

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
            const response = await axios.post(import.meta.env.VITE_API_KEY+'/login', { email, password });

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
                    //Add Recaptcha here?
                    

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

export default Login;*/

import React, { useState, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const recaptchaRef = useRef(null); // Initialize reCAPTCHA ref

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
        if (!email || !password) {
            setError('Please fill in both fields');
            setLoading(false);
            return;
        }

        if (!passwordRegex.test(password)) {
            setError('Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character.');
            setLoading(false);
            return;
        }
    
        // Get reCAPTCHA token manually
        const recaptchaToken = recaptchaRef.current.getValue();
        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA');
            setLoading(false);
            return;
        }
    
        try {
            const response = await axios.post('https://nsant002-cs518-f24.onrender.com/server/login', {
                email,
                password,
                recaptchaToken, // Include the token in the request
            });
    
            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userEmail', email);
            } else {
                throw new Error('Token not received from the server.');
            }
    
            navigate('/twofactor', { state: { email } });
        } catch (err) {
            setError(err.response?.data?.message || 'Unknown Website Error. Contact the Webmaster.');
        } finally {
            setLoading(false);
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

                    {/* Add reCAPTCHA */}
                    <div style={{ margin: '10px auto', display: 'flex', justifyContent: 'center' }}>
                        <ReCAPTCHA
                            sitekey={import.meta.env.VITE_SITE_KEY}
                            ref={recaptchaRef}
                            size="normal"
                        />
                    </div>

                    <button type="submit" className="login-button" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                    <button 
                        type="button" 
                        className="signup-button" 
                        id="signup-redirect" 
                        onClick={() => navigate('/register')}
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
