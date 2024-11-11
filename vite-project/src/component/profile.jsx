import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Password and role management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Prerequisites and course plan for Admin
  const [prerequisites, setPrerequisites] = useState([]);
  const [courses, setCourses] = useState([]);
  const [prerequisiteForm, setPrerequisiteForm] = useState(
    courses.map(course => ({
      course_id: course.course_id,
      enabled: course.enabled || false, // Default to false if not set
      disabled: !course.enabled         // Default to true if enabled is false
    }))
  );  
  
  // Advising history and new advising form for Student
  const [advisingHistory, setAdvisingHistory] = useState([]);
  const [newAdvisingEntry, setNewAdvisingEntry] = useState({
    lastTerm: '',
    lastGPA: '',
    advisingTerm: '',
    prerequisites: [],
    courses: []
  });
  
//  const levels = [100, 200, 300, 400];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No token found. Please log in.");

        const response = await fetch('http://localhost:3000/api/user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch user data.');

        const data = await response.json();
        setUserData(data);
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setIsAdmin(data.role === 'admin');
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchCoursesAndPrerequisites = async () => {
      const token = localStorage.getItem('token');
      const prerequisitesResponse = await fetch('http://localhost:3000/api/prerequisites', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      const prerequisitesData = await prerequisitesResponse.json();
      setCourses(prerequisitesData);
      setPrerequisiteForm(prerequisitesData.map(prereq => ({
        course_id: prereq.course_id,
        enabled: prereq.is_enabled === 1,
      })));
    };
    
    fetchUserData();
    fetchCoursesAndPrerequisites();
  }, []);

  // Handle profile edit
  const handleEditProfile = () => {
    setIsEditing(true);
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    setFirstName(userData.first_name); // Reset to original value
    setLastName(userData.last_name); // Reset to original value
  };
  
  const handleCancelChangePassword = () => {
    setShowChangePassword(false);
    setCurrentPassword(''); // Reset current password input
    setNewPassword(''); // Reset new password input
    setConfirmPassword(''); // Reset confirm password input
  };
  

  const saveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/update-user', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ first_name: firstName, last_name: lastName }),
      });

      if (!response.ok) throw new Error('Failed to update profile.');

      const data = await response.json();
      setUserData(data);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      setError('Error updating profile: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });

      if (!response.ok) throw new Error('Failed to change password.');

      alert('Password changed successfully.');
      setShowChangePassword(false);
    } catch (error) {
      setError('Error changing password: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/'); // redirect to login
  };

  // Handle prerequisite checkbox change (Admin)
  const handlePrerequisiteChange = (courseId) => {
    setPrerequisiteForm(prevForm =>
      prevForm.map((prereq) =>
        prereq.course_id === courseId ? { ...prereq, enabled: !prereq.enabled } : prereq
      )
    );
    
    const updatedPrerequisite = prerequisiteForm.find(prereq => prereq.course_id === courseId);
    handleCheckBoxChanges(updatedPrerequisite); // Send only the updated prerequisite
  };


  // Send updated checkbox state to server
  const handleCheckBoxChanges = async (updatedPrerequisite) => {
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("No token found.");
      return;
    }

    // Toggle is_enabled value based on the checkbox state
    const updatedData = {
      ...updatedPrerequisite,
      is_enabled: updatedPrerequisite.enabled ? 1 : 0 // Toggle between 1 and 0 for enabled/disabled state
    };    

    try {
      const response = await fetch('http://localhost:3000/api/admin/prerequisites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Failed to update prerequisite status');
      console.log("Prerequisite status updated successfully.");
    } catch (error) {
      console.error('Error updating prerequisite:', error);
    }
  };
  
  // Handle advising form changes (Student)
  const handleAdvisingEntryChange = (field, value) => {
    setNewAdvisingEntry((prev) => ({ ...prev, [field]: value }));
  };

  const addAdvisingPrerequisiteRow = () => {
    setNewAdvisingEntry((prev) => ({
      ...prev,
      prerequisites: [...prev.prerequisites, { level: '', course: '' }]
    }));
  };

  const addCoursePlanRow = () => {
    setNewAdvisingEntry((prev) => ({
      ...prev,
      courses: [...prev.courses, { level: '', course: '' }]
    }));
  };

  const submitAdvisingEntry = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/student/create-advising-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdvisingEntry), //investigate, this is where the form is failing in submitting
      });

      if (!response.ok) throw new Error('Failed to save advising entry.');

      alert('Advising entry saved successfully.');
      setNewAdvisingEntry({ lastTerm: '', lastGPA: '', advisingTerm: '', prerequisites: [], courses: [] });
    } catch (error) {
      alert('Error saving advising entry: ' + error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      {userData && (
        <div className="profile-info">
          <p><strong>Email Address:</strong> {userData.email}</p>
          <p>
            <strong>First Name: </strong> 
            {isEditing ? (
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            ) : (
              userData.first_name
            )}
          </p>
          <p>
            <strong>Last Name: </strong> 
            {isEditing ? (
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            ) : (
              userData.last_name
            )}
          </p>
          {isEditing ? (
            <>
              <button onClick={saveProfile}>Save Profile</button>
              <button onClick={handleCancelEdit}>Cancel</button> {/* Cancel button */}
            </>
          ) : (
            <button onClick={handleEditProfile}>Edit Profile</button>
          )}
          <button onClick={() => setShowChangePassword(!showChangePassword)}>Change Password</button>
          {showChangePassword && (
            <div>
              <input type="password" placeholder="Current Password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              <input type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button onClick={handleChangePassword}>Submit Password Change</button>
              <button onClick={handleCancelChangePassword}>Cancel</button> {/* Cancel button */}
            </div>
          )}
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}


      {isAdmin ? (
        <div className="admin-portal">
          <h2>Admin Course Prerequisite Management</h2>
          <table className="prerequisite-table">
            <thead>
              <tr>
                <th>Level</th>
                <th>Course</th>
                <th>Enable</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course, index) => (
                <tr key={index}>
                  <td>{course.level}</td>
                  <td>{course.prereq_tag} - {course.prereq_name}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={prerequisiteForm[index]?.enabled}
                      onChange={() => handlePrerequisiteChange(course.course_id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="student-portal">
          <h2>Advising History</h2>
          {advisingHistory.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Term</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {advisingHistory.map((entry) => (
                  <tr key={entry.id}>
                    <td>{entry.date}</td>
                    <td>{entry.term}</td>
                    <td>{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No advising history available.</p>
          )}

          <h2>New Advising Entry</h2>
          <form onSubmit={submitAdvisingEntry} >
            <div>
              <label>Last Term</label>
              <input type="text" required value={newAdvisingEntry.lastTerm} onChange={(e) => handleAdvisingEntryChange('lastTerm', e.target.value)} />
            </div>
            <div>
              <label>Last GPA</label>
              <input type="text" required value={newAdvisingEntry.lastGPA} onChange={(e) => handleAdvisingEntryChange('lastGPA', e.target.value)} />
            </div>
            <div>
              <label>Advising Term</label>
              <input type="text" required value={newAdvisingEntry.advisingTerm} onChange={(e) => handleAdvisingEntryChange('advisingTerm', e.target.value)} />
            </div>

            <h3>Prerequisites</h3>
            {newAdvisingEntry.prerequisites.map((prereq, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <label>Select Prerequisite Course</label>
                <select
                  value={prereq.course}
                  onChange={(e) => {
                    const updatedPrereqs = [...newAdvisingEntry.prerequisites];
                    updatedPrereqs[index].course = e.target.value;
                    setNewAdvisingEntry((prev) => ({ ...prev, prerequisites: updatedPrereqs }));
                  }}
                >
                  <option value="">Select Course</option>
                  {prerequisites.map((prereqOption) => (
                    <option key={prereqOption.prereq_id} value={prereqOption.prereq_id}>
                      {prereqOption.prereq_name} ({prereqOption.prereq_tag})
                    </option>
                  ))}
                </select>
              </div>
            ))}
            <button type="button" onClick={addAdvisingPrerequisiteRow}>Add Prerequisite</button>

            <h3>Course Plan</h3>
            {newAdvisingEntry.courses.map((course, index) => (
              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                {/* Course dropdown, filtered by selected level */}
                <label>Select Course</label>
                <select value={course.course_name} onChange={(e) => handleAdvisingEntryChange(index, 'course', e.target.value)}>
                  <option value="">Course</option>
                  {courses
                    .filter((courseItem) => courseItem.level === course.course_level) // Filter courses by selected level
                    .map((courseItem) => (
                      <option key={courseItem.course_id} value={courseItem.course_id}>
                        {courseItem.course_name} ({courseItem.course_tag})
                      </option>
                    ))}
                </select>
              </div>
            ))}

            <button type="button" onClick={addCoursePlanRow}>Add Course</button>
          </form>
          
        <button type="submit" onClick={submitAdvisingEntry}>Submit Advising Form</button>
        </div>
      )}

    </div>
  );
};

export default Profile;