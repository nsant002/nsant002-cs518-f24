import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
    
        const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    
        if (!email || !firstName || !lastName || !password || !confirmPassword) {
            setError('Please fill in all fields');
            setLoading(false);
            return;
        }
    
        if (!passwordRegex.test(password)) {
            setError('Password must contain at least 8 characters, including uppercase, lowercase, a number, and a special character');
            setLoading(false);
            return;
        }
    
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }
    
        try {
            const response = await axios.post('https://nsant002-cs518-f24.onrender.com/api/register', {
                email,
                first_name: firstName,
                last_name: lastName,
                password,
            });
    
            console.log(response.data);
            // Navigate to /verifyaccount with a success message
            navigate('/verifyaccount', { state: { message: 'User registered successfully. Please check your email to verify your account.' } });
        } catch (err) {
            if (err.response && err.response.status === 400) {
                // Specific error from the backend, such as email already in use
                setError(err.response.data.message);
            } else {
                setError('Registration failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };    

    const handleClear = () => {
        setEmail('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setConfirmPassword('');
        setError('');
    };

    return (
        <div className="container">
            <div className="box">
                <h1>Create Your Account</h1>
                <form id="signup-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <div className="mb-3">
                            <label htmlFor="signup-email">Email Address</label>
                            <input
                                type="email"
                                id="signup-email"
                                className="form-control"
                                maxLength="50"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="first_name">First Name</label>
                            <input
                                type="text"
                                id="first_name"
                                maxLength="50"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="last_name">Last Name</label>
                            <input
                                type="text"
                                id="last_name"
                                maxLength="50"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <label htmlFor="signup-password">Password</label>
                    <input
                        type="password"
                        id="signup-password"
                        className="form-control"
                        minLength="8"
                        maxLength="50"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <label htmlFor="confirm-password">Confirm Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        className="form-control"
                        minLength="8"
                        maxLength="50"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <p style={{ textAlign: 'center' }}>
                        Already have an account? <a href="/" className="login-link">Log in</a>.
                    </p>
                    <div className="form-group-buttons">
                        <button type="submit" className="signup-button" disabled={loading}>
                            {loading ? 'Signing Up...' : 'Sign Up'}
                        </button>
                        <button type="button" className="cancel-button" onClick={handleClear}>
                            Clear Form
                        </button>
                    </div>
                    {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
                </form>
            </div>
        </div>
    );
};

export default Register;
