// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import Navbar from './components/Navbar';
import Dashboard from './pages/dashboard/dashboard';
import GroupDetail from './pages/GroupDetail';
import Create_group from './pages/create_group/create_group';
import CreateExpense from './pages/CreateExpense';
import UserProfile from './pages/UserProfile';
import Add_user from './pages/add_user/add_user';
import Home from './pages/Home';

function App() {
  return (
    <Router>
      <div className="App coffee-bg">
        <Navbar />
        <main className="container mx-auto px-4 py-8">
          <Routes>

            <Route path="/" element={<Home />} />  
            <Route path="/groups/:groupId/expenses/new" element={<CreateExpense />} />
            <Route path="/groups/:groupId" element={<GroupDetail />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/add-user" element={<Add_user />} />
            <Route path="/profile/:userId" element={<UserProfile />} />
            <Route path="/groups/new" element={<Create_group />} />
            <Route path="/create-group" element={<Create_group />} />

          </Routes>
        </main>
        <ToastContainer position="bottom-right" />
      </div>
    </Router>
  );
}

export default App;