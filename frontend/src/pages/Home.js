import React from 'react';
import { Link } from 'react-router-dom';
import coffeeImage from '../images/coffeeimg.png'; 
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1 className="home-title">Who’s Paying for Coffee Today?</h1>
        <p className="home-description">
          Coffee Run helps groups of coworkers decide who should pay for coffee based on each person’s order. No more awkward moments at checkout. We’ve got you covered!
        </p>
        <p className="home-description">
          Track everyone’s favorite drinks and ensure fairness in your coffee shop routine.
        </p>

        {/* Link to Dashboard */}
        <div>
          <Link to="/dashboard" className="home-button">
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Hero Image at the bottom */}
      <img
        src={coffeeImage}
        alt="Coffee Shop"
        className="hero-image"
      />
    </div>
  );
};

export default Home;
