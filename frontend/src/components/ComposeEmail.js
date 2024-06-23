import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ComposeEmail.css'; // Import the CSS file

function ComposeEmail() {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [templateId, setTemplateId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/send-email', {
        to,
        subject,
        body,
        templateId
      }, { withCredentials: true });
      alert('Email sent successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Failed to send email');
    }
  };

  return (
    <div className="compose-email">
      <h1>Compose Email</h1>
      <form onSubmit={handleSubmit} className="compose-email-form">
        <input 
          type="email" 
          value={to} 
          onChange={(e) => setTo(e.target.value)} 
          placeholder="To" 
          required 
          className="form-input"
        />
        <input 
          type="text" 
          value={subject} 
          onChange={(e) => setSubject(e.target.value)} 
          placeholder="Subject" 
          required 
          className="form-input"
        />
        <textarea 
          value={body} 
          onChange={(e) => setBody(e.target.value)} 
          placeholder="Body" 
          required 
          className="form-textarea"
        />
        <input 
          type="text" 
          value={templateId} 
          onChange={(e) => setTemplateId(e.target.value)} 
          placeholder="Template ID" 
          required 
          className="form-input"
        />
        <button type="submit" className="form-button">Send</button>
      </form>
    </div>
  );
}

export default ComposeEmail;
