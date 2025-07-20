import React, { useState } from 'react';
import './Navbar.css';

interface NavbarProps {
  brandName?: string;
  brandIcon?: string;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ 
  brandName = "FasFas", 
  brandIcon = "🏢",
  className = ""
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar ${className}`}>
      <div className="navbar-container">
        <a href="/" className="navbar-brand">
          <div className="navbar-logo">{brandIcon}</div>
          {brandName}
        </a>
        
        <ul className={`navbar-nav ${isMenuOpen ? 'open' : ''}`}>
          <li>
            <a 
              href="/partner-portal" 
              className="active"
              onClick={handleMenuItemClick}
            >
              Partner Portal
            </a>
          </li>
          <li>
            <a 
              href="/services"
              onClick={handleMenuItemClick}
            >
              Services
            </a>
          </li>
          <li>
            <a 
              href="/support"
              onClick={handleMenuItemClick}
            >
              Support
            </a>
          </li>
          <li>
            <a 
              href="/about"
              onClick={handleMenuItemClick}
            >
              About
            </a>
          </li>
        </ul>
        
        <div className="navbar-actions">
          <a href="/login" className="navbar-btn">
            Login
          </a>
          <a href="/signup" className="navbar-btn primary">
            Get Started
          </a>
        </div>
        
        <button 
          className="navbar-toggle" 
          onClick={toggleMenu}
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? '✕' : '☰'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
