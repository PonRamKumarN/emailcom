import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Import the CSS file

function Dashboard() {
  const [user, setUser] = useState(null);
  const [communications, setCommunications] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/user', { withCredentials: true })
      .then(response => setUser(response.data))
      .catch(error => {
        console.error('Error fetching user:', error);
        navigate('/'); // Redirect to login if not authenticated
      });

    axios.get('/api/communications', { withCredentials: true })
      .then(response => setCommunications(response.data))
      .catch(error => console.error('Error fetching communications:', error));
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-heading">Dashboard</h1>
      {user && <p className="welcome-message">Welcome, {user.displayName}</p>}
      <Link to="/compose" className="compose-link">Compose Email</Link>
      <h2 className="communication-history-heading">Communication History</h2>
      <ul className="communication-list">
        {communications.map(comm => (
          <li key={comm._id} className="communication-item">
            <span className="subject">{comm.subject}</span> - <span className="status">{comm.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
