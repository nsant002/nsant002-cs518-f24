import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TwoFactor = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const email = localStorage.getItem('userEmail'); 
    const navigate = useNavigate(); 

    

    // Call sendOTP when the component mounts (only once)
    useEffect(() => {
        sendOTP(); 
    }, []); 

    // Function to send OTP
    const sendOTP = async () => {
        if (isOtpSent) {
            return; // Prevent sending OTP if already sent
        }

        console.log('Sending OTP to email:', email); 

        try {
            const response = await fetch('https://nsant002-cs518-f24.onrender.com/send-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }), 
            });

            if (!response.ok) {
                throw new Error('Failed to send OTP.');
            }

            const data = await response.json();
            console.log(data.message);
            setIsOtpSent(true); // Mark OTP as sent
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to send OTP. Please try again.');
        }
    };

    // Handle OTP verification
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        console.log('Verifying OTP for email:', email); 
        console.log('OTP entered:', otp); 

        try {
            const response = await fetch('https://nsant002-cs518-f24.onrender.com/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await response.json();
            if (!response.ok) {
                setError(data.message || 'Something went wrong. Please try again.');
                setLoading(false);
                return;
            }

            setMessage('OTP verified successfully! Logging you in.');

            // Redirect after 3 seconds
            setTimeout(() => {
                navigate('/profile'); 
            }, 3000); 

        } catch (error) {
            console.error('Error verifying OTP:', error);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="two-factor-auth">
            <h2>Two-Factor Authentication</h2>
            {isOtpSent ? ( 
                <form onSubmit={handleVerifyOtp}>
                    <input
                        type="text"
                        placeholder="Enter your OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify OTP'}
                    </button>
                </form>
            ) : (
                <p>Sending OTP...</p> 
            )}

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {message && <p style={{ color: 'green' }}>{message}</p>}
        </div>
    );
};

export default TwoFactor;
