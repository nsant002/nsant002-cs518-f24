import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

const VerificationSuccess = () => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Extract token from URL parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token'); // Get 'token' from the URL

    if (!token) {
      setError('Token is missing or invalid.');
      return;
    }

    // Fetch the verification using the token
    const verifyAccount = async () => {
      try {
        const response = await fetch(`https://nsant002-cs518-f24.onrender.com/verificationsuccess?token=${token}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Verification failed');
        }

        const data = await response.json();
        setMessage(data.message || 'Account verified successfully.');
      } catch (error) {
        setError(error.message || 'Verification failed.');
      }
    };

    verifyAccount();
  }, [location, navigate]);

  return (
    <div className="verification-success">
      <h2>Account Verification</h2>
      {message && <p className="success-message" style={{ color: 'green' }}>{message}</p>}
      {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

      {/* Add the 'Back to login' link if the account was verified successfully */}
      {message && (
        <div>
          <p>
            <Link to="/" style={{ color: 'blue', textDecoration: 'underline' }}>
              Back to login
            </Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationSuccess;
