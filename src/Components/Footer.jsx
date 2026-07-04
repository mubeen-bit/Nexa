import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo">SeniorJRTalks</h2>
          <p className="footer-description">
            Building modern web experiences with clean and scalable solutions.
          </p>
        </div>

        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            {/* <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/projects">Projects</a>
            </li> */}
            <li>
              <a href="/contact">Contact us</a>
            </li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>Follow</h3>
          <div className="footer-socials">
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
            <a href="#">Instagram</a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} SeniorJRTalks. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
