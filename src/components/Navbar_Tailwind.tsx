import React, { useState } from 'react';

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
    <nav className={`bg-white shadow-lg border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand */}
          <div className="flex items-center">
            <a href="/" className="flex items-center space-x-2 text-gray-900 hover:text-primary-600 transition-colors">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center text-lg">
                {brandIcon}
              </div>
              <span className="text-xl font-bold">{brandName}</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              <a
                href="#home"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Services
              </a>
              <a
                href="#about"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Contact
              </a>
              <button className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                Sign In
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-50 rounded-lg mt-2">
              <a
                href="#home"
                className="block text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Home
              </a>
              <a
                href="#services"
                className="block text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Services
              </a>
              <a
                href="#about"
                className="block text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                About
              </a>
              <a
                href="#contact"
                className="block text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md text-base font-medium transition-colors"
                onClick={handleMenuItemClick}
              >
                Contact
              </a>
              <button className="w-full text-left bg-primary-600 text-white px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
