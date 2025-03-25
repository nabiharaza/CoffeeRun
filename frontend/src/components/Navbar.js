import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="brand">Coffee Run</Link>
        <div className="nav-links">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/groups/new">New Group</Link>
          <Link to="/add-user">Add User</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
