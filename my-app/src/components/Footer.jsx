import React from "react";
import { useSelector } from "react-redux";
import "../css/Footer.css";

const Footer = () => {
  const user = useSelector((state) => state.auth.user); // Check if user is authenticated

  return (
    <footer className="footer">
      <div className="footer-container container">
        {/* Navigation Links - Only for authenticated users */}
        {user && (
          <div className="footer-section footer-links">
            <h3>Quick Links</h3>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/restaurants">Restaurants</a></li>
              <li><a href="/profile">Profile</a></li>
            </ul>
          </div>
        )}

        {/* Contact Information - Visible for all */}
        <div className="footer-section footer-contact">
          <h3>Contact Us</h3>
          <p>Email: <a href="mailto:support@Lamborjeimyn.kz">support@Lamborjeimyn.kz</a></p>
          <p>Phone: <a href="tel:+7 778 8494 017">+7 778 8494 017</a></p>
          <p>Address: Gde to za morem, za mechtami...</p>
        </div>

        {/* Social Media Icons - Visible for all */}
        <div className="footer-section footer-social">
          <h3>Follow Us</h3>
          <div className="social-icons">
            <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" fill="#6B1E3A"/>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.326 3.608 1.301.975.975 1.24 2.242 1.301 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.326 2.633-1.301 3.608-.975.975-2.242 1.24-3.608 1.301-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.326-3.608-1.301-.975-.975-1.24-2.242-1.301-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.326-2.633 1.301-3.608.975-.975 2.242-1.24 3.608-1.301 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-1.453.066-2.944.402-4.064 1.522-1.12 1.12-1.456 2.611-1.522 4.064-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.066 1.453.402 2.944 1.522 4.064 1.12 1.12 2.611 1.456 4.064 1.522 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.453-.066 2.944-.402 4.064-1.522 1.12-1.12 1.456-2.611 1.522-4.064.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.066-1.453-.402-2.944-1.522-4.064-1.12-1.12-2.611-1.456-4.064-1.522-1.28-.058-1.688-.072-4.947-.072z" fill="#6B1E3A"/>
                <path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-7.998 3.999 3.999 0 010 7.998z" fill="#6B1E3A"/>
                <circle cx="18.406" cy="5.594" r="1.44" fill="#6B1E3A"/>
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.731 0 1.324-.593 1.324-1.325V1.325C24 .593 23.407 0 22.675 0z" fill="#6B1E3A"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
      {/* Copyright Notice - Visible for all */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} Lamborjeimyn. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
