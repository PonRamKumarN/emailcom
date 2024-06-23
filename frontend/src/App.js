import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ComposeEmail from './components/ComposeEmail';
import { useEffect } from 'react';


function App() { 
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/compose" element={<ComposeEmail />} />
      </Routes>
    </Router>
  );
}

export default App;