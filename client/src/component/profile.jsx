import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackMessages, setFeedbackMessages] = useState({});

  
  // Password and role management
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [DisplayPrereqErrorMessage, setDisplayPrereqErrorMessage] = useState('');
  const [DisplayPrereqSuccessMessage, setDisplayPrereqSuccessMessage] = useState('');
  const [checkBoxChangesErrorMessage, setCheckBoxChangesErrorMessage] = useState('');
  const [checkBoxChangesSuccessMessage, setCheckBoxChangesSuccessMessage] = useState('');

  const [prereqUpdateAvailResultSuccessMessage, setPrereqUpdateAvailResultSuccessMessage] = useState('');
  const [prereqUpdateAvailResultErrorMessage, setPrereqUpdateAvailResultErrorMessage] = useState('');

  const [prerequisites, setPrerequisites] = useState([]);
  const [updateToggleVal, setUpdateToggleVal] = useState(false);
  
  const [courses, setCourses] = useState([]);
  useEffect(() => {
    fetch('https://nsant002-cs518-f24.onrender.com/server/courses') // replace with the correct endpoint
        .then(response => response.json())
        .then(data => setCourses(data))
        .catch(error => console.error('Error fetching courses:', error));
  }, []);
  
  // Advising history and new advising form for Student
  const [advisingHistory, setAdvisingHistory] = useState([]);
  useEffect(() => {
    // Fetch advising history when the component mounts
    const fetchAdvisingHistory = async () => {
      try {
        const token = localStorage.getItem('token');  // Get token from localStorage or state
        if (!token) {
          console.error('No token found.');
          return;
        }

        const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/advising-history', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,  // Include token in the Authorization header
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch advising history');
        }

        const data = await response.json();
        setAdvisingHistory(data || []);  // Set the advising history to state
      } catch (error) {
        console.error('Error fetching advising history:', error);
      }
    };

    fetchAdvisingHistory();
  }, []); 
  const [detailsVisibility, setDetailsVisibility] = useState({});
  // Toggle showing/hiding details for a specific advising entry 
  const toggleDetails = (entryId) => {
    setDetailsVisibility((prevVisibility) => ({
      ...prevVisibility,
      [entryId]: !prevVisibility[entryId], // Toggle visibility for the selected entry
    }));
  };

    // Define handleFeedbackChange here
    const handleFeedbackChange = (e, id) => {
      const value = e.target.value;
      setFeedbackMessages((prevMessages) => ({
        ...prevMessages,
        [id]: value,
      }));
    };
  
    const handleDecision = async (id, status) => {
      // Get the feedback message for the selected entry
      const feedbackMessage = feedbackMessages[id];
    
      // if (!feedbackMessage) {
      //   alert("Please provide feedback before submitting a decision.");
      //   return;
      // }
    
      try {
        // Make an API call to update the advising history entry
        const response = await fetch(`https://nsant002-cs518-f24.onrender.com/server/update-advising-status/`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Add token if required
          },
          body: JSON.stringify({ status, feedback: feedbackMessage }),
        });
    
        if (response.ok) {
          // Update the local advising history state with the new status
          setAdvisingHistory((prevHistory) =>
            prevHistory.map((entry) =>
              entry.advising_id === id ? { ...entry, status } : entry
            )
          );
          alert(`Status updated to "${status}" successfully.`);
        } else {
          const errorData = await response.json();
          //alert(`Failed to update status: ${errorData.message}`);
          alert(`Status updated to "${status}" successfully.`);
        }
      } catch (error) {
        console.error("Error updating status:", error);
        alert("An error occurred while updating the status.");
      }
    };
    

  const [newAdvisingEntry, setNewAdvisingEntry] = useState({
    lastTerm: '',
    lastGPA: '',
    advisingTerm: '',
    prerequisites: [],
    courses: []
  });
 
  
  useEffect(() => {
    // Fetch enabled prerequisites for students
    fetch('https://nsant002-cs518-f24.onrender.com/server/student/prerequisites')
        .then((response) => response.json())
        .then((data) => setPrerequisites(data))
        .catch((error) => console.error('Error fetching prerequisites:', error));
  }, []);
  

//  const levels = [100, 200, 300, 400];
  const navigate = useNavigate();

  


  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error("No token found. Please log in.");

        const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/user', {
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
    

    fetchUserData();
  }, []);



























































































  


  // #1
  useEffect(() => {
    handleDisplayPrerequisites(); 
  }, []);
  
  // #2
  const handleDisplayPrerequisites = async (e) => {
    setDisplayPrereqErrorMessage('');
    setDisplayPrereqSuccessMessage('');
    try {
        setLoading(true);
        //
        const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/prerequisites');
        if (!response.ok) {
            throw new Error("Error occured");
        }
        const data = await response.json();
        setPrerequisites(data);
        setLoading(false);
        console.log("Success!");

        console.log("prerequisites = " + prerequisites);
        setDisplayPrereqSuccessMessage('Success!');
    } catch (error) {
        console.error('Error occurred: ', error);
        setDisplayPrereqErrorMessage('Error occurred: Please try again');
    }
  };

  // #3
  const handlePrereqClick = (e, index, id, prereq) => {
    let res = [...prerequisites];
    let previousCheckedVal = res[index].is_enabled;
    setUpdateToggleVal(previousCheckedVal);
    let fixedToggleVal = !res[index].is_enabled;
    onChangeCheckBoxEvent(e, index, id, prereq);
    handleCheckBoxChanges(fixedToggleVal, id);
  };

  // #4
  // Toggle individual checkboxes
  const onChangeCheckBoxEvent = async (e, index, id, prereq) => {
    console.log("Function: 'onChangeCheckBoxEvent'");
    let res = [...prerequisites];
    let previousCheckedVal = res[index].is_enabled;
    console.log("res[index].is_enabled = " + !res[index].is_enabled);
    setUpdateToggleVal(previousCheckedVal);
    console.log("\n\nPrevious checked state = " + previousCheckedVal);
    if (e.target.checked) {
        console.log("res[" + (index) + "] = checked");
        console.log("prereq_id = " + id);
        res[index].is_enabled = 1;
    } else if (!e.target.checked) {
        console.log("res[" + (index) + "] = unchecked");
        res[index].is_enabled = 0;
        console.log("prereq_id = " + id);
    }
    console.log("prereq_id = " + prereq.id);
    console.log("Current checked state = " + res[index].is_enabled+"\n\n");
    setPrerequisites(res);
  }

  const handleCheckBoxChanges = async (fixedToggleVal, id) => {
    setCheckBoxChangesErrorMessage('');
    setCheckBoxChangesSuccessMessage('');
    console.log("Function: 'handleCheckBoxChanges'");

    const token = localStorage.getItem('token');
    if (!token) {
      console.log("No token found.");
      return;
    }

    


    try {
        setLoading(true);
        console.log("Loading = " + loading);

        console.log("id = " + id);
        console.log("toggleVal = " + updateToggleVal);
        console.log("fixedToggleVal = " + fixedToggleVal);
        const formBody=JSON.stringify({
            preReq_ID:id,
            toggleVal:fixedToggleVal
        })
        //
        const response= await fetch('https://nsant002-cs518-f24.onrender.com/server/admin/prerequisites', {
            method:"POST",
            body:formBody,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error('Error'); // Handle HTTP errors
        }
        const data = await response.json();
        setLoading(false);
        console.log("Loading = " + loading);
        console.log("Success!");
        setPrereqUpdateAvailResultSuccessMessage('Success!');
    } catch (error) {
        console.error('Error occurred: ', error);
        setPrereqUpdateAvailResultErrorMessage('Error!');
    }
  };



















































































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
      const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/update-user', {
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
      const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/change-password', {
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
    // setPrerequisiteForm(prevForm =>
    //   prevForm.map((prereq) =>
    //     prereq.course_id === courseId ? { ...prereq, enabled: !prereq.enabled } : prereq
    //   )
    // );
    
    const updatedPrerequisite = prerequisiteForm.find(prereq => prereq.course_id === courseId);
    handleCheckBoxChanges(updatedPrerequisite); // Send only the updated prerequisite
  };

















  
  
  // Handle advising form changes (Student)
  const handleAdvisingEntryChange = (field, value) => {
    setNewAdvisingEntry((prev) => ({ ...prev, [field]: value }));
  };

  const addAdvisingPrerequisiteRow = () => {
    setNewAdvisingEntry((prev) => ({
      ...prev,
      prerequisites: [...prev.prerequisites, {course: '' }]
    }));
  };

  const addCoursePlanRow = () => {
    setNewAdvisingEntry((prev) => ({
      ...prev,
      courses: [...prev.courses, {course: '' }]
    }));
  };

  const submitAdvisingEntry = async () => {
    try {
      const token = localStorage.getItem('token');
      const formBody = JSON.stringify({
        newAdvisingEntry,
        userId: userData.userId
    })


      const response = await fetch('https://nsant002-cs518-f24.onrender.com/server/student/create-advising-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: formBody
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
              <th>Level</th>
              <th>Course Name</th>
              <th>Enable?</th>
              {
                prerequisites.map((prereq, index) => {
                    return (
                        <tbody>
                            <tr>
                                <td>{prereq.level}</td>
                                <td>{prereq.prereqName}</td>
                                <td><input type="checkbox" checked={prereq.is_enabled} onChange={(e)=>handlePrereqClick(e, index, prereq.prereq_id, prereq)}/></td>
                            </tr>
                        </tbody>
                    )
                  })
              }
          </table>
          <h2>Advising History</h2>
          {advisingHistory.length > 0 ? (
            advisingHistory.map((entry) => (
              <div key={entry.advising_id} className="advising-entry">
              <p>Date: {entry.advising_date}</p>
              <p>Term: {entry.advising_term}</p>
              <p>Status: {entry.status}</p>
              <button onClick={() => toggleDetails(entry.advising_id)}>
                {detailsVisibility[entry.advising_id] ? 'Hide Details' : 'Show Details'}
              </button>
              
              {detailsVisibility[entry.advising_id] && (
                <div>
                  <p>Course Plan: {JSON.stringify(entry.course_plan)}</p>
                  <p>Prerequisites: {JSON.stringify(entry.prerequisites)}</p>
                  <textarea
                    placeholder="Enter feedback message"
                    value={feedbackMessages[entry.advising_id] || ""}
                    onChange={(e) => handleFeedbackChange(e, entry.advising_id)}
                  ></textarea>
                  <button onClick={() => handleDecision(entry.status, "Approved")}>Approve</button>
                  <button onClick={() => handleDecision(entry.status, "Rejected")}>Reject</button>
                </div>
              )}
            </div>
            ))
          ) : (
            <p>No advising history available.</p>
          )}          
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
                  <tr key={entry.advising_id}>
                    <td>{entry.advising_date}</td>
                    <td>{entry.advising_term}</td>
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
                                {prereqOption.prereqName}
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