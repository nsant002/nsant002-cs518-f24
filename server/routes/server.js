//require('dotenv').config(); // Load environment variables from .env file

// const mysql = require('mysql2'); // Make sure to install mysql2
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');
//const cors = require('cors'); // Import the cors package
// const nodemailer = require('nodemailer'); // Import Nodemailer
// const crypto = require('crypto');
//const express = require('express');



//const app = express();
//server.use(cors()); // Enable CORS
//server.use(express.json()); // Parse JSON request bodies




import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cors from "cors";
import crypto from "crypto";
import { Router } from "express";
import { db } from "../database/database.js";
import nodemailer from "nodemailer"

// Create a Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
    },
});
//import { SendMail } from "../utils/sendmail.js";


const server = Router();


const otpStore = {};// Store OTPs in memory (consider using a database in production)
//const user = Router(); // Initialize Router

// Log incoming headers
server.use((req, res, next) => {
    console.log('Request Headers:', req.headers); // Log incoming headers
    next();
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Database connection error:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Route to register user
server.post('/register', (req, res) => {
    const { email, first_name, last_name, password } = req.body;

    // Check if user already exists
    db.query('SELECT * FROM users WHERE email = ?', [email], (error, results) => {
        if (error) {
            console.error('Database error during email check:', error); // Logging error
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email is already in use' });
        }

        // Hash the password using bcrypt before saving it to the database
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Password encryption error:', err); // Logging error
                return res.status(500).json({ message: 'Password encryption error' });
            }

            // Create new user
            const newUser = {
                email,
                first_name,
                last_name,
                password: hash, // Save the hashed password
                verified: false, // Use 'verified' instead of 'isVerified' to match DB
            };

            // Insert new user into the database
            db.query('INSERT INTO users SET ?', newUser, (err, result) => {
                if (err) {
                    console.error('Failed to create user:', err); // Logging error
                    return res.status(500).json({ message: 'Failed to create user' });
                }

                // Generate JWT token
                const verificationToken = jwt.sign(
                    { email: newUser.email, userId: result.insertId },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Send verification email
                sendVerificationEmail(newUser.email, verificationToken);

                return res.status(201).json({
                    message: 'User registered successfully. Please check your email to verify your account.',
                    userId: result.insertId,
                });
            });
        });
    });
});

// Email sending function using Nodemailer
const sendVerificationEmail = (email, token) => {
    const verificationUrl = `https://nsant002-cs518-f24.onrender.com/verificationsuccess?token=${token}`;

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Verify Your Account',
        html: `<p>Please click the following link to verify your account:</p>
               <a href="${verificationUrl}">Verify Account</a>`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error('Error sending email:', err);
        } else {
            console.log('Verification email sent:', info.response);
        }
    });
};

// Route to send OTP
server.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    // Generate a 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    
    // Store OTP against the email (you may want to implement expiration)
    otpStore[email] = otp;

    const mailOptions = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'OTP sent successfully to your email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
    }
});

// Route to verify user account
server.get('/verificationsuccess', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        const email = decoded.email;

        // Update user to set verified status to true
        db.query('UPDATE users SET verified = TRUE WHERE email = ?', [email], (error) => {
            if (error) {
                console.error('Failed to verify account:', error); // Logging error
                return res.status(500).json({ message: 'Failed to verify account' });
            }

            res.json({ message: 'Account verified successfully! You can now log in.' });
        });
    });
});

// Route to log in user
server.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Query the database to find the user
    db.query('SELECT * FROM users WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.error('Database error during login:', error); // Logging error
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: 'Invalid email address. Please try using a different email address or create a new account.' });
        }

        const user = results[0];

        // Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid password. Please try typing it correctly, or click "Forgot password" to reset your password.' });
        }

        // Check if the user is verified
        if (!user.verified || user.verified === 0) { // Check for unverified users
            return res.status(403).json({ message: 'Please verify your account before logging in.' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log("Generated JWT Token:", token); // Log the token

        const decoded = jwt.decode(token); // Decode for inspection
        console.log("Decoded Token:", decoded); // Log the decoded token

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
        otpStore[email] = otp; // Store OTP in memory (or database) with expiration if needed

        try {
            // await SendMail(mailOptions);
            return res.status(200).json({ message: 'Login successful. An OTP has been sent to your email.', token });
        } catch (error) {
            console.error('Error sending OTP:', error);
            return res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
        }
    });
});

// Route to verify OTP
server.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    // Check if OTP matches
    if (otpStore[email] === otp) {
        delete otpStore[email]; // Clear OTP after verification
        res.status(200).json({ message: 'OTP verified successfully! You can now log in.' });
    } else {
        res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }
});

// Middleware for token authentication
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401); // Unauthorized if no token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Forbidden if token is invalid
        req.user = user; // Attach user info to request
        next(); // Call next middleware/route handler
    });
};

// Middleware to verify token
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.sendStatus(403);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.role !== 'admin') {  // assuming 'role' exists in your token payload
        return res.status(403).json({ message: 'Access forbidden: Admins only' });
      }
      
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: 'Token is invalid or expired' });
    }
  };  

// Route to get user data
server.get('/user', authenticateToken, (req, res) => {
    db.query('SELECT * FROM users WHERE id = ?', [req.user.userId], (error, results) => {
        if (error) {
            console.error('Database error during fetching user:', error); // Logging error
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(results[0]); // Return user data
    });
});

// Route to update user information
server.put('/update-user', authenticateToken, (req, res) => {
    const { first_name, last_name, password } = req.body;

    // Hash the password if it's provided
    const updates = {};
    if (first_name) updates.first_name = first_name;
    if (last_name) updates.last_name = last_name;

    if (password) {
        const hashedPassword = bcrypt.hashSync(password, 10);
        updates.password = hashedPassword; // Use synchronous method for simplicity
    }

    // Update user in the database
    db.query('UPDATE users SET ? WHERE id = ?', [updates, req.user.userId], (error) => {
        if (error) {
            console.error('Database error during user update:', error); // Logging error
            return res.status(500).json({ message: 'Failed to update user information' });
        }

        res.status(200).json({ message: 'User information updated successfully!' });
    });
});

// Route to change user password
server.put('/change-password', authenticateToken, async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both old and new passwords are required.' });
    }

    // Retrieve the user from the database
    db.query('SELECT * FROM users WHERE id = ?', [req.user.userId], async (error, results) => {
        if (error) {
            console.error('Database error during fetching user for password change:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];

        // Compare the old password with the stored password
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Old password is incorrect.' });
        }

        // Hash the new password
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        db.query('UPDATE users SET password = ? WHERE id = ?', [hashedNewPassword, req.user.userId], (updateError) => {
            if (updateError) {
                console.error('Database error during password update:', updateError);
                return res.status(500).json({ message: 'Failed to update password' });
            }

            res.status(200).json({ message: 'Password changed successfully!' });
        });
    });
});
  
// Route to create/update/delete prerequisites by admin
// server.route('/api/admin/prerequisites')
//     .post(verifyToken, (req, res) => {
//         const { prerequisites } = req.body;  // Expect an array of prerequisites with prereq_id and is_enabled

//         // Create a Promise array for updating each prerequisite individually
//         const updatePromises = prerequisites.map(prereq => {
//             const { prereq_id, is_enabled } = prereq;
//             const query = 'UPDATE prerequisites SET is_enabled = ? WHERE prereq_id = ?';

//             return new Promise((resolve, reject) => {
//                 db.query(query, [is_enabled, prereq_id], (err, result) => {
//                     if (err) {
//                         console.error('Error updating prerequisite status:', err);
//                         reject(err);
//                     } else {
//                         resolve(result);
//                     }
//                 });
//             });
//         });

//         // Execute all updates in parallel and send a response once completed
//         Promise.all(updatePromises)
//             .then(() => res.status(200).json({ message: 'Prerequisite statuses updated successfully' }))
//             .catch(err => res.status(500).json({ message: 'Failed to update prerequisites', error: err }));
//     });


// Route to fetch all courses
server.get('/courses', (req, res) => {
    const query = 'SELECT course_id, course_level, course_tag, course_name FROM courses';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching courses:', err);
            return res.status(500).json({ error: 'Failed to fetch courses' });
        }
        res.json(results);
    });
});

// Route to fetch all prerequisites
server.get('/prerequisites', (req, res) => {
    const query = 'SELECT prereq_id, level, CONCAT(prereq_tag,\" - \", prereq_name) AS prereqName FROM prerequisites';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching prerequisites:', err);
            return res.status(500).json({ error: 'Failed to fetch prerequisites' });
        }
        res.json(results);
    });
});


// Route to fetch only enabled prerequisites for student 
server.get('/student/prerequisites', (req, res) => {
    const query = 'SELECT prereq_id, level, CONCAT(prereq_tag,\" - \", prereq_name) AS prereqName FROM prerequisites WHERE is_enabled = "1"';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching prerequisites:', err);
            return res.status(500).json({ error: 'Failed to fetch prerequisites' });
        }
        res.json(results);
    });
});


server.post("/admin/prerequisites", (req, res) => {
    if (req.body.toggleVal === true)
    {
      db.execute("UPDATE prerequisites SET is_enabled='1' WHERE prereq_id=?",
        [req.body.preReq_ID],
        function(err, result) { 
          if (err) {
            res.json({ 
              status:400,
              message: "Failed to set 'is_enabled' to 'true'",
            });
          } else {
            res.json({
              status:200,
              message: "Successfully set 'is_enabled' to 'true'",
              data: result, 
            }); 
          } 
        } 
      );
    } else if (req.body.toggleVal === false) {
      db.execute("UPDATE prerequisites SET is_enabled='0' WHERE prereq_id=?",
        [req.body.preReq_ID],
        function(err, result) { 
          if (err) {
            res.json({ 
              status:400,
              message: "Failed to set 'is_enabled' to 'false'",
            });
          } else {
            res.json({
              status:200,
              message: "Successfully set 'is_enabled' to 'false'",
              data: result, 
            }); 
          } 
        } 
      );
    }
  });
  

// Route to manage student advising records


server.post('/student/create-advising-form', (req, res) => {
    const { newAdvisingEntry, userId } = req.body; // Extract advising data and user ID from request body

    // Get today's date for advising_date
    const advisingDate = new Date().toISOString().split('T')[0]; // Format to YYYY-MM-DD

    // Destructure fields from newAdvisingEntry with default values to prevent NULL values
    const {
        lastTerm = 'N/A',          // Default to 'N/A' if not provided
        lastGPA = 0.0,             // Default GPA, modify as needed
        advisingTerm = 'N/A',      // Default advising term
        prerequisites = [],        // Default to an empty array
        coursePlan = []            // Default to an empty array
    } = newAdvisingEntry;

    const status = 'Pending'; // Default status is "Pending"

    // Define the query to insert data into the course_advising_history table
    const query = `
        INSERT INTO course_advising_history (advising_id, advising_date, last_term, last_gpa, advising_term, prerequisites, course_plan, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Insert the data into the database
    db.query(
        query,
        [
            userId,
            advisingDate,
            lastTerm,
            lastGPA,
            advisingTerm,
            JSON.stringify(prerequisites),  // Convert arrays to JSON strings
            JSON.stringify(coursePlan),
            status
        ],
        (err, result) => {
            if (err) {
                console.error('Error creating advising record:', err);
                return res.status(500).json({ message: 'Failed to create advising record' });
            }
            res.status(201).json({ message: 'Advising record created successfully', id: result.insertId });
        }
    );
});



// Get Advising History
server.get('/advising-history', authenticateToken, async (req, res) => {
    try {
      // Assuming the user is identified by their ID in the JWT token
      const userId = req.user.id;  // decoded user ID from the JWT token
  
      const query = `
        SELECT advising_date, advising_term, prerequisites, course_plan, status
        FROM course_advising_history
        ORDER BY advising_date DESC
      `;
      
      // Execute the query to fetch advising history for the authenticated user
      db.query(query, [userId], (error, results) => {
        if (error) {
          console.error('Database query error:', error);
          return res.status(500).json({ message: 'Internal Server Error' });
        }
  
        if (results.length === 0) {
          return res.status(404).json({ message: 'No advising history found' });
        }
  
        // Send the advising history as a response
        res.status(200).json(results);
      });
    } catch (error) {
      console.error('Error fetching advising history:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

server.put('/update-advising-status/:id', async (req, res) => {
  const { id } = req.params;
  const { status, feedback } = req.body;

  try {
    // Update the course_advising_history table
    const result = db.query(
        "UPDATE course_advising_history SET status = ?, feedback = ? WHERE advising_id = ?",
        [status, feedback, id]
    );

    if (result.affectedRows > 0) {
      res.status(200).json({ message: "Status updated successfully." });
    } else {
      res.status(404).json({ message: "Advising entry not found." });
    }
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});
  

  
// Route to log out
server.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

export default server;