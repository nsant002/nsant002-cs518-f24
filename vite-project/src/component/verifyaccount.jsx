import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Include Link for navigation

const VerifyAccount = () => {
  const [message, setMessage] = useState(''); // Message to show that verification request is sent
  const [emailSent, setEmailSent] = useState(false); // State to track if verification email was sent

  const location = useLocation();

  // Extract token from URL parameters when component mounts
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token'); // Get the 'token' parameter from the URL
    if (token) {
      // Optionally handle the token if needed
    }
  }, [location]);

  // Simulate sending email on component mount
  useEffect(() => {
    // Assume the registration process triggers this component
    // and email was sent for verification
    setEmailSent(true);
    setMessage('User registered successfully. Please check your email to verify your account.');
  }, []);

  return (
    <div className="verify-account-container">
      <h2>Verify Account</h2>

      {/* Inform user that verification email has been sent */}
      {emailSent && (
        <div>
          <p className="info-message" style={{ color: 'blue' }}>
            {message}
          </p>
          <Link to="/" className="back-to-login">Back to Login</Link>
        </div>
      )}
    </div>
  );
};

export default VerifyAccount;
