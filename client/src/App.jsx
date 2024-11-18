import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import Navbar from './component/navbar'; // Import the Navbar component
import Login from './component/login';   // Import the Login component
import Register from './component/register'; // Import the Register component
import Profile from './component/profile'; // Import the Profile component
import VerificationSuccess from './component/verificationsuccess'; // Import the VerificationSuccess component
import ForgotPassword from './component/forgotpassword'; // Import the ForgotPassword component
import TwoFactor from './component/twofactor'; // Import the TwoFactor component
import VerifyAccount from './component/verifyaccount';

const App = () => {
  // Dummy user data (you would normally get this from authentication)
  const user = {
    // firstName: 'John',
    // profilePicture: 'https://via.placeholder.com/150'
  };

  return (
    <Router>
      <div>
        {/* Navbar component is rendered on all pages */}
        {/*<Navbar user={user} />*/}

        {/* Route configuration */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/verifyaccount" element={<VerifyAccount />} />
          <Route path="/verificationsuccess" element= {<VerificationSuccess />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/twofactor" element={<TwoFactor />} /> 


        </Routes>
      </div>
    </Router>
  );
};

export default App;
