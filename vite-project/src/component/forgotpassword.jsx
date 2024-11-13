import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (!email) {
            setError('Please enter your email address.');
            setLoading(false);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("New password and confirmation do not match.");
            setLoading(false);
            return;
        }

        try {
            const response = await axios.put(
                `https://nsant002-cs518-f24.onrender.com/api/change-password`, 
                { email, newPassword }
            );
            setMessage(response.data.message || 'Your password has been updated successfully.');
            setEmail('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <h1>Reset Your Password</h1>
            <div className="box">
                <p>Enter your email address and a new password. If your account exists, your password will be updated.</p>
                <form onSubmit={handleSubmit}>
                    <label htmlFor="reset-email">Email Address</label>
                    <input
                        type="email"
                        id="reset-email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        maxLength="50"
                        placeholder="Email Address"
                        required
                    />
                    <label htmlFor="new-password">New Password</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        required
                    />
                    <label htmlFor="confirm-password">Confirm New Password</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm New Password"
                        required
                    />
                    <button type="submit" className="submit-button" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {message && <p style={{ color: 'green' }}>{message}</p>}
                <a href="/" className="login-link">Back to Login</a>
            </div>
        </div>
    );
};

export default ForgotPassword;
