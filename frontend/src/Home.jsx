
import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      <nav className="navbar">
        <div className="logo">🍃 FoodBridge</div>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#impact">Our Impact</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-buttons">
          <Link to="/login">
            <button className="login-btn">Login</button>
          </Link>

          <Link to="/register">
            <button className="register-btn">Register</button>
          </Link>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <span className="tagline">
            TOGETHER FOR A BETTER TOMORROW
          </span>

          <h1>
            Share Food.
            <br />
            <span>Spread Happiness.</span>
          </h1>

          <p>
            FoodBridge connects people who have extra food
            with those who need it. Together, we can reduce
            food waste and fight hunger.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <button className="donate-btn">
                Donate Food ❤️
              </button>
            </Link>

            <Link to="/register">
              <button className="find-btn">
                Find Food →
              </button>
            </Link>
          </div>
        </div>

        <div className="hero-image">
          <img
            src="/src/assets/food.jpg"
            alt="Fresh food ready to share"
            className="food-photo"
          />
          <h2>Good Food, Good Deeds!</h2>
          <p>Every meal shared makes a difference.</p>
        </div>
      </section>

      <section className="about" id="about">
        <h2>What is FoodBridge?</h2>
        <p>
          FoodBridge brings food donors and people in need
          together. Our mission is to make surplus food
          accessible and reduce food waste.
        </p>
      </section>

      <section className="impact" id="impact">
        <h2>Small Actions, Big Impact</h2>

        <div className="impact-cards">
          <div className="impact-card">
            <h3>🥗</h3>
            <h4>Reduce Food Waste</h4>
            <p>Give surplus food a second chance.</p>
          </div>

          <div className="impact-card">
            <h3>🤝</h3>
            <h4>Help Communities</h4>
            <p>Connect with people who need food.</p>
          </div>

          <div className="impact-card">
            <h3>🌍</h3>
            <h4>Build a Better World</h4>
            <p>Make sharing food a daily habit.</p>
          </div>
        </div>
      </section>

      <footer id="contact">
        <h2>🍃 FoodBridge</h2>
        <p>Connecting food donors with people in need.</p>
        <p>© 2026 FoodBridge. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default Home;
